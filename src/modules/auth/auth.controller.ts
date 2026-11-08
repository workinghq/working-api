import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  type RegisterUserDto,
  registerUserSchema,
} from './dto/register-user.dto.js';
import { type LoginDto, loginSchema } from './dto/login.dto.js';
import { Public, SignInService } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly signInService: SignInService,
  ) {}

  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Post('register')
  async register(
    @Body({ schema: registerUserSchema }) registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(registerUserDto);
  }

  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  @HttpCode(200)
  async login(@Body({ schema: loginSchema }) loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    await this.signInService.signIn(user.id, { method: 'password' });

    return user;
  }
}
