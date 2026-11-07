import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { HashingService } from '../../common/services/hashing.service.js';
import { RegisterUserDto } from './dto/register-user.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { UserMapper } from '../users/mappers/user.mapper.js';
import { LoginDto } from './dto/login.dto.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../users/repositories/users.repository.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already taken');
    }

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await this.hashingService.hash(dto.password),
    });

    return UserMapper.toResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    const valid = await this.hashingService.compare(
      dto.password,
      user?.passwordHash,
    );

    if (!user || !valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.hashingService.needsReHash(user.passwordHash)) {
      await this.usersRepository.updatePasswordHash(
        user.id,
        await this.hashingService.hash(dto.password),
      );
    }

    return UserMapper.toResponse(user);
  }
}
