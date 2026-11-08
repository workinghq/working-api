import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { AuthController } from './auth.controller.js';
import { SessionAuth } from './providers/session-auth.provider.js';
import { PrismaSessionStore } from './stores/prisma.session.store.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [SessionAuth, AuthService, HashingService, PrismaSessionStore],
})
export class AuthModule {}
