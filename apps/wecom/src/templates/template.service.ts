import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from 'libs/shared/shared.module';
import { getCustomMessage } from './customMessage';
import { getContentByDay } from './memorial';
import { TextCardTemplateProps, TodayHeadlines } from 'libs/dto/message.dto';

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
  public thumbMediaIds: any;
  constructor(@Inject(CONFIG) private readonly config: any) {
    this.msgConfig = this.config.loveMsg;
    this.thumbMediaIds = [];
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
   * @param {string} content
   * @return {*}
   */
  textTemplate(content: string) {
    return {
      msgtype: 'text',
      text: {
        content,
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

  textCardTemplate(title: string, description: string) {
    return {
      msgtype: 'textcard',
      textcard: {
        title,
        description,
        url: `${this.msgConfig.card_url}`,
        btntxt: `By${this.msgConfig.boy_name}`,
      },
    };
  }

  mpnewsTemplate(list: any) {
    let articles = [];
    // map
    if (list && Array.isArray(list)) {
      articles = list.map((n) => {
        return {
          title: n.title,
          content: n.content,
          author: this.msgConfig.boy_name,
          thumb_media_id:
            this.thumbMediaIds[
              Math.floor(Math.random() * this.thumbMediaIds.length)
            ],
          // content_source_url: `${this.msgConfig.card_url}`,
        };
      });
    }

    return {
      msgtype: 'mpnews',
      mpnews: {
        articles,
      },
    };
  }
}
