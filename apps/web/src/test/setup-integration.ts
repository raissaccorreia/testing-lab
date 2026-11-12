import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { TEST_API_URL } from './msw/handlers';
import { server } from './msw/server';

process.env.NEXT_PUBLIC_API_URL = TEST_API_URL;

// Fail loudly on any request that has no handler: integration tests must
// never reach a real network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
