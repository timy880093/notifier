import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { SendMailDto } from './send-mail.dto';
import mjml2html from 'mjml';

export class SendMjmlDto extends SendMailDto {
  @ApiProperty({ description: 'mjml 模板' })
  @IsString()
  readonly mjmlCode: string;

  @IsOptional()
  @IsObject()
  readonly context?: Record<string, any>;

  constructor(dto: Partial<SendMjmlDto>) {
    super(dto);
    Object.assign(this, dto);
  }

  toMailOptions(): ISendMailOptions[] {
    const headers = {
      'List-Unsubscribe':
        '<https://example.com/unsubscribe?email=user@example.com>, <mailto:unsubscribe@example.com?subject=unsubscribe>',
    };
    if (this.tag) headers['x-mailgun-tag'] = this.tag;
    let baseOptions: any;
    try {
      baseOptions = {
        html: mjml2html(this.mjmlCode).html,
        subject: this.subject,
        headers,
      };
      if (this.from) baseOptions.from = this.from;
    } catch (e) {
      throw new Error('MJML 轉換失敗');
    }
    return this.receivers.map((receiver) => {
      let context = this.context;
      if (receiver.username) {
        context = { ...this.context, username: receiver.username };
      }
      return {
        ...baseOptions,
        to: receiver.email,
        context,
      } as ISendMailOptions;
    });
  }
}

class ReceiverDto {
  @ApiProperty({ description: '收件者' })
  @IsString()
  readonly email: string;

  @ApiProperty({ description: '收件者名稱' })
  @IsString()
  @IsOptional()
  readonly username: string;
}
