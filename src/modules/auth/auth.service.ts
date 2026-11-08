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
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    private readonly hashingService: HashingService,
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      this.logger.warn('User registration failed: email already taken');
      throw new ConflictException('Email already taken');
    }

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash: await this.hashingService.hash(dto.password),
    });

    this.logger.info({ userId: user.id }, 'User registered');

    return UserMapper.toResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    const valid = await this.hashingService.compare(
      dto.password,
      user?.passwordHash,
    );

    if (!user || !valid) {
      this.logger.warn('User login faield: invalid credentals');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (this.hashingService.needsReHash(user.passwordHash)) {
      await this.usersRepository.updatePasswordHash(
        user.id,
        await this.hashingService.hash(dto.password),
      );

      this.logger.debug('User password hash updated');
    }

    this.logger.info({ userId: user.id }, 'User logged in');
    return UserMapper.toResponse(user);
  }
}
