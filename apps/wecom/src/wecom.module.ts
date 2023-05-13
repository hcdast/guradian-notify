/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Module } from '@nestjs/common';
import { WecomController } from './wecom.controller';
import { WecomService } from './wecom.service';
import { SharedModule } from 'libs/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [WecomController],
  providers: [WecomService],
})
export class WecomModule {}
