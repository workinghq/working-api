import { AuthenticationStorage } from '@nestjs/authentication';
import { PrismaService } from '../../src/database/prisma.service.js';
import { PrismaSessionStore } from '../../src/modules/auth/stores/prisma.session.store.js';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../src/database/prisma.module.js';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { ConfigModule } from '@nestjs/config';
import { testConfig } from '../utils/test-config.js';

class CappedStore extends PrismaSessionStore {
  protected override readonly maxPending = 3;
}

async function emptyStore(prismaService: PrismaService) {
  await prismaService.session.deleteMany();
  const store = new CappedStore(prismaService, new AuthenticationStorage());

  return { sessions: store };
}

describe('PrismaSessionStore', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(testConfig), PrismaModule],
      providers: [
        AuthenticationStorage,
        {
          provide: CappedStore,
          useFactory: (prisma: PrismaService, storage: AuthenticationStorage) =>
            new CappedStore(prisma, storage),
          inject: [PrismaService, AuthenticationStorage],
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  for (const c of authenticationStoreContract(() => emptyStore(prisma), {
    concurrent: true,
    maxPending: 3,
    contracts: ['sessions'],
  })) {
    it(c.name, c.run);
  }
});
