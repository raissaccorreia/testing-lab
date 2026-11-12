import { http, HttpResponse } from 'msw';

export const TEST_API_URL = 'http://api.test';

export const handlers = [
  http.get(`${TEST_API_URL}/api/health`, () =>
    HttpResponse.json({ status: 'ok', uptimeSeconds: 3725 }),
  ),
];
