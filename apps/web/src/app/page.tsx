import { ApiStatus } from '@/components/api-status';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Testing Lab</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        A reference monorepo for unit, integration and end-to-end tests.
      </p>
      <ApiStatus />
    </main>
  );
}
