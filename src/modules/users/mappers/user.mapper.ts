import { Prisma } from '../../../generated/prisma/client.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { User } from '../entities/user.entity.js';

export class UserMapper {
  static toEntity(data: Prisma.UserModel): User {
    return new User(
      data.id,
      data.name,
      data.email,
      data.passwordHash,
      data.createdAt,
      data.updatedAt,
      data.avatarUrl ?? undefined,
    );
  }

  static toPersistance(user: User): Prisma.UserCreateInput {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      avatarUrl: user.avatarUrl ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
