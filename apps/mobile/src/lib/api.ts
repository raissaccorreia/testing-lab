import { Platform } from 'react-native';

import { resolveApiUrl } from './api-url';

export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

export function apiBaseUrl(): string {
  return resolveApiUrl(Platform.OS, process.env.EXPO_PUBLIC_API_URL);
}

export async function fetchHealth(
  baseUrl: string = apiBaseUrl(),
  init?: RequestInit,
): Promise<HealthStatus> {
  const response = await fetch(`${baseUrl}/api/health`, init);
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return (await response.json()) as HealthStatus;
}
