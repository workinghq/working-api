import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { User } from './entities/user.entity.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { type UpdateUserDto, updateUserSchema } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';
import {
  type UpdatePasswordDto,
  updatePasswordSchema,
} from './dto/update-password.dto.js';
import { Throttle } from '@nestjs/throttler';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user;
  }

  @Patch('me')
  async updateMe(
    @CurrentUser('id') id: string,
    @Body({ schema: updateUserSchema }) dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Throttle({
    default: {
      limit: 3,
      ttl: 60000,
    },
  })
  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @CurrentUser('id') id: string,
    @Body({ schema: updatePasswordSchema }) dto: UpdatePasswordDto,
  ): Promise<void> {
    await this.usersService.updatePassword(id, dto);
  }
}
