import {
  ANDROID_EMULATOR_HOST,
  DEFAULT_API_URL,
  resolveApiUrl,
} from './api-url';

// Unit: a pure function covering the platform-specific branches.
describe('resolveApiUrl', () => {
  it('keeps localhost on iOS', () => {
    expect(resolveApiUrl('ios', 'http://localhost:3001')).toBe(
      'http://localhost:3001',
    );
  });

  it.each(['http://localhost:3001', 'http://127.0.0.1:3001'])(
    'rewrites loopback %s to the emulator host on Android',
    (configured) => {
      expect(resolveApiUrl('android', configured)).toBe(
        `http://${ANDROID_EMULATOR_HOST}:3001`,
      );
    },
  );

  it('leaves non-loopback hosts untouched on Android', () => {
    expect(resolveApiUrl('android', 'https://api.example.test/')).toBe(
      'https://api.example.test',
    );
  });

  it('falls back to the default URL when none is configured', () => {
    expect(resolveApiUrl('ios', undefined)).toBe(DEFAULT_API_URL);
    expect(resolveApiUrl('ios', '')).toBe(DEFAULT_API_URL);
  });
});
