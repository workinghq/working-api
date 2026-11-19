import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { User } from '../entities/user.entity.js';
import { UserMapper } from '../mappers/user.mapper.js';
import { CreateUserInput, UsersRepository } from './users.repository.js';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserInput): Promise<User> {
    const userCreated = await this.prismaService.user.create({ data });

    return UserMapper.toEntity(userCreated);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });

    return user ? UserMapper.toEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });

    return user ? UserMapper.toEntity(user) : null;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<User | null> {
    const user = await this.prismaService.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return user ? UserMapper.toEntity(user) : null;
  }
}
