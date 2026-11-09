import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { AuthController } from './auth.controller.js';
import { SessionAuth } from './providers/session-auth.provider.js';
import { PrismaSessionStore } from './stores/prisma.session.store.js';
import { SessionsController } from './sessions.controller.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController, SessionsController],
  providers: [SessionAuth, AuthService, HashingService, PrismaSessionStore],
})
export class AuthModule {}
