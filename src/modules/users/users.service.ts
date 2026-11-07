import { Inject, Injectable } from '@nestjs/common';
import {
  CreateUserInput,
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/users.repository.js';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly userRepository: UsersRepository,
  ) {}

  async create(data: CreateUserInput) {
    return this.userRepository.create(data);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }
}
