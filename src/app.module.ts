import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configSchema } from './config/config.schema.js';
import { LoggerModule } from 'nestjs-pino';
import { HealthModule } from './modules/health/health.module.js';
import { PrismaModule } from './database/prisma.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WorkspacesModule } from './modules/workspaces/workspaces.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: configSchema }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') === 'production';

        return {
          forRoutes: [{ path: '(.*)', method: RequestMethod.ALL }],
          pinoHttp: {
            level: configService.get('LOG_LEVEL'),
            autoLogging: true,

            serializers: {
              req: (req: FastifyRequest) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
              }),
              res: (res: FastifyReply) => ({
                statusCode: res.statusCode,
              }),
            },

            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
          },
        };
      },
    }),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        session: {
          absoluteTtl: '14d',
          idleTtl: '3d',
        },
        emailVerification: {
          url: `${configService.get('WEB_APP_URL')}/email-verification`,
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 10 },
          { name: 'default', ttl: 60000, limit: 100 },
        ],
        skipIf: () => configService.get('NODE_ENV') === 'test',
      }),
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
