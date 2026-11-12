export interface HealthStatus {
  status: 'ok';
  uptimeSeconds: number;
}

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
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
