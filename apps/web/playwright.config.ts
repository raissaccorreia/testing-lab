import { defineConfig, devices } from '@playwright/test';

const WEB_PORT = 3000;
const API_PORT = 3001;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e-spec.ts',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // E2E runs against production builds of both apps, never dev servers.
  // `turbo run test:e2e` builds them first (see turbo.json).
  webServer: [
    {
      command: 'pnpm --filter @testing-lab/api start',
      url: `http://localhost:${API_PORT}/api/health`,
      env: {
        PORT: String(API_PORT),
        WEB_ORIGIN: `http://localhost:${WEB_PORT}`,
      },
      reuseExistingServer: !isCI,
    },
    {
      command: `pnpm start --port ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: !isCI,
    },
  ],
});
