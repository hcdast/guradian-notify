/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Controller, Get } from '@nestjs/common';
import { WecomService } from './wecom.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { TianApiService } from './api/tianApi.service';
import { getConfig } from '@app/common/getConfig';
import { TemplateService } from './templates/template.service';

@Controller('/wecom')
export class WecomController {
  private readonly msgConfig: any;
  constructor(
    private readonly wecomService: WecomService,
    private readonly tianApiService: TianApiService,
    private readonly templateService: TemplateService,
  ) {
    this.msgConfig = getConfig().loveMsg;
  }

  @MessagePattern({ cmd: 'getHello' })
  getHello(name: string): string {
    return name;
  }

  @EventPattern('get-weather')
  async getWeather() {
    try {
      const weather = await this.tianApiService.getWeather(
        this.msgConfig.city_name,
      );
      if (weather) {
        const lunarInfo = await this.tianApiService.getLunarDate(weather.date);
        const oneWord = await this.tianApiService.getOneWord();
        const template = this.templateService.weather({
          ...weather,
          lunarInfo,
        });
        const { isMoreThan, ...args } = template;

        console.info('weatherInfo', args);

        // 发送消息
        await this.wecomService.wxNotify(args);

        // 手动开启、或者超出字节自动开启
        if (this.msgConfig.tips_card_show || isMoreThan) {
          const tips = this.templateService.importantTips({
            ...weather,
            lunarInfo,
            oneWord,
          });
          console.info('weatherInfo tips', tips);
          if (tips.textcard.description.replace(/\n/g, '').length)
            await this.wecomService.wxNotify(tips);
        }
      }
    } catch (error) {
      console.warn('getWeather error:', error);
    }
  }

  @EventPattern('get-story')
  async getStory() {
    const res = await this.tianApiService.getStorybook();
    const template = {
      msgtype: 'text',
      text: {
        content: `今日份睡前故事来喽：🌑🌒🌓🌔🌕🌝😛\n
      『${res.title}』
      ${res.content}`,
      },
    };
    // for (let i = 0; i < res.content.length; i += 500) {
    //   await this.wecomService.wxNotify(res.content.slice(i, i + 500));
    // }
    await this.wecomService.wxNotify(template);
  }

  @EventPattern('get-goodWord')
  async getGoodWord() {
    try {
      // 并行请求，优响相应
      const dataSource = await Promise.allSettled([
        this.tianApiService.getSaylove(), // 土味情话
        this.tianApiService.getCaihongpi(), // 彩虹屁
        this.tianApiService.getOneWord(), // 一言
        this.tianApiService.getSongLyrics(), // 最美宋词
        this.tianApiService.getOneMagazines(), // one杂志
        this.tianApiService.getNetEaseCloud(), // 网易云热评
        this.tianApiService.getDayEnglish(), // 每日英语
      ]);

      // 过滤掉异常数据
      const [
        sayLove,
        caiHongpi,
        oneWord,
        songLyrics,
        oneMagazines,
        netEaseCloud,
        dayEnglish,
      ] = dataSource.map((n) => (n.status === 'fulfilled' ? n.value : null));

      // 对象写法
      const data: any = {
        sayLove,
        caiHongpi,
        oneWord,
        songLyrics,
        oneMagazines,
        netEaseCloud,
        dayEnglish,
      };

      const template = this.templateService.textTemplate(data);
      console.log('getGoodWord', template);

      this.wecomService.wxNotify(template);
    } catch (error) {
      console.log('getGoodWord error:', error);
    }
  }

  @EventPattern('get-joke')
  async getJoke() {
    const res: any = await this.tianApiService.getJoke();
    let text = '今日份午安来喽:\n';
    text += `请欣赏以下雷人笑话😝\n`;
    text += `${res.map((n) => `『${n.title}』${n.content}`).join('\n\n')}`;
    const template = {
      msgtype: 'text',
      text: {
        content: text,
      },
    };

    await this.wecomService.wxNotify(template);
  }

  @EventPattern('get-news')
  async getNews() {
    try {
      // 每日简报
      // const dailyBriefing = await this.tianApiService.getDailyBriefing()
      // const formateData: TodayHeadlines[] = dailyBriefing.map((n) => ({
      //   ...n,
      //   title: n.title,
      //   description: n.digest,
      //   picUrl: n.imgsrc,
      //   ctime: n.mtime,
      // }))
      // 今日头条
      const todayTopNews: any = await this.tianApiService.getTianTopNews();
      console.log('todayTopNews', todayTopNews.length);

      // 每次信息最多8个
      // 设定发送两次一共16个信息，数据如果不够则请求另一个接口
      let result: any = [];
      const len = todayTopNews.length;

      if (len >= 16) {
        // 则这条接口满足条件 2 * 8 = 16
        result = todayTopNews.slice(0, 16);
      } else {
        // 取 0- 8 条
        result = todayTopNews.slice(0, len >= 8 ? 8 : len);
        // 数据不够，请求另一个接口
        const dailyBriefing: any = await this.tianApiService.getDailyBriefing();
        console.log('dailyBriefing', dailyBriefing.length);
        const formateData = dailyBriefing.map((n) => ({
          ...n,
          title: n.title,
          description: n.digest,
          picUrl: n.imgsrc,
          ctime: n.mtime,
        }));

        // 已经有8条
        if (result.length === 8) {
          result = [
            ...result,
            ...formateData.slice(
              0,
              formateData.length >= 8 ? 8 : formateData.length,
            ),
          ];
        }

        // 少于 8 条数据的情况
        if (result.length < 8) {
          const sencondLen = result.length + formateData.length;
          if (sencondLen >= 16)
            result = [...result, ...formateData.slice(result.length, 16)];
          else
            result = [
              ...result,
              ...formateData.slice(result.length, formateData.length),
            ];
        }
      }

      // 发送消息
      const times = Math.ceil(result.length / 8);
      for (let i = 0; i < times; i++) {
        const start = 8 * i;
        const end = 8 * i + 8 < result.length ? 8 * i + 8 : result.length;
        console.log(result.length, start, end);

        const template = this.templateService.newsTemplate(
          result.slice(start, end),
        );
        await this.wecomService.wxNotify(template);
      }
    } catch (error) {
      console.log('goodEvening', error);
    }
  }
}
