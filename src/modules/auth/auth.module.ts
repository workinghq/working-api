import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { AuthController } from './auth.controller.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, HashingService],
})
export class AuthModule {}
