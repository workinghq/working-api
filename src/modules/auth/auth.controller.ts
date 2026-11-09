import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  type RegisterUserDto,
  registerUserSchema,
} from './dto/register-user.dto.js';
import { type LoginDto, loginSchema } from './dto/login.dto.js';
import { CurrentUser, Public, SignInService } from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly signInService: SignInService,
  ) {}

  @Public()
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

  @Public()
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

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout() {
    const logout = await this.signInService.signOut();
    if (!logout) throw new UnauthorizedException();
  }

  @Post('logout-all')
  @HttpCode(204)
  async logoutAll(@CurrentUser('id') userId: string) {
    await this.signInService.signOutEverywhere(userId);
  }
}
