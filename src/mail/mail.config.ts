import { join } from 'path';

export default () => ({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
  templateDir: process.env.NODE_ENV?.toString().endsWith('local')
    ? join(process.cwd(), 'src/mail/templates')
    : join(__dirname, 'mail/templates'),
});
