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
    console.debug('--------定时器--------');
    const job = new CronJob('0 0 0 * * *', async () => {
      console.info('daily reminder');
      await this.wecomService.dailyReminder();
    });
    this.schedulerRegistry.addCronJob('daily reminder', job);
    job.start();

    const morningjob = new CronJob('0 0 8 * * *', async () => {
      console.info('get weather');
      await this.wecomService.getWeather('今日天气');
    });
    this.schedulerRegistry.addCronJob('get weather', morningjob);
    morningjob.start();
  }
}
