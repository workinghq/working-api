import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  SessionRecord,
} from '@nestjs/authentication';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../users/repositories/users.repository.js';
import { UserMapper } from '../../users/mappers/user.mapper.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

@Injectable()
export class SessionAuth extends SessionCookieProvider<UserResponseDto> {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    registry: AuthenticationRegistry,
  ) {
    super();
    registry.registerProvider(this);
  }

  async validate(session: SessionRecord): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findById(session.userId);
    return user ? UserMapper.toResponse(user) : null;
  }
}
