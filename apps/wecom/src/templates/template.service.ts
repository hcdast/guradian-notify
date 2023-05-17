import { getRandomRange } from '@app/common';
import dayjs from '@app/common/dayjs';
import { getConfig } from '@app/common/getConfig';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from 'libs/shared/shared.module';
import { getCustomMessage } from './customMessage';
import { getContentByDay } from './memorial';
import {
  TextCardTemplateProps,
  TextTemplateProps,
  TodayHeadlines,
} from 'libs/dto/message.dto';

interface ArticlesProps {
  title: string;
  description: string;
  url: string;
  picurl: string;
}
/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-15 15:56:19
 * @Description:
 */
@Injectable()
export class TemplateService {
  private readonly msgConfig: any;
  constructor(@Inject(CONFIG) private readonly config: any) {
    this.msgConfig = getConfig().loveMsg;
  }

  weather(data: TextCardTemplateProps) {
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
      lunarInfo,
    } = data;
    // 是否超过512字节
    let isMoreThan = false;

    // 今日、恋爱天数
    const today = `${date.replace('-', '年').replace('-', '月')}日`;
    const dateLength = dayjs(date).diff(this.msgConfig.start_stamp, 'day');

    // 拼接内容
    let description = `📍${area} | ${today} | ${week}`;

    // 日期
    if (this.msgConfig.date_lunarInfo && lunarInfo) {
      const { festival, lunar_festival, jieqi, lubarmonth, lunarday } =
        lunarInfo;
      // 公历节日、农历节日和二十四节气
      const festival_info = festival ? `| ${festival}` : '';
      const lunar_festival_info = lunar_festival ? `| ${lunar_festival}` : '';
      const jieqi_info = jieqi ? `| ${jieqi}` : '';

      description += `${festival_info} 📆农历 | ${lubarmonth}${lunarday} ${lunar_festival_info} ${jieqi_info}\n`;
    }

    // 黄历信息
    if (this.msgConfig.date_huangli && lunarInfo) {
      let isEmpty = true;

      if (lunarInfo.fitness) {
        description += `\n🌝【宜】${lunarInfo.fitness.replace(/\./g, ' ')}\n`;
        isEmpty = false;
      }

      if (lunarInfo.taboo) {
        if (isEmpty) description += '\n';
        description += `🌚【忌】${lunarInfo.taboo.replace(/\./g, ' ')}\n`;
      }
    }

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
      description += `\n${this.msgConfig.weather_hight_message[len - 1].replace(
        '{hight}',
        highest,
      )}\n`;
    }

    // 第二卡片不开启时才展示
    if (!this.msgConfig.tips_card_show) {
      const birthdayInfo = { todayIsBirthday: false, who: '', isEmpty: true };

      // 保留原始数据，为了恢复时使用
      const cache = description;

      // 纪念日相关日期内容处理
      description = getContentByDay(
        description,
        this.msgConfig,
        date,
        birthdayInfo,
      );

      // 自定义 love message 以及 彩蛋
      description = getCustomMessage(description, this.msgConfig, birthdayInfo);

      // 根据是否有重要消息自动开启第二卡片
      if (this.msgConfig.tips_card_show_byMessage) {
        // 重要消息不为空：纪念日、生日、彩蛋，其他普通消息不算在内
        // 则独立显示第二卡片
        if (!birthdayInfo.isEmpty) {
          isMoreThan = true;
          description = cache;
        }
      }

      /**
       * 当第二卡片中的数据在此展示时，需要计算内容长度是否大于 512 字节
       */
      if (!isMoreThan) {
        const cache_before = description;
        if (this.msgConfig.weather_tips && tips) {
          description += `\n📋小建议:${tips}\n`;
        }
        // 内容末尾，自定义
        if (this.msgConfig.card_end_message)
          description += `\n${this.msgConfig.card_end_message}`;

        const byteLength = Buffer.byteLength(description, 'utf8');
        // 大于512字节是，恢复默认，开启第二卡片
        if (byteLength > 512) {
          description = cache;
          isMoreThan = true;
        } else {
          description = cache_before;
        }
      }
    }

    // 生活指数提示
    if (this.msgConfig.weather_tips && tips) {
      description += `\n📋小建议:${tips}\n`;
    }

    // 内容末尾，自定义
    if (this.msgConfig.card_end_message)
      description += `${this.msgConfig.card_end_message}`;

    // 加粗标题
    const title = this.msgConfig.start_stamp_message.replace(
      '{day}',
      `${dateLength}`,
    );

    return {
      isMoreThan, // 是否超过了 512 字符
      msgtype: 'textcard',
      textcard: {
        title,
        description,
        // url: 'https://api.lovelive.tools/api/SweetNothings',
        // url: 'https://v1.jinrishici.com/all.svg',
        url: `${this.msgConfig.card_url}`, // 60s看世界
        btntxt: `By${this.msgConfig.boy_name}`,
      },
    };
  }

  /**
   * @description: 信息提醒
   * @param {TextCardTemplateProps} data
   * @return {*}
   */
  importantTips(data: TextCardTemplateProps) {
    const { date, oneWord } = data;
    let description = '';
    // 保存生日信息，为彩蛋逻辑处理使用
    const birthdayInfo = { todayIsBirthday: false, who: '', isEmpty: true };

    // 纪念日相关日期内容处理
    description = getContentByDay(
      description,
      this.msgConfig,
      date,
      birthdayInfo,
    );

    // 如果存在内容，需要添加换行
    if (!birthdayInfo.isEmpty) description += '\n';

    // 自定义 love message 以及 彩蛋
    description = getCustomMessage(description, this.msgConfig, birthdayInfo);

    // 一言
    if (this.msgConfig.tips_card_oneWord)
      description += `\n${oneWord?.hitokoto}—— ${oneWord?.creator}「${oneWord?.from}」`;

    // 内容末尾，自定义
    description += this.msgConfig.tips_card_end_message;

    // 加粗标题
    const title = this.msgConfig.tips_card_title;

    return {
      msgtype: 'textcard',
      textcard: {
        title,
        description,
        // url: 'https://api.lovelive.tools/api/SweetNothings',
        // url: 'https://v1.jinrishici.com/all.svg',
        url: `${this.msgConfig.tips_card_url}`, // 60s看世界
        btntxt: `By${this.msgConfig.boy_name}`,
      },
    };
  }

  /**
   * @description: 文本消息
   * @param {TextTemplateProps} data
   * @return {*}
   */
  textTemplate(data: TextTemplateProps) {
    const {
      caiHongpi,
      sayLove,
      songLyrics,
      oneMagazines,
      netEaseCloud,
      oneWord,
      dayEnglish,
    } = data;

    let text = `早安呀，我可爱的${this.msgConfig.girl_name}~\n`;

    // 工作日/休息日，需要排除节假日
    //   const week = weekToday()
    //   if (['星期六', '星期日'].includes(week)) {
    //     text += `
    // 如果我${this.msgConfig.girl_name}已经起床啦！${this.msgConfig.boy_name}向你说早安呦~，记得吃早饭呀😆\n
    // 嗯哼哼~今天可是${week}哦，上班别迟到了哦~`
    //   } else {
    //     text += `
    // 如果我${this.msgConfig.girl_name}还没起床呀！${this.msgConfig.boy_name}就等着${this.msgConfig.girl_name}起床给我说早安呦🤣
    // 嗯哼~，既然今天是${week}，就让你再睡会懒觉~下次可不能啦~😝\n`
    //   }

    // 添加笑话
    if (caiHongpi) {
      // 彩虹屁：
      text += `${caiHongpi.content}\n`;
    }

    if (sayLove) {
      text += `${sayLove.content}\n`;
    }

    // 诗句
    if (songLyrics) {
      text += `『${songLyrics.source}』${songLyrics.content}\n`;
    }

    if (oneMagazines) {
      text += `『ONE杂志』${oneMagazines.word}\n`;
    }

    if (netEaseCloud) {
      text += `『网易云音乐热评』${netEaseCloud.content}——${netEaseCloud.source}\n`;
    }

    // 添加一句一言
    if (oneWord) {
      text += `『一言』${oneWord.hitokoto}\n`;
    }

    // 每日英语
    if (dayEnglish) {
      text += `『每日英语（${dayjs(dayEnglish.date).format('ll')}』${
        dayEnglish.content
      }`;
    }

    return {
      msgtype: 'text',
      text: {
        content: text,
      },
    };
  }

  /**
   * @description: 图文消息，一个图文消息支持1到8条图文
   * @param {TodayHeadlines} list
   * @return {*}
   */
  newsTemplate(list: TodayHeadlines[]) {
    let articles = [] as ArticlesProps[];

    // map
    if (list && Array.isArray(list)) {
      articles = list.map((n) => {
        return {
          title: n.title,
          description: n.description,
          url: n.url,
          picurl: n.picUrl,
        };
      });
    }

    return {
      msgtype: 'news',
      news: {
        articles,
      },
    };
  }
}
