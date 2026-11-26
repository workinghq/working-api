import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { ConfigModule } from '@nestjs/config';
import { testConfig } from '../utils/test-config.js';
import { createAuthenticatedUser } from '../utils/create-auth-user.js';
import { PrismaService } from '../../src/database/prisma.service.js';
import { cleanDatabase } from '../utils/clean-db.js';
import { StandardSchemaValidationPipe } from '@nestjs/common';

describe('Users', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(ConfigModule)
      .useModule(ConfigModule.forRoot(testConfig))
      .compile();

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users/me', () => {
    it('should return 200 when the user is logged in', async () => {
      const { user, authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'GET',
        url: '/users/me',
        cookies: [authCookie],
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    });
  });

  describe('PATCH /users/me', () => {
    it('should return 200 when the data is valid', async () => {
      const { user, authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/me',
        cookies: [authCookie],
        body: { name: 'new-name' },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: user.id,
        name: 'new-name',
        email: user.email,
      });
    });

    it('should return 400 when the data sent is invalid', async () => {
      const { authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/me',
        cookies: [authCookie],
        body: { email: 'invalidemail' },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return 409 if the email is already taken', async () => {
      const { user: existUser } = await createAuthenticatedUser(app);
      const { authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/me',
        cookies: [authCookie],
        body: { email: existUser.email },
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('PATCH /users/me/password', () => {
    it('should return 204 when the password is valid', async () => {
      const { authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/me/password',
        cookies: [authCookie],
        body: { password: 'new-Strong-pass' },
      });

      expect(response.statusCode).toBe(204);
    });

    it('should return 400 when the password sent is invalid', async () => {
      const { authCookie } = await createAuthenticatedUser(app);

      const response = await app.inject({
        method: 'PATCH',
        url: '/users/me/password',
        cookies: [authCookie],
        body: { password: 'inv' },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
