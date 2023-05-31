/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from 'libs/shared/shared.module';

@Injectable()
export class AppService {
  constructor(@Inject(CONFIG) private readonly config: any) {}

  getHello(): string {
    return 'Hello World!';
  }
}
