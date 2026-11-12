# Testing Lab

A public reference monorepo for **unit, integration and end-to-end testing**
across a Next.js web app, an Expo mobile app and a NestJS API.

The product is deliberately small: a few features that are **complex enough to
be worth testing well**. The point of the repository is not the features; it is
the tests around them. They give humans and coding agents a trustworthy base to
build on, and later projects can copy the patterns from here.

> **Status:** skeleton. All three apps exist and every test layer runs green
> against a minimal walking skeleton (the apps report the API's health). The
> real features have not been chosen yet; see
> [`docs/features.md`](docs/features.md).

## Repository layout

```text
.
├── apps/
│   ├── api/       NestJS 12 API (Vitest, Supertest)
│   ├── web/       Next.js 16 app (Vitest, Testing Library, MSW, Playwright)
│   └── mobile/    Expo SDK 58 app (Jest, RN Testing Library, MSW, Maestro)
├── packages/      Shared code, added only when a feature needs it
├── docs/          Testing strategy, architecture, features, decisions
├── AGENTS.md      Rules for coding agents (read before changing anything)
└── turbo.json     Task graph for the whole monorepo
```

## Test layers at a glance

| Layer       | API (`apps/api`)                   | Web (`apps/web`)                      | Mobile (`apps/mobile`)               |
| ----------- | ---------------------------------- | ------------------------------------- | ------------------------------------ |
| Unit        | `src/**/*.spec.ts` (Vitest)        | `src/**/*.spec.ts(x)` (Vitest)        | `src/**/*.spec.ts(x)` (Jest)         |
| Integration | `src/**/*.int-spec.ts` (Supertest) | `src/**/*.int-spec.tsx` (jsdom + MSW) | `src/**/*.int-spec.tsx` (RNTL + MSW) |
| End-to-end  | `test/**/*.e2e-spec.ts` (full app) | `e2e/**/*.e2e-spec.ts` (Playwright)   | `e2e/flows/*.yaml` (Maestro)         |

What each layer means, what it may mock and how to name things is defined in
[`docs/testing-strategy.md`](docs/testing-strategy.md).

## Getting started

Requirements: Node.js 24 (see [`.nvmrc`](.nvmrc)) and pnpm 12 (pinned in
`package.json`; `corepack enable` picks it up).

```bash
pnpm install
```

Run the API and the web app together:

```bash
pnpm dev
```

The API listens on `http://localhost:3001`, the web app on
`http://localhost:3000`. To run the mobile app, start the Expo dev server and
open it in a simulator:

```bash
pnpm --filter @testing-lab/mobile dev
```

Each app documents its environment variables in its own `.env.example`. The
defaults work locally without any `.env` file.

## Commands

All commands run through Turborepo from the repository root.

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `pnpm test`             | Unit and integration tests in every app        |
| `pnpm test:unit`        | Unit tests only                                |
| `pnpm test:integration` | Integration tests only                         |
| `pnpm test:e2e`         | API and web end-to-end tests (builds first)    |
| `pnpm test:e2e:mobile`  | Mobile end-to-end flows (Maestro)              |
| `pnpm lint`             | Lint every app                                 |
| `pnpm typecheck`        | Type-check every app                           |
| `pnpm build`            | Production build of every app                  |
| `pnpm validate`         | Format check, lint, typecheck, tests and build |

Run a command for one app with a filter, for example
`pnpm turbo run test:unit --filter=@testing-lab/web`.

The web E2E suite needs a Playwright browser once:
`pnpm --filter @testing-lab/web exec playwright install chromium`. The mobile
E2E flows need [Maestro](https://docs.maestro.dev), a running simulator or
emulator with the app installed, and the API running; they are kept out of
`pnpm test:e2e` and CI until that setup is automated.

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every pull
request: format check, lint, typecheck, unit and integration tests, and builds
for all apps, plus the API and web E2E suites in a separate job.

## Documentation

- [`docs/testing-strategy.md`](docs/testing-strategy.md): the testing rules
  every change must follow.
- [`docs/architecture.md`](docs/architecture.md): monorepo structure and
  technical decisions.
- [`docs/features.md`](docs/features.md): how features are chosen, and the
  backlog.
- [`AGENTS.md`](AGENTS.md): working agreement for coding agents.

## License

[MIT](LICENSE)
