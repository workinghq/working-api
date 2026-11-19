import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from './repositories/users.repository.js';
import { PrismaUsersRepository } from './repositories/prisma.users.repository.js';
import { UsersController } from './users.controller.js';

@Module({
  controllers: [UsersController],
  providers: [{ provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
