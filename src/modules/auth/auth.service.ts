import { ConflictException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { UserMapper } from '../users/mappers/user.mapper.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashingService: HashingService,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already taken');
    }

    const passwordHash = await this.hashingService.hash(dto.password);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
    });

    return UserMapper.toResponse(user);
  }
}
