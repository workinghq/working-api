import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  type RegisterUserDto,
  registerUserSchema,
} from './dto/register-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body({ schema: registerUserSchema }) registerUserDto: RegisterUserDto,
  ) {
    return this.authService.register(registerUserDto);
  }
}
