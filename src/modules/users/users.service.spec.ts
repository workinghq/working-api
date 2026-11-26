import { Test } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { USERS_REPOSITORY } from './repositories/users.repository.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { UniqueConstraintError } from '../../common/errors/unique-constraint.error.js';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { getLoggerToken } from 'nestjs-pino';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository = {
    update: vi.fn(),
    updatePasswordHash: vi.fn(),
    findById: vi.fn(),
  };
  let hashingService = {
    hash: vi.fn(),
    compare: vi.fn(),
  };

  const mockUser = {
    id: 'user-id',
    name: 'user',
    email: 'user@email.com',
    passwordHash: 'hashed-password',
  };
  const updateDto = { name: 'new-name' };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: usersRepository },
        { provide: HashingService, useValue: hashingService },
        {
          provide: getLoggerToken(UsersService.name),
          useValue: { info: vi.fn(), warn: vi.fn() },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  describe('update', () => {
    it('should fail if the user does not exist', async () => {
      usersRepository.update.mockResolvedValue(null);

      await expect(usersService.update('user-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(usersRepository.update).toHaveBeenCalledWith('user-id', updateDto);
    });

    it('should fail if the email is already taken', async () => {
      usersRepository.update.mockRejectedValue(new UniqueConstraintError());

      await expect(usersService.update('user-id', updateDto)).rejects.toThrow(
        ConflictException,
      );

      expect(usersRepository.update).toHaveBeenCalledWith('user-id', updateDto);
    });

    it('should update the user data successfully', async () => {
      usersRepository.update.mockResolvedValue(mockUser);

      await usersService.update('user-id', updateDto);

      expect(usersRepository.update).toHaveBeenCalledWith('user-id', updateDto);
    });
  });

  describe('updatePassword', () => {
    it('should fail if the passwords does not match', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      hashingService.compare.mockResolvedValue(false);

      await expect(
        usersService.updatePassword('user-id', {
          currentPassword: 'any-pass',
          newPassword: 'new-pass',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update the user password successfully', async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      hashingService.compare.mockResolvedValue(true);
      hashingService.hash.mockResolvedValue('hashed-pass');
      usersRepository.updatePasswordHash.mockResolvedValue(mockUser);

      await usersService.updatePassword('user-id', {
        currentPassword: 'any-pass',
        newPassword: 'new-pass',
      });

      expect(hashingService.compare).toHaveBeenCalledWith(
        'any-pass',
        mockUser.passwordHash,
      );
      expect(hashingService.hash).toHaveBeenCalledWith('new-pass');
      expect(usersRepository.updatePasswordHash).toHaveBeenCalledWith(
        'user-id',
        'hashed-pass',
      );
    });
  });
});
