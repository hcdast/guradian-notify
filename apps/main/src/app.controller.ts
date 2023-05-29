/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientProxy } from '@nestjs/microservices';
import { CONFIG } from 'libs/shared/shared.module';

@Controller()
export class AppController {
  constructor(
    @Inject(CONFIG) private readonly config: any,
    private readonly appService: AppService,
    @Inject('WECOM_SERVICE') private client: ClientProxy,
  ) {}

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
}
