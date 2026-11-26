import { Module } from '@nestjs/common';
import { USERS_REPOSITORY } from './repositories/users.repository.js';
import { PrismaUsersRepository } from './repositories/prisma.users.repository.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { HashingService } from '../../common/services/hashing.service.js';

@Module({
  controllers: [UsersController],
  providers: [
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
    UsersService,
    HashingService,
  ],
  exports: [USERS_REPOSITORY],
})
export class UsersModule {}
