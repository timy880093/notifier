import { Injectable } from '@nestjs/common';
import { SendTemplateMailDto } from './send-template-mail.dto';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs/promises';
import { join } from 'path';
import _ from 'lodash';
import { SendHbsTemplateDto } from './send-hbs-template.dto';
import Handlebars from 'handlebars';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private templates = [];

  async onModuleInit() {
    this.templates = await this.readTemplates(
      join(__dirname, '/mail/templates'),
    );
  }

  async readTemplates(path: string) {
    const files = await fs.readdir(path);
    return files
      .filter((file) => file.endsWith('.hbs'))
      .map((file) => file.replace('.hbs', ''));
  }

  async sendHbsTemplateMail(dto: SendHbsTemplateDto) {
    if (!this.templates.includes(dto.template))
      throw new Error('Template not found');
    console.log('sendHbsTemplateMail: ', dto);
    const template = Handlebars.compile(dto.template);
    const html = template(dto.context);
    return this.sendRequest(dto);
    // const emailReceivers = this.parseRequest(receivers);
    // return this.sendRequest(
    //   this.getEmails(emailReceivers),
    //   this.parseTemplate(subject, template, context, from),
    //   tag,
    // );
  }

  async sendByTemplate(dto: SendTemplateMailDto) {
    if (!this.templates.includes(dto.template))
      throw new Error('Template not found');
    console.log('sendByTemplate: ', dto);
    return this.sendRequest(dto);
    // const emailReceivers = this.parseRequest(receivers);
    // return this.sendRequest(
    //   this.getEmails(emailReceivers),
    //   this.parseTemplate(subject, template, context, from),
    //   tag,
    // );
  }

  async sendRequest(dto: SendTemplateMailDto) {
    const errorEmail = [];
    const batchSize = 20;
    const optionsArray = dto.toMailOptions();
    for (const batch of _.chunk(optionsArray, batchSize)) {
      try {
        const tasks = batch.map(async (option) => {
          // 可根據 tag 分析點擊率，也可多個 tag
          // const result = await this.sendMail({ ...option, headers: { 'x-mailgun-tag': dto.tag } });
          const result = await this.sendMail(option);
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
