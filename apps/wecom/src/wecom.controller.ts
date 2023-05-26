/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { WecomApiService } from './api/wecomApi.service';
import { getConfig } from '@app/common/getConfig';
import { WecomService } from './wecom.service';
import { getUid, parserXml2Json } from '@app/common';
import { EventXmlDto } from 'libs/dto/wx.dto';
import { assign } from 'lodash';
import e, { Request, Response } from 'express';
import * as wecom_crypto from '@wecom/crypto';
import { CONFIG } from 'libs/shared/shared.module';

@Controller('/wecom')
export class WecomController {
  private readonly msgConfig: any;
  private Token: string;
  private EncodingAESKey: string;
  constructor(
    @Inject(CONFIG) private readonly config: any,
    private readonly wecomService: WecomService,
  ) {
    this.Token = this.config.wecom?.token;
    this.EncodingAESKey = this.config.wecom?.encodingAESKey;
    this.msgConfig = getConfig().loveMsg;
  }

  /**
   * @description: 企微POST指令回调
   * @param {any} req
   * @param {any} res
   * @return {*}
   */
  @Get('/callback/data')
  @HttpCode(200)
  async dataGetCallback(@Req() req: Request, @Res() res: Response) {
    const query = req.query;
    const body = req.body;
    try {
      const params = assign(query, body);
      console.debug('数据回调dataGetCallback params:', JSON.stringify(params));
      const encrypt = params.echostr;
      const decrypt = wecom_crypto.getSignature(
        this.Token,
        params.timestamp,
        params.nonce,
        encrypt,
      );
      console.debug('数据回调dataGetCallback decrypt:', decrypt);
      if (params.msg_signature != decrypt) return 'msg_signature验证失败';
      const result = wecom_crypto.decrypt(this.EncodingAESKey, encrypt);
      console.debug('数据回调dataGetCallback result:', JSON.stringify(result));
      return res.send(result.message);
    } catch (error: any) {
      console.error('数据回调dataGetCallback error:', error.stack);
    }
  }

  /**
   * @description: 企微POST数据回调
   * @param {any} req
   * @param {any} res
   * @return {*}
   */
  @Post('/callback/data')
  @HttpCode(200)
  async dataPostCallback(@Req() req: Request, @Res() res: Response) {
    const { msg_signature, timestamp, nonce } = req.query;
    const body = req.body;
    const DebugId = getUid();
    let decryptRet: any;
    let message: string;
    try {
      console.debug(
        `${DebugId}-------->数据回调dataPostCallback start<-------- body=${JSON.stringify(
          body,
        )}, query=${JSON.stringify(req.query)}`,
      );
      const encrypt = (body.xml.Encrypt || body.xml.encrypt)[0];
      const decrypt = wecom_crypto.getSignature(
        this.Token,
        Number(timestamp),
        Number(nonce),
        encrypt,
      );
      if (msg_signature != decrypt) {
        message = 'msg_signature验证失败';
        return;
      }
      decryptRet = wecom_crypto.decrypt(this.EncodingAESKey, encrypt);
      message = decryptRet?.message;
      const result: any = parserXml2Json(decryptRet.message);
      console.info(`数据回调dataPostCallback result:${JSON.stringify(result)}`);
      const xmlData: EventXmlDto = result.xml;
      const agentId = xmlData.AgentID;
      const toUserName = xmlData.ToUserName;
      const fromUserName = xmlData.FromUserName;
      const eventKey = xmlData.EventKey;

      switch (xmlData.Event) {
        case 'click': {
          const button = this.wecomService.getMenuName[eventKey];
          console.debug(
            `${DebugId}-------->企微：${toUserName} 用户点击了${button}`,
          );
          await this.wecomService.handleEvent(
            toUserName,
            fromUserName,
            eventKey,
          );
          break;
        }
      }
    } catch (error: any) {
      console.error(
        `${DebugId}-------->数据回调dataPostCallback error: ${error.stack}`,
      );
    } finally {
      console.debug(
        `${DebugId}-------->数据回调dataPostCallback end:${message}<--------`,
      );
      // return message;
      return res.send(message);
    }
  }
}
