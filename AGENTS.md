# Agent guidelines for Testing Lab

This repository is a public reference for testing a Next.js web app, an Expo
mobile app and a NestJS API in one monorepo. Its value is the quality and
clarity of its tests. Treat every change as something other projects will
copy.

Each app has its own `AGENTS.md` with framework-specific notes. Read this file
first, then [`docs/testing-strategy.md`](docs/testing-strategy.md), then the
`AGENTS.md` of the app you are changing.

## Purpose

- Few features, each one complex enough to be worth testing well.
- Every feature is covered at the unit, integration and end-to-end layers, in
  every app it touches.
- Tests are written to be read: they document the behavior and show the
  pattern to reuse.

## Agents must

- Use English for names, code, comments, commits, PRs and documentation.
- Follow the layer definitions and file naming in
  [`docs/testing-strategy.md`](docs/testing-strategy.md). The file name decides
  which runner and which layer a test belongs to.
- Add or update tests in the same change as the behavior they cover.
- Test behavior through public interfaces (HTTP contracts, rendered UI,
  exported functions), not implementation details.
- Mock only at the boundary allowed for the layer. Never mock the unit under
  test.
- Keep tests deterministic: inject clocks, randomness and IDs; no real network
  outside E2E; no arbitrary sleeps.
- Run `pnpm validate` before declaring work done, and `pnpm test:e2e` when the
  change touches a user flow or an HTTP contract.
- Pin dependency versions through the lockfile and add a dependency only with a
  documented need.
- Record notable technical decisions in [`docs/architecture.md`](docs/architecture.md).

## Agents must not

- Skip, disable or weaken a test to make a change pass. Fix the code or the
  test, and explain why in the PR.
- Add snapshot tests as a substitute for explicit assertions.
- Introduce real external services, paid APIs, secrets or personal data.
  Use synthetic data and `.env.example` files without credentials.
- Add shared packages under `packages/` before two apps actually need the same
  code.
- Expand scope beyond the feature being built without updating
  [`docs/features.md`](docs/features.md).

## Definition of done

A change is ready for review when:

- `pnpm validate` passes locally, and CI is green;
- every behavior it adds or changes is tested at the right layers;
- the E2E suite of each affected app covers the main user path;
- documentation that describes the changed behavior is updated;
- it contains no private, unlicensed or credential material.
