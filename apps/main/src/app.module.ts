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

@Module({
  imports: [
    SharedModule,
    // WecomModule,
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
  providers: [AppService],
})
export class AppModule {}
