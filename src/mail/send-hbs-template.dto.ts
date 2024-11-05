import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class SendHbsTemplateDto {
  @ApiProperty({ description: '模板' })
  @IsString()
  readonly template: string;

  @ApiProperty({ description: '標籤' })
  @IsString()
  readonly tag: string;

  @ApiProperty({ description: '標題' })
  readonly subject: string;

  @IsOptional()
  @IsString()
  readonly from: string;

  @ApiProperty({ description: '收件者' })
  @IsArray()
  readonly receivers: ReceiverDto[];

  @IsOptional()
  @IsObject()
  readonly context: Record<string, any>;

  toMailOptions(): ISendMailOptions[] {
    const headers = {
      'List-Unsubscribe':
        '<https://example.com/unsubscribe?email=user@example.com>, <mailto:unsubscribe@example.com?subject=unsubscribe>',
    };
    if (this.tag) headers['x-mailgun-tag'] = this.tag;
    return this.receivers.map((receiver) => {
      let context = this.context;
      if (receiver.username) {
        context = { ...this.context, username: receiver.username };
      }
      return {
        template: this.template,
        subject: this.subject,
        from: this.from,
        to: receiver.email,
        headers,
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
