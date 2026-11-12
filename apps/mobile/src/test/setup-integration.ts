import { TEST_API_URL } from './msw/handlers';
import { server } from './msw/server';

declare global {
  var __nodeFetch: typeof fetch;
}

// Use Node's fetch instead of Expo's stubbed native one so MSW can intercept
// requests (see integration-environment.js).
Object.defineProperty(globalThis, 'fetch', {
  value: globalThis.__nodeFetch,
  writable: true,
  configurable: true,
});

process.env.EXPO_PUBLIC_API_URL = TEST_API_URL;

// Fail loudly on any request that has no handler: integration tests must
// never reach a real network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
