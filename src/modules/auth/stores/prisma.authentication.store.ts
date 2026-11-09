import { PrismaService } from '../../../database/prisma.service.js';

export abstract class PrismaAuthenticationStore {
  protected readonly maxPending: number = 100_000;

  constructor(protected readonly prismaService: PrismaService) {}
}
