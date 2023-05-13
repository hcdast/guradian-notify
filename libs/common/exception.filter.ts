/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-04-17 10:54:17
 * @Description:
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';
import { AppException, ErrorCode, ErrorCodeMsg } from './app.exception';
import { isProd } from './utils';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    let httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (exception instanceof AppException) {
      httpStatus = exception.status;
      console.error('Exception', exception.message);
    } else if (exception instanceof HttpException) {
      console.error('HttpException', exception);
    } else if (exception instanceof AxiosError) {
      console.error('AxiosError', exception.toJSON());
    } else {
      console.error('Unknown Exception', exception);
    }

    const response = ctx.getResponse<Response>();
    let data;
    if (exception instanceof HttpException) {
      data = {
        message: exception.message,
        code: exception.getStatus(),
      };
    } else if (exception instanceof AppException) {
      data = {
        code: exception.code,
        message: exception.message,
      };
    } else {
      data = {
        code: ErrorCode.Undefined,
        message: exception.message || ErrorCodeMsg[ErrorCode.Undefined],
      };
    }
    if (!isProd() && exception instanceof HttpException) {
      data['stack'] = exception.stack;
    }
    response.status(httpStatus).json(data);
  }
}
