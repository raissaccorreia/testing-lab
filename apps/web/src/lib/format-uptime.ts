/**
 * Formats a duration in whole seconds as a compact, human-readable string,
 * e.g. 3725 -> "1h 2m 5s". Negative or non-finite input is treated as 0.
 */
export function formatUptime(totalSeconds: number): string {
  const seconds =
    Number.isFinite(totalSeconds) && totalSeconds > 0
      ? Math.floor(totalSeconds)
      : 0;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (hours > 0 || minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${rest}s`);
  return parts.join(' ');
}
