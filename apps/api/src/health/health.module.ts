import { Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import {
  HealthService,
  UPTIME_SOURCE,
  type UptimeSource,
} from './health.service.js';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: UPTIME_SOURCE,
      useValue: (() => process.uptime()) satisfies UptimeSource,
    },
    {
      provide: HealthService,
      useFactory: (uptime: UptimeSource) => new HealthService(uptime),
      inject: [UPTIME_SOURCE],
    },
  ],
})
export class HealthModule {}
