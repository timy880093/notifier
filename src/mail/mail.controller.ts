import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendTemplateMailDto } from './send-template-mail.dto';
import { SendMjmlDto } from './send-mjml.dto';

@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('mjml')
  async sendTemplateMail(@Body() dto: SendMjmlDto) {
    return this.mailService.sendMjml(dto);
  }
}
