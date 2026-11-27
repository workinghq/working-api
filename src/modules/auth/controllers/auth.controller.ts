import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service.js';
import {
  type RegisterUserDto,
  registerUserSchema,
} from '../dto/register-user.dto.js';
import { type LoginDto, loginSchema } from '../dto/login.dto.js';
import {
  CurrentUser,
  EmailVerificationService,
  Public,
  SignInService,
} from '@nestjs/authentication';
import { Throttle } from '@nestjs/throttler';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly signInService: SignInService,
    private readonly emailVerificationService: EmailVerificationService,
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
  ): Promise<UserResponseDto> {
    const user = await this.authService.register(registerUserDto);
    await this.signInService.signIn(user.id, { method: 'password' });
    await this.emailVerificationService.send(user);

    return user;
  }

  @Public()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000,
    },
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body({ schema: loginSchema }) loginDto: LoginDto,
  ): Promise<UserResponseDto> {
    const user = await this.authService.login(loginDto);
    await this.signInService.signIn(user.id, { method: 'password' });

    return user;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(): Promise<void> {
    const logout = await this.signInService.signOut();
    if (!logout) throw new UnauthorizedException();
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logoutAll(@CurrentUser('id') userId: string): Promise<void> {
    await this.signInService.signOutEverywhere(userId);
  }
}
