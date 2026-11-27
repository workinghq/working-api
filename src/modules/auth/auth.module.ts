import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { SessionAuth } from './providers/session-auth.provider.js';
import { PrismaSessionStore } from './stores/prisma.session.store.js';
import { SessionsController } from './controllers/sessions.controller.js';
import { EmailVerificationProvider } from './providers/email-verification.provider.js';
import { EmailVerificationController } from './controllers/email-verification.controller.js';
import { PrismaEmailTokenStore } from './stores/prisma.email-token.store.js';
import { NotificationsModule } from '../notifications/notifications.module.js';

@Module({
  imports: [UsersModule, NotificationsModule],
  controllers: [
    AuthController,
    SessionsController,
    EmailVerificationController,
  ],
  providers: [
    SessionAuth,
    AuthService,
    HashingService,
    EmailVerificationProvider,
    PrismaSessionStore,
    PrismaEmailTokenStore,
  ],
})
export class AuthModule {}
