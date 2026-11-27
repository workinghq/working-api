import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { ConfigModule } from '@nestjs/config';
import { testConfig } from '../utils/test-config.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { PrismaHealthIndicator } from '@nestjs/terminus';

describe('Health', () => {
  let app: NestFastifyApplication;
  let prismaHealthIndicator: PrismaHealthIndicator;

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
    await app.init();

    prismaHealthIndicator = app.get(PrismaHealthIndicator);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health/live', () => {
    it('Should return 200 when the application status is ok', async () => {
      const result = await app.inject({ method: 'GET', url: '/health/live' });

      expect(result.statusCode).toBe(200);
    });
  });

  describe('GET /health/ready', () => {
    it('Should return 200 when the application and dependencies status are available', async () => {
      const result = await app.inject({ method: 'GET', url: '/health/ready' });

      expect(result.statusCode).toBe(200);
    });

    it('Should return 503 when the database is unavailable', async () => {
      vi.spyOn(prismaHealthIndicator, 'pingCheck').mockResolvedValue({
        database: {
          status: 'down',
          message: 'Service unavailable',
          responseTime: 20,
        },
      });

      const result = await app.inject({ method: 'GET', url: '/health/ready' });

      expect(result.statusCode).toBe(503);
    });
  });
});
