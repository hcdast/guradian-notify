/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import {
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import _, { assign } from 'lodash';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { getUid, parserXml2Json } from '@app/common';
import e, { Request, Response } from 'express';
import * as wecom_crypto from '@wecom/crypto';
import { CONFIG } from 'libs/shared/shared.module';

@Controller()
export class AppController {
  private Token: string;
  private EncodingAESKey: string;
  private SuiteID: string;
  constructor(
    @Inject(CONFIG) private readonly config: any,
    private readonly appService: AppService,
    @Inject('WECOM_SERVICE') private client: ClientProxy,
  ) {
    this.Token = this.config.wecom?.token;
    this.EncodingAESKey = this.config.wecom?.encodingAESKey;
  }

  @Get('/get')
  getHello(@Query() query: any): Promise<string> {
    // return this.appService.getHello();
    return this.client.send({ cmd: 'getHello' }, query.name).toPromise();
  }

  @Get('/set')
  setHello(@Query() query: any) {
    // return this.appService.getHello();
    this.client.emit('setHello', query.name);
  }

  /**
   * @description: 企微POST数据回调
   * @param {any} req
   * @param {any} res
   * @return {*}
   */
  @Post('/wecom/callback/data')
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
      console.info(`数据回调dataPostCallback result:${result}`);
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

  /**
   * @description: 企微POST指令回调
   * @param {any} req
   * @param {any} res
   * @return {*}
   */
  @Get('/wecom/callback/data')
  @HttpCode(200)
  async dataGetCallback(@Req() req: Request, @Res() res: Response) {
    const query = req.query;
    const body = req.body;
    try {
      const params = {
        msg_signature: '0a75fe09ff416e8ae8b5f9de1f1ed4b79f812eca',
        timestamp: '1683989121',
        nonce: '1683205689',
        echostr:
          'ZqG32J+70qTmvv8lTEAaghNrBDO7in7dzBseS+ZG7I6mGfeQZ3hHwcBlSluXJ6ZbJITCqp5ntOGyyBBhm1ul8w==',
      };
      // assign(query, body);
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
      // return result?.message;
      return res.send(result.message);
    } catch (error: any) {
      console.error('数据回调dataGetCallback error:', error.stack);
    }
  }
}
