import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { User } from '../entities/user.entity.js';
import { UserMapper } from '../mappers/user.mapper.js';
import {
  CreateUserInput,
  UpdateUserInput,
  UsersRepository,
} from './users.repository.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UniqueConstraintError } from '../../../common/errors/unique-constraint.error.js';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserInput): Promise<User> {
    try {
      const userCreated = await this.prismaService.user.create({ data });

      return UserMapper.toEntity(userCreated);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        console.dir(error.batchRequestIdx);
        throw new UniqueConstraintError();
      }

      throw error;
    }
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
    id: string,
    passwordHash: string,
  ): Promise<User | null> {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data: { passwordHash },
      });

      return UserMapper.toEntity(user);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      throw error;
    }
  }

  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    try {
      const user = await this.prismaService.user.update({
        where: { id },
        data,
      });
      return UserMapper.toEntity(user);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new UniqueConstraintError();
      }

      throw error;
    }
  }

  async markEmailVerified(id: string, email: string): Promise<boolean> {
    try {
      await this.prismaService.user.update({
        where: { id, email },
        data: { emailVerified: true },
      });

      return true;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return false;
      }

      throw error;
    }
  }
}
