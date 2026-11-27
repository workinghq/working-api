import { EmailVerificationLink } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { Mailable, MailTemplateContent } from '@nestjs/mail';

@Injectable()
export class VerifyEmailMailer implements Mailable<EmailVerificationLink> {
  render(data: EmailVerificationLink): MailTemplateContent {
    return {
      subject: 'Verify your WorKing account',
      template: 'verify-email',
      context: { url: data.url, expiresAt: data.expiresAt },
    };
  }
}
