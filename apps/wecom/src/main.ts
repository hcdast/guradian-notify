/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:57:00
 * @Description:
 */
import { NestFactory } from '@nestjs/core';
import { WecomModule } from './wecom.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // const app = await NestFactory.create(WecomModule);
  // await app.listen(3000);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WecomModule,
    {
      transport: Transport.TCP,
      options: {
        port: 8001,
      },
      logger: console,
    },
  );
  app.listen();
}
bootstrap();
