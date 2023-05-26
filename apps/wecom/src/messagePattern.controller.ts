/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CONFIG } from 'libs/shared/shared.module';

@Controller()
export class MessagePatternController {
  private readonly msgConfig: any;
  constructor(@Inject(CONFIG) private readonly config: any) {}

  @MessagePattern({ cmd: 'getHello' })
  getHello(name: string): string {
    return name;
  }
}
