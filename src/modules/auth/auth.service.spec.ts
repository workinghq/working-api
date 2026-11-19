import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { USERS_REPOSITORY } from '../users/repositories/users.repository.js';
import { getLoggerToken } from 'nestjs-pino';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository = {
    create: vi.fn(),
    findByEmail: vi.fn(),
    updatePasswordHash: vi.fn(),
  };
  let hashService = {
    hash: vi.fn(),
    compare: vi.fn(),
    needsReHash: vi.fn(),
  };

  const mockUser = {
    id: 'user-id',
    name: 'user',
    email: 'user@email.com',
    passwordHash: 'hashed-password',
  };

  const registerDto = {
    name: 'user',
    email: 'user@email.com',
    password: '123456',
  };

  const loginDto = {
    email: 'user@email.com',
    password: '123456',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY,
          useValue: usersRepository,
        },
        { provide: HashingService, useValue: hashService },
        {
          provide: getLoggerToken(AuthService.name),
          useValue: { info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should fail if the email is already taken', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should register a user successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed-password');
      usersRepository.create.mockResolvedValue(mockUser);

      await authService.register(registerDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(
        'user@email.com',
      );
    });
  });

  describe('login', () => {
    it('should fail if the user does not exist', async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      hashService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        undefined,
      );
    });

    it('should fail if the password is invalid', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
    });

    it('should login successfully', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      hashService.needsReHash.mockReturnValue(false);

      await authService.login(loginDto);

      expect(usersRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.passwordHash,
      );
      expect(hashService.needsReHash).toHaveBeenCalledWith(
        mockUser.passwordHash,
      );
      expect(usersRepository.updatePasswordHash).not.toHaveBeenCalled();
    });

    it('should update password hash if rehash is needed', async () => {
      usersRepository.findByEmail.mockResolvedValue(mockUser);
      hashService.compare.mockResolvedValue(true);
      hashService.needsReHash.mockReturnValue(true);
      hashService.hash.mockResolvedValue('new-hashed-password');

      await authService.login(loginDto);

      expect(hashService.hash).toHaveBeenCalledWith(loginDto.password);
      expect(usersRepository.updatePasswordHash).toHaveBeenCalledWith(
        mockUser.id,
        'new-hashed-password',
      );
    });
  });
});
