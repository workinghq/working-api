import { PrismaService } from '../../src/database/prisma.service.js';

export async function cleanDatabase(prisma: PrismaService) {
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
}
