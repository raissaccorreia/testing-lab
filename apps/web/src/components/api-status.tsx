'use client';

import { useEffect, useState } from 'react';
import { fetchHealth, type HealthStatus } from '@/lib/api';
import { formatUptime } from '@/lib/format-uptime';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; health: HealthStatus }
  | { kind: 'error' };

export function ApiStatus() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetchHealth(undefined, { signal: controller.signal })
      .then((health) => setState({ kind: 'ready', health }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ kind: 'error' });
      });
    return () => controller.abort();
  }, []);

  return (
    <section
      aria-labelledby="api-status-heading"
      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 id="api-status-heading" className="font-medium">
        API status
      </h2>
      <p role="status" className="mt-1 text-zinc-600 dark:text-zinc-400">
        {state.kind === 'loading' && 'Checking…'}
        {state.kind === 'ready' &&
          `Online · up ${formatUptime(state.health.uptimeSeconds)}`}
        {state.kind === 'error' && 'Unavailable'}
      </p>
    </section>
  );
}
