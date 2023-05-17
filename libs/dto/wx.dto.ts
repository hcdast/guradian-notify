/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-15 13:50:32
 * @Description:
 */
interface IReqToken {
  id: string;
  secret: string;
}

interface MsgData {
  msgtype: string;
  [key: string]: any;
}

interface PostMsgOption {
  agentid: string; // 应用 id
  touser?: string;
  msgtype: 'text' | 'textcard' | 'mpnews';
  [key: string]: any;
}

type FnReqPostMsg<T = any> = (
  token: string,
  options: PostMsgOption,
) => Promise<T>;
