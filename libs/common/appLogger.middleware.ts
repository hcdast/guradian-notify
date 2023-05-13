/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-13 11:10:17
 * @Description:
 */
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, headers, originalUrl: url, query, body } = request;
    const userAgent = request.get('user-agent') || '';
    const realIp = headers['x-real-ip'] || headers['x-forwarded-for'];
    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      this.logger.info('HTTPSERVER', {
        method,
        url,
        statusCode,
        contentLength,
        ip: realIp,
        query,
        body,
        userAgent,
      });
    });

    next();
  }
}
