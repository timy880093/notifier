import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendTemplateMailDto } from './send-template-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}
  @Post('template')
  async sendTemplateMail(@Body() dto: SendTemplateMailDto) {
    console.log(dto);
    return this.mailService.sendByTemplate(dto);
  }
}
