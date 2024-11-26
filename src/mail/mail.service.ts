import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { SendMjmlDto } from './send-mjml.dto';
import { SendMailDto } from './send-mail.dto';
import mailConfig from './mail.config';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {
    console.log('MailService init: ', mailConfig());
  }

  private templates = [];

  // async onModuleInit() {
  //   this.templates = await this.readTemplates(
  //     join(__dirname, '/mail/templates'),
  //   );
  // }

  // async readTemplates(path: string) {
  //   const files = await fs.readdir(path);
  //   return files
  //     .filter((file) => file.endsWith('.hbs'))
  //     .map((file) => file.replace('.hbs', ''));
  // }

  async sendMjml(dto: SendMjmlDto) {
    const sendMjmlDto = new SendMjmlDto(dto);
    // const template = Handlebars.compile(dto.mjmlCode);
    // const html = template(dto.context);
    return this.sendRequest(sendMjmlDto);
    // const emailReceivers = this.parseRequest(receivers);
    // return this.sendRequest(
    //   this.getEmails(emailReceivers),
    //   this.parseTemplate(subject, template, context, from),
    //   tag,
    // );
  }

  // async sendByTemplate(dto: SendTemplateMailDto) {
  //   if (!this.templates.includes(dto.template))
  //     throw new Error('Template not found');
  //   console.log('sendByTemplate: ', dto);
  //   return this.sendRequest(dto);
  // }

  async sendRequest(dto: SendMailDto) {
    const errorEmail = [];
    const batchSize = 20;
    const optionsArray = dto.toMailOptions();
    for (const batch of _.chunk(optionsArray, batchSize)) {
      try {
        const tasks = batch.map(async (option) => {
          // 可根據 tag 分析點擊率，也可多個 tag
          // const result = await this.sendMail({ ...option, headers: { 'x-mailgun-tag': dto.tag } });
          console.log('sendMail before: ', option);
          const result = await this.sendMail(option);
          console.log('sendMail result: ', result);
          if (!result) errorEmail.push(option);
        });
        await Promise.all(tasks);
      } catch (e) {
        console.log('sendMail error: ', e);
        errorEmail.push(...batch);
      }
    }
    const result = {
      total: dto.receivers.length,
      success: dto.receivers.length - errorEmail.length,
      error: errorEmail.length,
      errorEmail: errorEmail,
    };
    console.log('sendMail response: ', result);
    return result;
  }

  async sendMail(options: ISendMailOptions) {
    try {
      return this.mailerService.sendMail(options);
    } catch (e) {
      console.log('sendMail error: ', e);
    }
  }
}
