import {
  CurrentUser,
  EmailVerificationService,
  Public,
} from '@nestjs/authentication';
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../../users/entities/user.entity.js';

@Controller('auth/email')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body('token') token: string) {
    console.log(token);
    const verified = await this.emailVerificationService.verify(token);
    if (!verified) throw new UnauthorizedException('Invalid or expired link');

    return { email: verified.email, emailVerified: true };
  }

  @Post('verification')
  @HttpCode(HttpStatus.ACCEPTED)
  async resend(@CurrentUser() user: User) {
    if (user.emailVerified) {
      throw new ConflictException('Email already verified');
    }

    await this.emailVerificationService.send(user);
  }
}
