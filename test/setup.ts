import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/database/prisma.service.js';

export default async function setup() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  return async function teardown() {
    try {
      const prisma = app.get(PrismaService);

      await prisma.session.deleteMany();
      await prisma.user.deleteMany();
    } finally {
      await app.close();
    }
  };
}
