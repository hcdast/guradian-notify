/*
 * @Email: chen.hu@zealcomm.cn
 * @Author: hc
 * @Date: 2023-05-15 15:12:36
 * @Description:
 */
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export enum MessageTypeEnum {
  text = 'text',
  image = 'image',
  voice = 'voice',
  video = 'video',
  file = 'file',
  textcard = 'textcard',
  news = 'news',
  mpnews = 'mpnews',
  markdown = 'markdown',
  miniprogram_notice = 'miniprogram_notice', // 小程序通知消息
  template_card = 'template_card', // 文本通知型
}

class BaseTemplateDto {
  @ApiProperty({
    description:
      '指定接收消息的成员，成员ID列表（多个接收者用‘|’分隔，最多支持1000个）。特殊情况：指定为"@all"，则向该企业应用的全部成员发送',
  })
  @IsString()
  @Optional()
  touser?: string;

  @ApiProperty({
    description:
      '指定接收消息的部门，部门ID列表，多个接收者用‘|’分隔，最多支持100个。当touser为"@all"时忽略本参数',
  })
  @IsString()
  @Optional()
  toparty?: string;

  @ApiProperty({
    description:
      '指定接收消息的标签，标签ID列表，多个接收者用‘|’分隔，最多支持100个。当touser为"@all"时忽略本参数',
  })
  @IsString()
  @Optional()
  totag?: string;

  @ApiProperty({
    description: '消息类型',
  })
  @IsString()
  msgtype: MessageTypeEnum;

  @ApiProperty({
    description:
      '企业应用的id，整型。企业内部开发，可在应用的设置页面查看；第三方服务商，可通过接口 获取企业授权信息 获取该参数值',
  })
  @IsString()
  agentid: string;

  @ApiProperty({
    description:
      '表示是否是保密消息，0表示可对外分享，1表示不能分享且内容显示水印，默认为0',
  })
  @IsNumber()
  @Optional()
  safe?: number;

  @ApiProperty({
    description:
      '表示是否开启id转译，0表示否，1表示是，默认0。仅第三方应用需要用到，企业自建应用可以忽略。',
  })
  @IsNumber()
  @Optional()
  enable_id_trans?: number;

  @ApiProperty({
    description: '表示是否开启重复消息检查，0表示否，1表示是，默认0。',
  })
  @IsNumber()
  @Optional()
  enable_duplicate_check?: number;

  @ApiProperty({
    description: '表示是否重复消息检查的时间间隔，默认1800s，最大不超过4小时',
  })
  @IsNumber()
  @Optional()
  duplicate_check_interval?: number;
}

export class TextTemplateDto extends BaseTemplateDto {
  @ApiProperty({
    description: '消息内容，最长不超过2048个字节，超过将截断（支持id转译）',
  })
  @IsString()
  content: string;
}

export class TextCardTemplateDto extends BaseTemplateDto {
  @ApiProperty({
    description: '标题，不超过128个字节，超过会自动截断（支持id转译）',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '描述，不超过512个字节，超过会自动截断（支持id转译）',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description:
      '点击后跳转的链接。最长2048字节，请确保包含了协议头(http/https)',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: '按钮文字。 默认为“详情”， 不超过4个文字，超过自动截断。',
  })
  @IsString()
  btntxt: string;
}

class ArticleDto {
  @ApiProperty({
    description: '描述，不超过512个字节，超过会自动截断（支持id转译）',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description:
      '图文消息缩略图的media_id, 可以通过素材管理接口获得。此处thumb_media_id即上传接口返回的media_id',
  })
  @IsString()
  thumb_media_id: string;

  @ApiProperty({
    description: '图文消息的作者，不超过64个字节',
  })
  @IsString()
  @Optional()
  author?: string;

  @ApiProperty({
    description: '图文消息点击“阅读原文”之后的页面链接',
  })
  @IsString()
  @Optional()
  content_source_url?: string;

  @ApiProperty({
    description:
      '图文消息的内容，支持html标签，不超过666 K个字节（支持id转译）',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description:
      '图文消息的描述，不超过512个字节，超过会自动截断（支持id转译）',
  })
  @IsString()
  @Optional()
  digest?: string;
}

export class MpnewsTemplateDto extends BaseTemplateDto {
  @ApiProperty({
    description: '图文消息，一个图文消息支持1到8条图文',
  })
  @IsArray()
  articles: [ArticleDto];
}
