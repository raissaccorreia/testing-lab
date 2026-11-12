const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1']);

/** Host the Android emulator uses to reach the development machine. */
export const ANDROID_EMULATOR_HOST = '10.0.2.2';

export const DEFAULT_API_URL = 'http://localhost:3001';

/**
 * Resolves the API base URL for the current platform.
 *
 * The Android emulator runs in its own network namespace, so `localhost`
 * there is the emulator itself. Loopback hosts are rewritten to the host
 * machine alias; every other URL is returned untouched.
 */
export function resolveApiUrl(
  platform: string,
  configuredUrl: string | undefined = DEFAULT_API_URL,
): string {
  const url = new URL(configuredUrl || DEFAULT_API_URL);
  if (platform === 'android' && LOOPBACK_HOSTS.has(url.hostname)) {
    url.hostname = ANDROID_EMULATOR_HOST;
  }
  return url.origin;
}
