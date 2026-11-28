import {
  AuthenticationRegistry,
  EmailVerificationHandler,
  EmailVerificationLink,
} from '@nestjs/authentication';
import { Mailer } from '@nestjs/mail';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../users/repositories/users.repository.js';
import { Inject, Injectable } from '@nestjs/common';
import { VerifyEmailMailer } from '../../notifications/mailers/verify-email.mailer.js';

@Injectable()
export class EmailVerificationProvider extends EmailVerificationHandler {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    private readonly mailer: Mailer,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerHandler('emailVerification', this);
  }

  async send(link: EmailVerificationLink): Promise<void> {
    await this.mailer.send(VerifyEmailMailer, { to: link.email, data: link });
  }

  async markVerified(userId: string, email: string): Promise<boolean> {
    return this.usersRepository.markEmailVerified(userId, email);
  }
}
