import {
  AuthenticationStorage,
  MfaState,
  SessionRecord,
  SessionStore,
} from '@nestjs/authentication';
import { PrismaService } from '../../../database/prisma.service.js';
import { Prisma } from '../../../generated/prisma/client.js';
import z from 'zod';
import { PrismaAuthenticationStore } from './prisma.authentication.store.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaSessionStore
  extends PrismaAuthenticationStore
  implements SessionStore
{
  constructor(prismaService: PrismaService, storage: AuthenticationStorage) {
    super(prismaService);
    storage.registerSource({ sessions: this });
  }

  async getSession(id: string): Promise<SessionRecord | undefined> {
    const session = await this.prismaService.session.findUnique({
      where: { id },
    });

    return session ? formatSessionResponse(session) : undefined;
  }

  async createSession(record: SessionRecord): Promise<void> {
    await this.prismaService.session.create({
      data: {
        id: record.id,
        userId: record.userId,
        createdAt: record.createdAt,
        expiresAt: record.expiresAt,
        lastActiveAt: record.lastActiveAt,
        metadata: record.metadata as Prisma.InputJsonValue,
        mfa: record.mfa ?? undefined,
      },
    });
  }

  async touchSession(id: string, lastActiveAt: Date): Promise<void> {
    await this.prismaService.session.updateMany({
      where: { id, lastActiveAt: { lt: lastActiveAt } },
      data: { lastActiveAt },
    });
  }

  async deleteSession(id: string): Promise<boolean> {
    const result = await this.prismaService.session.deleteMany({
      where: { id },
    });

    return result.count > 0;
  }

  async listUserSessions(userId: string): Promise<SessionRecord[]> {
    const sessions = await this.prismaService.session.findMany({
      where: { userId },
    });

    return sessions.map((s) => formatSessionResponse(s));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await this.prismaService.session.deleteMany({ where: { userId } });
  }
}

function formatSessionResponse(session: Prisma.SessionModel): SessionRecord {
  return {
    id: session.id,
    userId: session.userId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastActiveAt: session.lastActiveAt,
    metadata: toRecordMetadata(session.metadata),
    mfa: (session.mfa as MfaState) ?? undefined,
  };
}

function toRecordMetadata(
  value: Prisma.JsonValue,
): Record<string, unknown> | undefined {
  const metadata = z.record(z.string(), z.unknown()).safeParse(value);

  return metadata.success ? metadata.data : undefined;
}
