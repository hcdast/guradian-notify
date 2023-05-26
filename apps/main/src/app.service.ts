/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { WecomService } from 'apps/wecom/src/wecom.service';
import { CONFIG } from 'libs/shared/shared.module';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    @Inject(CONFIG) private readonly config: any,
    private readonly wecomService: WecomService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onApplicationBootstrap() {
    const job = new CronJob('0 0 0 * * *', async () => {
      console.info('send date');
      await this.wecomService.dailyReminder();
    });
    this.schedulerRegistry.addCronJob('send date', job);
    job.start();
  }
}
