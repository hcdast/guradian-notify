/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 10:51:48
 * @Description:
 */
import * as express from 'express';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as bodyParserXml from 'body-parser-xml';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionFilter, ResponseInterceptor } from 'libs/common';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CONFIG } from 'libs/shared/shared.module';

async function bootstrap() {
  bodyParserXml(bodyParser);
  const app = await NestFactory.create(AppModule, {
    logger: console,
  });
  app.use(helmet());
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
  app.use(bodyParser.xml());

  app.enableCors({
    origin: '*',
    methods: 'POST, GET, PUT, PATCH, OPTIONS, DELETE',
    allowedHeaders: 'origin, content-type, x-access-token, Authorization',
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  const documentConfig = new DocumentBuilder()
    .setTitle('ChatHouse API')
    .setDescription(`接口文档描述`)
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup('apidoc', app, document, {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui.min.css',
  });
  const { apiServer } = app.get(CONFIG);
  const PORT = apiServer?.port;
  await app.listen(PORT, '0.0.0.0', async () => {
    console.info(`chathouse backend service is running at ${PORT}`, {
      url: await app.getUrl(),
      apiUrl: (await app.getUrl()) + '/apidoc',
    });
  });
}
bootstrap();
