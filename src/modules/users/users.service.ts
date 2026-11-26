import {
  ConflictException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from './repositories/users.repository.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UserMapper } from './mappers/user.mapper.js';
import { UniqueConstraintError } from '../../common/errors/unique-constraint.error.js';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { HashingService } from '../../common/services/hashing.service.js';
import { UpdatePasswordDto } from './dto/update-password.dto.js';

export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
    private readonly hashingService: HashingService,
  ) {}

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.usersRepository.update(id, dto);
      if (!user) throw new NotFoundException('User not found');

      this.logger.info('User profile updated');

      return UserMapper.toResponse(user);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        this.logger.warn('User registration failed: email already taken');
        throw new ConflictException('Email already taken');
      }

      throw error;
    }
  }

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.usersRepository.findById(id);
    const valid = await this.hashingService.compare(
      dto.currentPassword,
      user?.passwordHash,
    );

    if (!user || !valid) {
      this.logger.warn('User update password failed: Incorrect password');
      throw new UnauthorizedException('Passwords does not match');
    }

    const passwordHash = await this.hashingService.hash(dto.newPassword);
    const updated = await this.usersRepository.updatePasswordHash(
      id,
      passwordHash,
    );

    if (!updated) throw new NotFoundException('User not found');

    this.logger.info('User password updated');
  }
}
