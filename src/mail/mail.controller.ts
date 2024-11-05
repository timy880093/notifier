import { Body, Controller, Post } from '@nestjs/common';
import { SendTemplateMailDto } from './send-template-mail.dto';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}
  @Post('template')
  async sendTemplateMail(@Body() dto: SendTemplateMailDto) {
    console.log(dto);
    return this.mailService.sendByTemplate(dto);
  }
}
