import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';
import mailConfig from './mail.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
        // console.log('mailConfig: ', mailConfig());
        return {
          // transport: 'smtps://user@domain.com:pass@smtp.domain.com',
          transport: {
            host: mailConfig().host,
            port: mailConfig().port,
            secure: false,
            auth: {
              user: mailConfig().username,
              pass: mailConfig().password,
            },
          },
          defaults: {
            from: '"lawplayer" <noreply@mail.lawslog.com>',
          },
          // template: {
          //   dir: mailConfig().templateDir,
          //   adapter: new HandlebarsAdapter(),
          //   options: {
          //     strict: true,
          //   },
          // },
        };
      },
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
})
export class MailModule {}
