import { defineConfig } from 'vitest/config';

const shared = {
  globals: true,
  root: './',
} as const;

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { ...shared, name: 'unit', include: ['src/**/*.spec.ts'] },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: 'integration',
          include: ['src/**/*.int-spec.ts'],
        },
      },
      {
        extends: true,
        test: { ...shared, name: 'e2e', include: ['test/**/*.e2e-spec.ts'] },
      },
    ],
  },
});
