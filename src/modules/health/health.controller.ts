import { Controller, Get } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import {
  HealthCheckResult,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service.js';

@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthCheckService,
    private readonly prisma: PrismaHealthIndicator,
    private readonly prismaService: PrismaService,
  ) {}

  @Get('live')
  liveness(): Promise<HealthCheckResult> {
    return this.healthService.check([]);
  }

  @Get('ready')
  async readiness(): Promise<HealthCheckResult> {
    return this.healthService.check([
      () => this.prisma.pingCheck('database', this.prismaService),
    ]);
  }
}
