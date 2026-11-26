import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    TerminusModule.forRoot({
      logger: false,
    }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
