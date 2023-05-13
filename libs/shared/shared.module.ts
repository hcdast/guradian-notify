/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 17:46:31
 * @Description:
 */
import { Global, Module } from '@nestjs/common';
import { loadJsonFile } from '@app/common';
import { resolve } from 'path';
import * as process from 'process';
export const CONFIG = '##CONFIG##';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: CONFIG,
      useFactory: () => {
        try {
          return loadJsonFile(resolve(process.cwd(), 'config/config.app.json'));
        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      },
    },
  ],
  exports: [CONFIG],
})
export class SharedModule {}
