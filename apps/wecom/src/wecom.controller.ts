/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Controller, Get } from '@nestjs/common';
import { WecomService } from './wecom.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller('/wecom')
export class WecomController {
  constructor(private readonly wecomService: WecomService) {}

  @MessagePattern({ cmd: 'getHello' })
  getHello(name: string): string {
    return this.wecomService.getHello(name);
  }

  @EventPattern('setHello')
  setHello(name: string): string {
    return this.wecomService.getHello(name);
  }
}
