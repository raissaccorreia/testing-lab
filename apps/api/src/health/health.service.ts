import { Injectable } from '@nestjs/common';

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

export const UPTIME_SOURCE = Symbol('UPTIME_SOURCE');

/** Returns the process uptime in seconds. Injected so tests can control time. */
export type UptimeSource = () => number;

@Injectable()
export class HealthService {
  constructor(private readonly uptime: UptimeSource) {}

  check(): HealthStatus {
    return { status: 'ok', uptimeSeconds: Math.floor(this.uptime()) };
  }
}
