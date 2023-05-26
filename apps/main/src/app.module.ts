/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CONFIG, SharedModule } from 'libs/shared/shared.module';
import { WecomModule } from 'apps/wecom/src/wecom.module';
import { WecomService } from 'apps/wecom/src/wecom.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WecomApiService } from 'apps/wecom/src/api/wecomApi.service';
import { TianApiService } from 'apps/wecom/src/api/tianApi.service';
import { TemplateService } from 'apps/wecom/src/templates/template.service';
import { JuheApiService } from 'apps/wecom/src/api/juheApi.service';

@Module({
  imports: [
    WecomModule,
    SharedModule,
    ClientsModule.register([
      {
        name: 'WECOM_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 8001,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WecomService,
    SchedulerRegistry,
    WecomApiService,
    TianApiService,
    TemplateService,
    JuheApiService,
  ],
})
export class AppModule {}
