import { PrismaService } from '../../../database/prisma.service.js';

export abstract class PrismaAuthenticationStore {
  protected readonly maxPending: number = 100_000;

  constructor(protected readonly prismaService: PrismaService) {}

  protected async cleanTokens(type: 'emailToken', now: Date) {
    await this.prismaService[type].deleteMany({
      where: { expiresAt: { lte: now } },
    });

    const [record] = await this.prismaService[type].findMany({
      orderBy: [{ expiresAt: 'desc' }],
      take: 1,
      skip: this.maxPending,
    });

    if (record) {
      await this.prismaService[type].deleteMany({
        where: { expiresAt: { lte: record.expiresAt } },
      });
    }
  }
}
