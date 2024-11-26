import { ISendMailOptions } from '@nestjs-modules/mailer';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export abstract class SendMailDto {
  @ApiProperty({ description: '標題' })
  readonly subject: string;

  @ApiProperty({ description: '標籤' })
  @IsString()
  readonly tag: string;

  @IsOptional()
  @IsString()
  readonly from: string;

  @ApiProperty({ description: '收件者' })
  @IsArray()
  readonly receivers: ReceiverDto[];

  abstract toMailOptions(): ISendMailOptions[];

  protected constructor(dto: Partial<SendMailDto>) {
    Object.assign(this, dto);
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
