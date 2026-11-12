/**
 * Jest runs with `--experimental-vm-modules` (see package.json scripts) so it
 * can load ESM-only test dependencies such as MSW 3 natively, instead of
 * maintaining a transform allow-list for every one of them.
 *
 * @type {import('jest').Config}
 */
const shared = {
  preset: 'jest-expo',
  // pnpm stores packages under node_modules/.pnpm, so the allow-list must
  // match React Native / Expo packages from there too.
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\.pnpm/[^/]+/node_modules/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg))',
  ],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/src/test/style-stub.js',
  },
};

module.exports = {
  projects: [
    {
      ...shared,
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.spec.ts?(x)'],
    },
    {
      ...shared,
      displayName: 'integration',
      testEnvironment: '<rootDir>/src/test/integration-environment.js',
      testMatch: ['<rootDir>/src/**/*.int-spec.ts?(x)'],
      setupFilesAfterEnv: ['<rootDir>/src/test/setup-integration.ts'],
    },
  ],
};
