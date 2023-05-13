/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-04-17 10:53:22
 * @Description:
 */
import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export enum ErrorCode {
  Undefined = 5000,
}

export const ErrorCodeMsg = {
  [ErrorCode.Undefined]: 'Undefined Error',
};

export class AppException extends Error {
  code: ErrorCode;
  message: string;
  status: HttpStatus;

  constructor(code: ErrorCode, message?: string, status?: HttpStatus) {
    const msg =
      message || ErrorCodeMsg[code] || ErrorCodeMsg[ErrorCode.Undefined];
    super(msg);
    this.code = code;
    this.message = msg;
    this.status = status || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

export class AppDefaultResponse {
  @ApiProperty({ default: 0, description: `请求响应代码, ok` })
  code: number;
  @ApiProperty({ description: '描述', default: 'success' })
  message: string;
  @ApiProperty({ description: '正确返回内容' })
  data: object;
}

export class AppExceptionResponse {
  @ApiProperty({
    type: Number,
    default: ErrorCode,
    enum: ErrorCode,
    description: `错误代码`,
  })
  code: number;
  @ApiProperty({ description: '错误描述' })
  message: string;
  @ApiProperty({ description: '错误返回stack' })
  stack: object;
}
