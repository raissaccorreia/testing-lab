<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# `apps/web`

Read the root [`AGENTS.md`](../../AGENTS.md) and
[`docs/testing-strategy.md`](../../docs/testing-strategy.md) first. This file
only adds what is specific to the Next.js app.

- Test file naming decides the layer:
  - `src/**/*.spec.ts(x)` — unit (Vitest, Node environment)
  - `src/**/*.int-spec.tsx` — integration (Vitest + jsdom + Testing Library,
    network mocked with MSW)
  - `e2e/**/*.e2e-spec.ts` — end-to-end (Playwright against a production
    build of this app and a running API)
- The API base URL comes from `NEXT_PUBLIC_API_URL` (see `.env.example`).
- Network mocks live in [`src/test/msw`](src/test/msw); reuse their handlers
  instead of mocking `fetch` by hand.
