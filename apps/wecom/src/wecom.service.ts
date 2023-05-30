/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CONFIG } from 'libs/shared/shared.module';
import { WecomApiService } from './api/wecomApi.service';
import { TianApiService } from './api/tianApi.service';
import * as _ from 'lodash';
import * as fs from 'fs';
import { getConfig } from '@app/common/getConfig';
import { TemplateService } from './templates/template.service';
import * as dayjs from 'dayjs';
import * as moment from 'moment';
import { JuheApiService } from './api/juheApi.service';
import { getRandomRange } from '@app/common/utils';
import { getContentByDay } from './templates/memorial';
import { getCustomMessage } from './templates/customMessage';

@Injectable()
export class WecomService implements OnApplicationBootstrap {
  private readonly MENU_MAP: any;
  private readonly msgConfig: any;
  constructor(
    @Inject(CONFIG) private readonly config: any,
    private readonly wecomApiService: WecomApiService,
    private readonly tianApiService: TianApiService,
    private readonly juheApiService: JuheApiService,
    private readonly templateService: TemplateService,
  ) {
    this.msgConfig = getConfig().loveMsg;
    this.MENU_MAP = {
      '#sendmsg#_0_0#7599824568204778': '今日天气',
      '#sendmsg#_0_1#7599824568204779': '今日日期',
      '#sendmsg#_0_2#7599824568204780': '今日头条',
      '#sendmsg#_0_3#7599824568204781': '今日英语',
      '#sendmsg#_0_4#7599824568204777': '今日一言',
      '#sendmsg#_1_0#7599827764207063': '故事大全',
      '#sendmsg#_1_1#7599827764207067': '雷人笑话',
      '#sendmsg#_1_2#7599827764207068': '每日简报',
      '#sendmsg#_1_3#7599827764207070': '土味情话',
      '#sendmsg#_1_4#7599827764207069': '最美宋词',
    };
  }

  /**
   * @description: 项目启动监听
   * @return {*}
   */
  async onApplicationBootstrap() {
    console.log('--------------');
  }

  /**
   * @description: 初始化文件上传
   * @return {*}
   */
  async initFileUpload() {
    const files = await fs.readdirSync(process.cwd() + '/imags/', {
      withFileTypes: true,
    });
    for (const obj of files) {
      const result = await this.wecomApiService.upload(
        process.cwd() + '/imags/' + obj.name,
      );
      console.log(JSON.stringify(result));

      this.templateService.thumbMediaIds.push(result.media_id);
    }
    console.debug(`thumbMediaIds:`, this.templateService);
  }

  getMenuName(key) {
    return this.MENU_MAP[key];
  }

  async handleEvent(
    toUserName: string,
    fromUserName: string,
    eventKey: string,
  ) {
    try {
      const title = this.getMenuName(eventKey);
      switch (title) {
        case '今日天气': {
          await this.getWeather(title);
          break;
        }
        case '今日日期': {
          await this.getDate(fromUserName);
          break;
        }
        case '今日头条': {
          await this.getTopNews(fromUserName);
          break;
        }
        case '今日英语': {
          await this.getDayEnglish(fromUserName);
          break;
        }
        case '今日一言': {
          await this.getOneWord(fromUserName);
          break;
        }
        case '故事大全': {
          await this.getStory(title, fromUserName);
          break;
        }
        case '雷人笑话': {
          await this.getJoke(fromUserName);
          break;
        }
        case '每日简报': {
          await this.getDailyBriefing(fromUserName);
          break;
        }
        case '土味情话': {
          await this.getSaylove(fromUserName);
          break;
        }
        case '最美宋词': {
          await this.getSongLyrics(fromUserName);
          break;
        }
        default: {
          break;
        }
      }
    } catch (error) {
      console.error(`handleEvent error:`, error);
    }
  }

  async getWeather(title) {
    try {
      const weatherResult = await this.tianApiService.getWeather(
        this.msgConfig.city_name,
      );
      const {
        area,
        date,
        weather,
        highest,
        lowest,
        wind,
        windsc,
        week,
        pcpn,
        tips,
      } = weatherResult;
      // 今日
      const today = `${date.replace('-', '年').replace('-', '月')}日`;
      let description = `📍${area} | ${today} | ${week}`;

      description += `\n🖼今日天气状况：
      ⛅天气：${weather}
      🎐${wind}：${windsc}
      🌡温度：${lowest} ~ ${highest}\n`;

      if (weather.includes('雨')) description += `🌧降雨量：${pcpn}mm\n`;

      // 低温提醒
      if (
        this.msgConfig.weather_low_show &&
        lowest &&
        +lowest.replace('℃', '') <= this.msgConfig.weather_low_tem
      ) {
        const only_one = this.msgConfig.weather_low_message.length === 1;
        const len = only_one
          ? 1
          : getRandomRange(1, this.msgConfig.weather_low_message.length);
        description += `\n${this.msgConfig.weather_low_message[len - 1].replace(
          '{low}',
          lowest,
        )}\n`;
      }

      // 高温提醒
      if (
        this.msgConfig.weather_hight_show &&
        highest &&
        +highest.replace('℃', '') >= this.msgConfig.weather_hight_tem
      ) {
        const only_one = this.msgConfig.weather_hight_message.length === 1;
        const len = only_one
          ? 1
          : getRandomRange(1, this.msgConfig.weather_hight_message.length);
        description += `\n${this.msgConfig.weather_hight_message[
          len - 1
        ].replace('{hight}', highest)}\n`;
      }

      // 第二卡片不开启时才展示
      if (!this.msgConfig.tips_card_show) {
        const birthdayInfo = { todayIsBirthday: false, who: '', isEmpty: true };
        // 纪念日相关日期内容处理
        description = getContentByDay(
          description,
          this.msgConfig,
          date,
          birthdayInfo,
        );

        // 自定义 love message 以及 彩蛋
        description = getCustomMessage(
          description,
          this.msgConfig,
          birthdayInfo,
        );
      }

      // 生活指数提示
      if (this.msgConfig.weather_tips && tips) {
        description += `\n📋小建议:${tips}\n`;
      }

      // 内容末尾，自定义
      if (this.msgConfig.card_end_message) {
        description += `${this.msgConfig.card_end_message}`;
      }

      const result = this.templateService.textCardTemplate(title, description);
      await this.wecomApiService.wxNotify(result);
    } catch (error) {
      console.error(`getWeather error:`, error);
    }
  }

  /**
   * @description: 每日提醒
   * @return {*}
   */
  async dailyReminder() {
    const dateLength = dayjs(new Date()).diff(
      this.msgConfig.start_stamp,
      'day',
    );
    const title = this.msgConfig.start_stamp_message.replace(
      '{day}',
      `${dateLength}`,
    );
    const { content } = await this.tianApiService.getSaylove();
    const data = this.templateService.textCardTemplate(title, content);
    await this.wecomApiService.wxNotify(data);
  }

  async getStory(title = '故事大全', touser: string) {
    const res = await this.tianApiService.getStorybook();
    title += ` —— ${res.title}`;
    const data: any = this.templateService.mpnewsTemplate([
      { title, content: res.content },
    ]);
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getDate(touser: string) {
    const date = moment().format('yyyy-M-D');
    const lunarInfo = await this.juheApiService.getLunarDate(date);
    // 今日
    const today = `${lunarInfo.data.date
      .replace('-', '年')
      .replace('-', '月')}日`;
    const title = `${today} | ${
      lunarInfo.data.lunarYear + lunarInfo.data.lunar
    } |${lunarInfo.data.weekday}`;
    let description = ``;

    // 日期
    if (this.msgConfig.date_lunarInfo && lunarInfo.data) {
      // 公历
      const festival_info = lunarInfo.data.holiday
        ? `| ${lunarInfo.data.holiday}`
        : '';
      // 农历
      const lunar_festival_info =
        lunarInfo.data.lunarYear + lunarInfo.data.lunar;
      // 节气
      const jieqi_info = lunarInfo.data.jieqi
        ? `| ${lunarInfo.data.jieqi}`
        : '';

      description += `${festival_info} 📆农历 | ${lunar_festival_info} ${jieqi_info}\n`;
      description += `${lunarInfo.data.desc}\n`;
    }

    // 黄历信息
    if (this.msgConfig.date_huangli && lunarInfo.data) {
      let isEmpty = true;
      if (lunarInfo.data.avoid) {
        description += `\n🌝【宜】${lunarInfo.data.avoid.replace(
          /\./g,
          ' ',
        )}\n`;
        isEmpty = false;
      }
      if (lunarInfo.data.suit) {
        if (isEmpty) description += '\n';
        description += `🌚【忌】${lunarInfo.data.suit.replace(/\./g, ' ')}\n`;
      }
    }
    const data: any = this.templateService.mpnewsTemplate([
      { title, content: description },
    ]);
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getTopNews(touser: string) {
    const topNews = await this.tianApiService.getTianTopNews();
    const data: any = this.templateService.newsTemplate(topNews.slice(0, 8));
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getDayEnglish(touser: string) {
    const dayEnglish = await this.tianApiService.getDayEnglish();
    const content = `『每日英语 ${dayEnglish.date}』${dayEnglish.content}`;

    const data: any = this.templateService.textTemplate(content);
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getOneWord(touser: string) {
    const oneWord = await this.tianApiService.getOneWord();
    const content = `『每日一言』${oneWord.hitokoto}`;

    const data: any = this.templateService.textTemplate(content);
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getJoke(touser: string) {
    const joke: any = await this.tianApiService.getJoke();
    const data: any = this.templateService.textCardTemplate(
      `雷人笑话 —— ${joke.title}`,
      joke.content,
    );
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getDailyBriefing(touser: string) {
    const { list } = await this.juheApiService.getDailyBriefing();
    const result = list.slice(0, 8);
    result.forEach((obj) => {
      obj.content = obj.digest;
    });
    const data: any = this.templateService.mpnewsTemplate(result);
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getSongLyrics(touser: string) {
    const result = await this.tianApiService.getSongLyrics();
    const title = `『最美宋词』—— ${result.source}`;

    const data: any = this.templateService.textCardTemplate(
      title,
      result.content,
    );
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }

  async getSaylove(touser: string) {
    const result = await this.tianApiService.getSaylove();
    const title = `『土味情话』`;
    const data: any = this.templateService.textCardTemplate(
      title,
      result.content,
    );
    if (touser) data.touser = touser;
    await this.wecomApiService.wxNotify(data);
  }
}
