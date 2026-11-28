import {
  AuthenticationStorage,
  EmailTokenPurpose,
  EmailTokenRecord,
  EmailTokenStore,
} from '@nestjs/authentication';
import { PrismaAuthenticationStore } from './prisma.authentication.store.js';
import { PrismaService } from '../../../database/prisma.service.js';
import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaEmailTokenStore
  extends PrismaAuthenticationStore
  implements EmailTokenStore
{
  constructor(prismaService: PrismaService, storage: AuthenticationStorage) {
    super(prismaService);
    storage.registerSource({ emailTokens: this });
  }

  async saveEmailToken(record: EmailTokenRecord): Promise<void> {
    await this.prismaService.emailToken.create({ data: record });
    await this.cleanTokens('emailToken', record.createdAt);
  }

  async consumeEmailToken(
    id: string,
    purpose: EmailTokenPurpose,
  ): Promise<EmailTokenRecord | undefined> {
    try {
      const emailToken = await this.prismaService.emailToken.delete({
        where: { id, purpose },
      });

      return {
        ...emailToken,
        purpose: emailToken.purpose as EmailTokenPurpose,
        fingerprint: emailToken.fingerprint ?? undefined,
      };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return undefined;
      }

      throw error;
    }
  }

  async deleteUserEmailTokens(
    userId: string,
    purpose: EmailTokenPurpose,
  ): Promise<void> {
    await this.prismaService.emailToken.deleteMany({
      where: { userId, purpose },
    });
  }
}
