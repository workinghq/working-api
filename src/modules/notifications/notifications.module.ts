import { Module } from '@nestjs/common';
import { VerifyEmailMailer } from './mailers/verify-email.mailer.js';
import {
  FileMailTransport,
  FileTemplateEngine,
  MailModule,
  SmtpTransport,
} from '@nestjs/mail';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';

@Module({
  imports: [
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: configService.get('SMTP_URL')
          ? new SmtpTransport({ url: configService.get('SMTP_URL') })
          : new FileMailTransport({ directory: 'tmp/mail' }),
        templates: new FileTemplateEngine({
          dir: join(import.meta.dirname, '/templates'),
        }),
        from:
          configService.get('MAIL_FROM') ||
          'WorKing <no-reply@working-dev.com>',
      }),
    }),
  ],
  providers: [VerifyEmailMailer],
  exports: [VerifyEmailMailer],
})
export class NotificationsModule {}
