/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2022-02-10 14:11:15
 * @Description: 企业微信服务端api
 */
import { Inject, Injectable } from '@nestjs/common';
import _ from 'lodash';
import { httpClient } from '@app/common';
import { CONFIG } from 'libs/shared/shared.module';

@Injectable()
export class WecomApiService {
  private corpid: string;
  private corpsecret: string;
  private agentid: string;
  private readonly BASE_URL: string;
  private readonly WX_BOT_KEY: string;
  constructor(@Inject(CONFIG) private readonly config: any) {
    this.corpid = config.wecom.corpId;
    this.corpsecret = config.wecom.secret;
    this.agentid = config.wecom.agentId;
    this.BASE_URL = 'https://qyapi.weixin.qq.com';
    this.WX_BOT_KEY = this.config.wecom.botKey;
  }

  /**
   * @description: 获取access_token
   * @param {*} corpid access_token
   * @param {*} corpsecret 企业id
   * @return {*}
   */
  async getToken(corpid: string, corpsecret: string) {
    const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpid}&corpsecret=${corpsecret}`;
    const result = await httpClient.get(url);
    if (result.data.errcode && result.data.errcode != 0)
      throw new Error(`获取access_token error:${result.data.errmsg}`);
    return result.data;
  }

  /**
   * @description: 获取当前有效token
   * @return {*}
   */
  async getAccessToken() {
    const tokenInfo = await this.getToken(this.corpid, this.corpsecret);
    console.info('getAccessToken 获取企业凭证:', tokenInfo);
    const accessToken = tokenInfo.access_token;
    return accessToken;
  }

  /**
   * @description: 获取菜单
   * @return {*}
   */
  async getMenu() {
    const access_token = await this.getAccessToken();
    const url = `https://qyapi.weixin.qq.com/cgi-bin/menu/get?access_token=${access_token}&agentid=${this.agentid}`;
    const result = await httpClient.get(url);
    if (result.data.errcode && result.data.errcode != 0)
      throw new Error(`获取菜单 error:${result.data.errmsg}`);
    return result.data;
  }

  async wxNotify(config: any) {
    try {
      // 获取token
      const accessToken = await this.getAccessToken();

      // 发送消息
      const defaultConfig = {
        msgtype: 'text',
        agentid: this.agentid,
        ...config,
      };
      const option = { ...defaultConfig, ...config };
      const res = await this.postMsg(accessToken, option);
      console.log('wx:信息发送成功！', res);
      return true;
    } catch (error) {
      console.error('wx:信息发送失败！', error);
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
