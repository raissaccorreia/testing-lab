# Testing strategy

This document is the contract for every test in the repository. When the code
and this document disagree, fix one of them in the same change.

## Goals

1. **Confidence for agents.** An agent that changes code must learn quickly and
   reliably whether it broke anything.
2. **Reference quality.** Tests are examples that other projects will copy, so
   clarity matters as much as coverage.
3. **Fast feedback first.** Most checks run in milliseconds; slower layers
   exist to catch what the fast ones cannot.

## The three layers

The same three layers exist in every app. What changes between apps is the
tooling, not the definition.

### Unit

One unit of logic (a function, a class, a hook, a component with no
collaborators) in isolation.

- **Real:** the unit under test.
- **Replaced:** every collaborator, with plain fakes passed in through
  parameters or constructors. No framework container, no DOM unless the unit
  is a component, no I/O.
- **Speed:** milliseconds. Runs on every save.
- **Use for:** branching logic, edge cases, error handling, calculations,
  state machines. This is where most cases of a complex feature live.

### Integration

Several real units working together inside **one** app, with only the edges
of that app replaced.

- **Real:** the module, component tree, hooks, routing, dependency injection,
  serialization and HTTP client code of the app.
- **Replaced:** what lies outside the app: the network (MSW on the frontends),
  the clock and other non-deterministic sources (injected providers on the
  API). When the API gets a database, integration tests use a real database in
  a container rather than a mock.
- **Speed:** sub-second per test.
- **Use for:** wiring and contracts between units: does the request reach the
  right handler, does the screen show the right state for each response, does
  validation reject bad input.

### End-to-end (E2E)

The running system, exercised only through the interface a user or client
sees.

- **Real:** everything. Production builds, real processes, real HTTP, a real
  browser or simulator.
- **Replaced:** nothing inside the system. Only third-party services outside
  the repository may be stubbed, at the network level.
- **Speed:** seconds. Runs before merging.
- **Use for:** the main user paths of each feature, and the HTTP contract of
  the API as a client sees it. Keep the number of E2E tests small and the
  scenarios meaningful.

## Tooling and naming per app

The file name decides the layer and the runner.

| Layer       | `apps/api`                                   | `apps/web`                                                       | `apps/mobile`                                             |
| ----------- | -------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| Unit        | `src/**/*.spec.ts` (Vitest)                  | `src/**/*.spec.ts(x)` (Vitest, Node environment)                 | `src/**/*.spec.ts(x)` (Jest + `jest-expo`)                |
| Integration | `src/**/*.int-spec.ts` (Vitest + Supertest)  | `src/**/*.int-spec.tsx` (Vitest + jsdom + Testing Library + MSW) | `src/**/*.int-spec.tsx` (Jest + RN Testing Library + MSW) |
| E2E         | `test/**/*.e2e-spec.ts` (Vitest + Supertest) | `e2e/**/*.e2e-spec.ts` (Playwright)                              | `e2e/flows/*.yaml` (Maestro)                              |

Unit and integration tests sit next to the code they cover. E2E tests live in
their own folder because they test the app from the outside.

Every app exposes the same scripts: `test:unit`, `test:integration` and
`test:e2e`. `pnpm test` at the root runs unit and integration tests
everywhere.

### API specifics

- `src/app.setup.ts` holds all global configuration. Both `main.ts` and the
  E2E tests call `configureApp`, so E2E tests the exact production HTTP
  surface.
- Integration tests build a `TestingModule` with the real module and override
  only edge providers (clock, external clients) with `overrideProvider`.
- E2E tests import `AppModule` with no overrides.

### Web specifics

- Integration tests render real components in jsdom and mock the network with
  MSW handlers from `src/test/msw`. Unhandled requests fail the test.
- Playwright runs against `next build` + `next start` and the built API,
  started by `playwright.config.ts`. It never runs against dev servers.
- Select elements by role and accessible name (`getByRole`), which also
  checks basic accessibility.

### Mobile specifics

- Jest runs with `--experimental-vm-modules` so MSW 3 (ESM-only) loads
  natively.
- Integration tests use a custom environment that restores Node's `fetch`,
  because Expo's native `fetch` is a no-op stub under Jest.
- Maestro flows select by `testID` or visible text. They need a simulator or
  emulator with the app installed and the API running, so they run locally and
  are not in CI yet.

## Rules for writing tests

- **One behavior per test**, named as a sentence describing it
  (`'shows an unavailable state when the API fails'`).
- **Arrange, act, assert**, visibly separated. Prefer explicit assertions over
  snapshots.
- **Determinism:** inject time, randomness and IDs. Never `sleep`; wait for a
  condition (`findBy*`, `expect.poll`, Playwright's auto-waiting assertions).
- **Isolation:** tests do not depend on order or on state left by another
  test. Reset mocks and handlers after each test.
- **Test the failure paths** a user can hit, not only the happy path.
- **Make sure a test can fail.** When adding a test, check that it fails for
  the right reason when the behavior is broken.
- **Prefer table-driven tests** (`it.each`) for input/output cases at the unit
  layer.

## Choosing the layer

Ask, in order:

1. Can this be checked by calling one function or class with fakes? Then it is
   a **unit** test.
2. Does it depend on how several parts of one app are wired together? Then it
   is an **integration** test.
3. Is it a path a real user or client takes across the running system, and
   would it be a serious regression if it broke? Then add an **E2E** test.

A complex feature typically has many unit tests, a handful of integration
tests and one or two E2E scenarios per app.

## Coverage

Coverage is a signal, not a goal. Run `pnpm --filter <app> test:cov` (API) to
see it. Untested branches in feature logic should be explained or covered;
chasing 100% on glue code is not required.
