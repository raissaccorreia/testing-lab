import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { HealthModule } from './health.module.js';
import { UPTIME_SOURCE } from './health.service.js';

// Integration: the real module (routing, DI, serialization) over HTTP, with
// only the edge of the system (the clock) replaced.
describe('HealthModule (integration)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(UPTIME_SOURCE)
      .useValue(() => 7)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health returns the injected uptime', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', uptimeSeconds: 7 });
  });
});
