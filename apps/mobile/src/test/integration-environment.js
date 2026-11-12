const { TestEnvironment } = require('jest-expo/src/preset/nativeEnvironment');

/**
 * Integration test environment.
 *
 * jest-expo replaces the global `fetch` with Expo's native-backed
 * implementation, whose native module is a no-op stub under Jest, so requests
 * never resolve to a real response. Integration tests need a working,
 * spec-compliant `fetch` that MSW can intercept, so this environment keeps
 * Node's built-in one and re-installs it after the preset's setup runs (see
 * `setup-integration.ts`).
 */
class IntegrationEnvironment extends TestEnvironment {
  constructor(config, context) {
    super(config, context);
    this.global.__nodeFetch = this.global.fetch;
  }
}

module.exports = IntegrationEnvironment;
