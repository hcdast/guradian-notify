/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-04-20 19:04:08
 * @Description:
 */
import { Inject, Injectable } from '@nestjs/common';
import { httpClient } from '@app/common';
import { CONFIG } from 'libs/shared/shared.module';
// import queryString from 'query-string';
import * as queryString from 'node:querystring';
import axios from 'axios';
import {
  DailyBriefing,
  IVerseProps,
  JokeProps,
  NetEaseCloudProps,
  OneMagazines,
  OneWordProps,
  ResEnglishProps,
  ResLunarDateProps,
  SayloveProps,
  StorybookProps,
  TodayHeadlines,
} from 'libs/dto/message.dto';

/**
 * 相关接口URL
 */
enum TianApiURL {
  // 天气接口：默认获取最近7天的数据
  weather = 'http://api.tianapi.com/tianqi/index',
  // 每日简报
  dailyBriefing = 'http://api.tianapi.com/bulletin/index',
  // 今日头条
  topNews = 'http://api.tianapi.com/topnews/index',
  // 最美宋词
  songLyrics = 'http://api.tianapi.com/zmsc/index',
  // 每日一句美好英语
  dayEnglish = 'http://api.tianapi.com/everyday/index',
  // 韩寒主编的ONE一个杂志，本接口返回每日一句
  oneMagazines = 'http://api.tianapi.com/one/index',
  // 故事大全
  storybook = 'http://api.tianapi.com/story/index',
  // 网易云热评
  netEaseCloud = 'http://api.tianapi.com/hotreview/index',
  // 获取农历信息
  lunarDate = 'http://api.tianapi.com/lunar/index',
  // 土味情话
  saylove = 'http://api.tianapi.com/saylove/index',
  // 彩虹屁
  caihongpi = 'http://api.tianapi.com/caihongpi/index',
  // 励志古言
  inspirationalWord = 'http://api.tianapi.com/lzmy/index',
  // 笑话
  joke = 'http://api.tianapi.com/joke/index',
  // 一言
  oneWord = 'https://v1.hitokoto.cn/?encode=json',
  // 随机一句情话
  random_love = 'https://api.vvhan.com/api/love',
}

@Injectable()
export class TianApiService {
  private readonly TIAN_API_KEY: string;
  constructor(@Inject(CONFIG) private readonly config: any) {
    this.TIAN_API_KEY = this.config.api.tian_api_key;
  }

  /**
   * @description: 天气
   * @param {string} city_name
   * @return {*}
   */
  async getWeather(city_name: string) {
    const params = {
      city: city_name,
      type: '1',
      key: this.TIAN_API_KEY,
    };
    const url = `${TianApiURL.weather}?${queryString.stringify(params)}`;
    // 默认返回7天的数据，指定type只返回1天
    const res = await httpClient.get(url);
    console.info('weather', res);
    return res?.[0];
  }

  /**
   * @description: 每日简报
   * @return {*}
   */
  async getDailyBriefing() {
    const res = await httpClient.get<DailyBriefing[]>(TianApiURL.dailyBriefing);
    return res;
  }

  /**
   * @description: 今日头条
   * @return {*}
   */
  async getTianTopNews() {
    const res = await httpClient.get<TodayHeadlines[]>(TianApiURL.topNews);
    return res;
  }

  /**
   * @description: 最美宋词
   * @return {*}
   */
  async getSongLyrics() {
    const res = await httpClient.get<IVerseProps[]>(TianApiURL.songLyrics);
    return res?.[0];
  }

  /**
   * @description: 每日一句美好英语
   * @return {*}
   */
  async getDayEnglish() {
    const res = await httpClient.get<ResEnglishProps[]>(TianApiURL.dayEnglish);
    return res?.[0];
  }

  /**
   * @description: one一个杂志
   * @return {*}
   */
  async getOneMagazines() {
    const res = await httpClient.get<OneMagazines[]>(TianApiURL.oneMagazines);
    return res?.[0];
  }

  /**
   * @description: 故事大全
   * @return {*}
   */
  async getStorybook() {
    const res = await httpClient.get<StorybookProps[]>(TianApiURL.storybook);
    return res?.[0];
  }

  /**
   * @description: 网易云热评
   * @return {*}
   */
  async getNetEaseCloud() {
    const res = await httpClient.get<NetEaseCloudProps[]>(
      TianApiURL.netEaseCloud,
    );
    return res?.[0];
  }

  /**
   * @description: 获取农历信息
   * @param {string} date
   * @return {*}
   */
  async getLunarDate(date: string) {
    const params = {
      date,
      key: this.TIAN_API_KEY,
    };
    const url = `${TianApiURL.lunarDate}?${queryString.stringify(params)}`;
    const res = await httpClient.get<ResLunarDateProps[]>(url);
    return res?.[0];
  }

  /**
   * @description: 土味情话
   * @return {*}
   */
  async getSaylove() {
    const params = {
      key: this.TIAN_API_KEY,
    };
    const url = `${TianApiURL.saylove}?${queryString.stringify(params)}`;
    const res = await httpClient.get<SayloveProps[]>(url);
    return res?.[0];
  }

  /**
   * @description: 彩虹屁
   * @return {*}
   */
  async getCaihongpi() {
    const params = {
      key: this.TIAN_API_KEY,
    };
    const url = `${TianApiURL.caihongpi}?${queryString.stringify(params)}`;
    const res = await httpClient.get<SayloveProps[]>(url);
    return res?.[0];
  }

  /**
   * @description: 雷人笑话
   * @param {*} num
   * @return {*}
   */
  async getJoke(num = 6): Promise<JokeProps[]> {
    const params = {
      key: this.TIAN_API_KEY,
      num,
    };
    const url = `${TianApiURL.joke}?${queryString.stringify(params)}`;
    const res = await httpClient.get(url);
    return res.data?.newslist;
  }

  /**
   * @description: 一言
   * @return {*}
   */
  async getOneWord(): Promise<OneWordProps | null> {
    try {
      const response = await axios(TianApiURL.oneWord, {
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  /**
   * @description: 随机一句话
   * @return {*}
   */
  async getRandomLove(): Promise<string | null> {
    try {
      const response = await axios(TianApiURL.random_love, { timeout: 60000 });
      return response.data;
    } catch (error) {
      console.warn(error);
      return null;
    }
  }
}
