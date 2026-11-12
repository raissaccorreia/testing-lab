import { HealthService } from './health.service.js';

// Unit: one class, no Nest container, no I/O. Collaborators are plain fakes.
describe('HealthService', () => {
  it('reports ok with whole-second uptime', () => {
    const service = new HealthService(() => 42.9);

    expect(service.check()).toEqual({ status: 'ok', uptimeSeconds: 42 });
  });
});
