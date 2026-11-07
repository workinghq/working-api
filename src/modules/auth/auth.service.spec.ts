import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { HashingService } from '../../common/services/hashing.service.js';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService = {
    create: vi.fn(),
    findByEmail: vi.fn(),
  };
  let hashService = {
    hash: vi.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        { provide: HashingService, useValue: hashService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should fail if the email is already taken', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should register a user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      hashService.hash.mockResolvedValue('hashed-password');
      usersService.create.mockResolvedValue(mockUser);

      await authService.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('user@email.com');
    });
  });
});
