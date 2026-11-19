import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { User } from './entities/user.entity.js';

@Controller('users')
export class UsersController {
  @Get('me')
  me(@CurrentUser() user: User) {
    return user;
  }
}
