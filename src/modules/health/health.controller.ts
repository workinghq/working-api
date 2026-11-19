import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Public } from '@nestjs/authentication';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('live')
  liveness() {
    return {
      status: 'ok',
    };
  }

  @Get('ready')
  async readiness() {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      checks: {
        database: 'ok',
      },
    };
  }
}
