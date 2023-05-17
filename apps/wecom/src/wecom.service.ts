/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { httpClient } from '@app/common/http.service';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from 'libs/shared/shared.module';

@Injectable()
export class WecomService {
  private readonly WX_COMPANY_ID: string;
  private readonly WX_APP_ID: string;
  private readonly WX_APP_SECRET: string;
  private readonly WX_BOT_KEY: string;
  private readonly BASE_URL: string;

  constructor(@Inject(CONFIG) private readonly config: any) {
    this.WX_COMPANY_ID = this.config.wecom.corpId;
    this.WX_APP_ID = this.config.wecom.agentId;
    this.WX_APP_SECRET = this.config.wecom.secret;
    this.WX_BOT_KEY = this.config.wecom.botKey;
    this.BASE_URL = 'https://qyapi.weixin.qq.com';
  }

  async getToken({ id, secret }): Promise<string> {
    try {
      const url = `${this.BASE_URL}/cgi-bin/gettoken?corpid=${id}&corpsecret=${secret}`;
      const headers = {
        accept: 'application/json',
        'content-type': 'application/json',
      };
      const response = await httpClient.get(url, { headers });
      return response.data.access_token;
    } catch (error) {
      console.warn(error);
      return '';
    }
  }

  async wxNotify(config: any) {
    try {
      // 获取token
      const accessToken = await this.getToken({
        id: this.WX_COMPANY_ID as string,
        secret: this.WX_APP_SECRET as string,
      });

      // 发送消息
      const defaultConfig = {
        msgtype: 'text',
        agentid: this.WX_APP_ID,
        ...config,
      };
      const option = { ...defaultConfig, ...config };
      const res = await this.postMsg(accessToken, option);
      console.log('wx:信息发送成功！', res);
      return true;
    } catch (error) {
      console.log('wx:信息发送失败！', error);
      return false;
    }
  }

  async postMsg(accessToken, config) {
    const url = `${this.BASE_URL}/cgi-bin/message/send?access_token=${accessToken}`;
    const data = {
      touser: config.touser || '@all',
      ...config,
    };
    const response = await httpClient.post(url, data);
    return response.data;
  }

  async WXbot(msg: string) {
    try {
      console.log('WXbot', this.WX_BOT_KEY, msg);
      const url = `${URL}?key=${this.WX_BOT_KEY}`;
      const headers = {
        'Content-Type': 'application/json',
      };
      const data = {
        msgtype: 'text',
        text: {
          content: msg,
          mentioned_list: ['@all'], // 通知所有人或单个成员（支持ID和手机号）
          // mentioned_mobile_list: ['@all'],
        },
      };
      const response = await httpClient.post(url, data, { headers });
      if (response.data?.errcode === 0) console.log('🎉发送成功！！！');
    } catch (error) {
      console.log(`发送失败 => ${error}`);
    }
  }
}
