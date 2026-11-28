import { AuthenticationStorage } from '@nestjs/authentication';
import { PrismaService } from '../../src/database/prisma.service.js';
import { PrismaSessionStore } from '../../src/modules/auth/stores/prisma.session.store.js';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../src/database/prisma.module.js';
import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { ConfigModule } from '@nestjs/config';
import { testConfig } from '../utils/test-config.js';
import { PrismaEmailTokenStore } from '../../src/modules/auth/stores/prisma.email-token.store.js';

class CappedSessionStore extends PrismaSessionStore {
  protected override readonly maxPending = 3;
}

class CappedEmailTokenStore extends PrismaEmailTokenStore {
  protected override readonly maxPending = 3;
}

async function emptyStore(prismaService: PrismaService) {
  await prismaService.emailToken.deleteMany();
  await prismaService.session.deleteMany();

  const authStorage = new AuthenticationStorage();
  const sessionsStore = new CappedSessionStore(prismaService, authStorage);
  const emailTokenStore = new CappedEmailTokenStore(prismaService, authStorage);

  return { sessions: sessionsStore, emailTokens: emailTokenStore };
}

describe('PrismaSessionStore', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(testConfig), PrismaModule],
      providers: [
        AuthenticationStorage,
        {
          provide: CappedSessionStore,
          useFactory: (prisma: PrismaService, storage: AuthenticationStorage) =>
            new CappedSessionStore(prisma, storage),
          inject: [PrismaService, AuthenticationStorage],
        },
        {
          provide: CappedEmailTokenStore,
          useFactory: (prisma: PrismaService, storage: AuthenticationStorage) =>
            new CappedEmailTokenStore(prisma, storage),
          inject: [PrismaService, AuthenticationStorage],
        },
      ],
    }).compile();

    prisma = module.get(PrismaService);
  });

  for (const c of authenticationStoreContract(() => emptyStore(prisma), {
    concurrent: false,
    maxPending: 3,
    contracts: ['sessions', 'emailTokens'],
  })) {
    it(c.name, c.run.bind(c));
  }
});
