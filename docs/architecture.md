# Architecture

## Monorepo

- **pnpm workspaces** (`apps/*`, `packages/*`) with isolated `node_modules`.
  `pnpm-workspace.yaml` lists the only packages allowed to run install
  scripts; all are currently denied because they ship prebuilt binaries.
- **Turborepo** orchestrates tasks (`turbo.json`). `test` depends on
  `test:unit` and `test:integration`; `test:e2e` depends on the builds it runs
  against, and the web E2E task also builds the API
  (`apps/web/turbo.json`).
- **Node.js 24** and **pnpm 12**, pinned in `.nvmrc` and `packageManager`.
- **Prettier** formats the whole repository from the root. Each app keeps the
  linter its framework ships with.

## Apps

| App           | Framework             | Port | Lint          | Test runners                     |
| ------------- | --------------------- | ---- | ------------- | -------------------------------- |
| `apps/api`    | NestJS 12 (ESM)       | 3001 | oxlint        | Vitest, Supertest                |
| `apps/web`    | Next.js 16 App Router | 3000 | ESLint (next) | Vitest, MSW, Playwright          |
| `apps/mobile` | Expo SDK 58, Router   | —    | ESLint (expo) | Jest (`jest-expo`), MSW, Maestro |

All API routes are served under the `/api` prefix. The web app and the mobile
app read the API base URL from `NEXT_PUBLIC_API_URL` and `EXPO_PUBLIC_API_URL`.

## Shared code

`packages/` is empty on purpose. A shared package (for example, API contracts
used by the API and both clients) is added when the first feature needs the
same code in two apps, not before. Until then, small duplications such as the
`HealthStatus` type are accepted.

## Decisions

Short records of choices that are not obvious from the code. The reasoning
behind each testing dependency, with the alternatives and their trade-offs, is
in [`dependency-decisions.md`](dependency-decisions.md).

### Test runners follow each framework's default

NestJS 12 and Next.js work well with Vitest; Expo only supports Jest
(`jest-expo`). Instead of forcing one runner everywhere, each app uses the
runner its framework supports best. The layer definitions, file naming and
script names are the same in every app, so the difference stays invisible to
whoever runs the tests.

### MSW mocks the network on both frontends

Both frontends mock HTTP at the network level with MSW instead of mocking
`fetch` or the API client. Tests exercise the real client code, and the same
handler style works in web and mobile. Unhandled requests fail the test.

### E2E runs against production builds

Playwright starts `next start` and the compiled API (`node dist/main`), never
dev servers, so E2E tests check what actually ships.

### Mobile E2E uses Maestro, locally for now

Maestro flows are plain YAML, readable by humans and agents, and work on both
iOS and Android. They need a simulator or emulator, so they are not in CI yet.
Adding them (for example, through EAS Workflows or a macOS runner) is a
planned follow-up.

### Dependency release-age policy

pnpm 12 refuses packages published less than a day ago. Versions are pinned
to releases older than that, which is why some packages are one patch behind
the latest (for example, `expo-doctor` reports a patch mismatch for `expo`).
Upgrade them in a later change once the newer release is old enough.
