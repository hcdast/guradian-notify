/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class WecomService {
  getHello(name: string): string {
    return 'Hello World!' + name;
  }
}
