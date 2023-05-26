/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-04-20 19:04:08
 * @Description:
 */
import { Inject, Injectable } from '@nestjs/common';
import { httpClient } from '@app/common';
import { CONFIG } from 'libs/shared/shared.module';
import * as queryString from 'node:querystring';

/**
 * 相关接口URL
 */
enum JuheApiURL {
  // 天气接口：默认获取最近7天的数据
  weather = 'http://apis.juhe.cn/simpleWeather/query',
  // 获取农历信息
  lunarDate = 'http://v.juhe.cn/calendar/day',
  dailyBriefing = 'http://apis.juhe.cn/fapigx/bulletin/query',
}

@Injectable()
export class JuheApiService {
  private readonly JUHE_API_KEY: any;
  constructor(@Inject(CONFIG) private readonly config: any) {
    this.JUHE_API_KEY = this.config.api.juhe_api_key;
  }

  /**
   * @description: 天气
   * @param {string} city_name
   * @return {*}
   */
  async getWeather(city_name: string) {
    const params = {
      city: city_name,
      key: this.JUHE_API_KEY,
    };
    const url = `${JuheApiURL.weather}?${queryString.stringify(params)}`;
    // 默认返回7天的数据，指定type只返回1天
    const res = await httpClient.get(url);
    if (res.data?.error_code != 0) return null;
    return res.data?.result;
  }

  /**
   * @description: 获取农历信息
   * @param {string} date
   * @return {*}
   */
  async getLunarDate(date: string) {
    const params = {
      date,
      key: this.JUHE_API_KEY.wannianli,
    };
    const url = `${JuheApiURL.lunarDate}?${queryString.stringify(params)}`;
    const res: any = await httpClient.get(url);
    if (res.data?.error_code != 0) return null;
    return res.data.result;
  }

  /**
   * @description: 每日简报
   * @return {*}
   */
  async getDailyBriefing() {
    const params = {
      key: this.JUHE_API_KEY.meirijianbao,
    };
    const url = `${JuheApiURL.dailyBriefing}?${queryString.stringify(params)}`;
    const res: any = await httpClient.get(url);
    if (res.data?.error_code != 0) return null;
    return res.data?.result;
  }
}
