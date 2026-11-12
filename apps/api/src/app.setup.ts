import type { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'api';

const DEFAULT_WEB_ORIGIN = 'http://localhost:3000';

/**
 * Applies the global configuration shared by the running server and the
 * end-to-end tests, so both exercise exactly the same HTTP surface.
 */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix(API_PREFIX);
  app.enableCors({
    origin: (process.env.WEB_ORIGIN ?? DEFAULT_WEB_ORIGIN).split(','),
  });
  app.enableShutdownHooks();
  return app;
}
