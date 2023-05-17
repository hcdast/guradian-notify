// 定义天气返回值类型 https://www.tianapi.com/apiview/72

import e from 'express';

// 预警
export class IAlarmlistItemProps {
  /** 预警省份 */
  province: string;
  /** 预警城市 */
  city: string;
  /** 预警级别 */
  level: string;
  /** 预警类型 */
  type: string;
  /** 预警内容 */
  content: string;
  /** 预警时间 */
  time: string;
}

// 天气
export class IWeatherResponseProps {
  /** 2021-12-18 */
  date: string;
  /** 星期六 */
  week: string;
  /** 蚌埠 */
  area: string;
  /** 晴 */
  weather: string;
  /** 西南风 */
  wind: string;
  /** 3-4级 */
  windsc: string;
  /** 湿度：35% */
  humidity: string;
  /** 降雨量 */
  pcpn: string;
  /** 当前温度 4 */
  real: string;
  /** 最高温度 8 */
  highest: string;
  /** 最低温度 -2 */
  lowest: string;
  /** 生活指数提示 */
  tips: string;
  /** 天气预警列表（七天无此字段） */
  alarmlist: IAlarmlistItemProps[];
}

// 诗歌
export class IVerseProps {
  /** 长安白日照春空，绿杨结烟垂袅风。 */
  content: string;
  /** 阳春歌 */
  origin: string;
  /** 李白 */
  author: string;
  /** 古诗文-天气-太阳 */
  category: string;
  /** 天行数据接口 名称 */
  source: string;
}

// 每日简报
export class DailyBriefing {
  mtime: string;
  title: string;
  digest: string;
  source: string;
  url: string;
  imgsrc: string;
}

// 今日头条
export class TodayHeadlines {
  ctime: string;
  title: string;
  description: string;
  picUrl: string;
  url: string;
  source: string;
}

// 每日一句好英语
export class ResEnglishProps {
  content: string;
  note: string;
  imgurl: string;
  date: string;
}

// 韩寒主编的ONE一个杂志，本接口返回每日一句
export class OneMagazines {
  word: string;
  wordfrom: string;
  imgurl: string;
  note: string;
}

// 故事大全
export class StorybookProps {
  title: string;
  content: string;
}

// 网易云热评
export class NetEaseCloudProps {
  source: string;
  content: string;
}

// 获取农历信息
export class ResLunarDateProps {
  lunar_festival: string;
  festival: string;
  lubarmonth: string;
  lunarday: string;
  jieqi: string;
  /* 宜 */
  fitness: string;
  /* 忌 */
  taboo: string;
  /* 天干地支：戊戌·乙丑·庚戌 */
  tiangandizhiyear: string;
  tiangandizhimonth: string;
  tiangandizhiday: string;
}

// 土味情话
export class SayloveProps {
  content: string;
}

// 励志古言
export class InspirationalWordProps {
  saying: string;
  transl: string;
  source: string;
}

// 雷人笑话
export class JokeProps {
  title: string;
  content: string;
}

// 一言
export class OneWordProps {
  hitokoto: string;
  from: string;
  from_who: string;
  creator: string;
}

/**
 * 模板
 */
// goodMorning
export class TextCardTemplateProps extends IWeatherResponseProps {
  lunarInfo: ResLunarDateProps;
  oneWord?: OneWordProps | null;
  // randomLove: string | null
}

// goodEvening
export class TextTemplateProps {
  sayLove: SayloveProps | null;
  caiHongpi: SayloveProps | null;
  oneWord: OneWordProps | null;
  songLyrics: IVerseProps | null;
  oneMagazines: OneMagazines | null;
  netEaseCloud: NetEaseCloudProps | null;
  dayEnglish: ResEnglishProps | null;
}
