import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { USERS_REPOSITORY } from './repositories/users.repository.js';
import { PrismaUsersRepository } from './repositories/prisma.users.repository.js';

@Module({
  providers: [
    UsersService,
    { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository },
  ],
  exports: [UsersService],
})
export class UsersModule {}
