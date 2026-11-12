# Dependency decisions

Why each critical dependency of the lab was chosen, which alternatives were
considered, and what each choice costs.

[`testing-strategy.md`](testing-strategy.md) says _how_ tests are written and
[`architecture.md`](architecture.md) records decisions in short form. This
document is the long form for one question: **why this tool and not another
one?** Projects that copy patterns from this repository should be able to
decide here whether the same choice fits them.

- **Scope.** A dependency is "critical" when replacing it would force test
  files or test configuration to be rewritten. The frameworks under test
  (Next.js, Expo, NestJS) are the subject of the lab, not a choice defended
  here.
- **Snapshot.** Versions are the ones resolved in `pnpm-lock.yaml` on
  2026-11-12. Statements about other tools describe them at that date; check
  their current state before relying on a comparison.

## Summary

| Concern                 | Choice                                   | Version | Used in         | Main alternatives                                   |
| ----------------------- | ---------------------------------------- | ------- | --------------- | --------------------------------------------------- |
| Test runner (Node, web) | Vitest                                   | 5.1     | `api`, `web`    | Jest, `node:test`, Mocha, Bun test                  |
| Test runner (mobile)    | Jest + `jest-expo`                       | 30.5    | `mobile`        | Vitest with community React Native plugins          |
| Component testing       | Testing Library (React and React Native) | 16 / 14 | `web`, `mobile` | Enzyme, `react-test-renderer`, browser-mode runners |
| DOM for component tests | jsdom                                    | 31      | `web`           | happy-dom, a real browser                           |
| Network mocking         | MSW                                      | 3.0     | `web`, `mobile` | Module mocks, `fetch` stubs, nock, Mirage           |
| HTTP testing of the API | `@nestjs/testing` + Supertest            | 12 / 7  | `api`           | Fastify `inject`, a real server + `fetch`, Pactum   |
| Browser E2E             | Playwright                               | 1.65    | `web`           | Cypress, Selenium, WebdriverIO, Puppeteer           |
| Mobile E2E              | Maestro                                  | CLI     | `mobile`        | Detox, Appium, XCUITest and Espresso                |
| Coverage                | `@vitest/coverage-v8`                    | 5.1     | `api`           | `@vitest/coverage-istanbul`                         |

## Selection criteria

Every choice below was judged against the same six questions, in this order:

1. **Is it the path the framework supports?** A tool the framework documents
   and tests against breaks less on upgrades than one that needs workarounds.
2. **Does it test behavior through a public interface?** HTTP contracts,
   rendered UI and exported functions, as required by
   [`AGENTS.md`](../AGENTS.md).
3. **Does the same pattern work in every app?** One mental model across API,
   web and mobile matters more than using a single tool everywhere.
4. **Is it deterministic and offline?** No account, paid service or real
   network is needed below the E2E layer.
5. **Can a person or an agent read the test and understand the behavior?**
   The tests are the documentation.
6. **Is it open source, permissively licensed and actively maintained?** All
   choices are MIT or Apache-2.0.

## Test runner for the API and the web app: Vitest

**Why it is well known.** Vitest comes from the Vite team. It keeps the API
that Jest made standard (`describe`, `it`, `expect`, mock functions as
`vi.fn()`), but runs test files through Vite's transform pipeline, so
TypeScript, JSX and ES modules work without a separate Babel or `ts-jest`
setup. Its watch mode re-runs only the tests affected by a change. That
combination made it the usual runner for projects built on Vite and a common
replacement for Jest in ESM codebases.

**Why we chose it.**

- **The API is ESM.** NestJS 12 packages are ESM-only and `apps/api` is
  `"type": "module"`. Vitest loads ESM natively. Jest still needs Node's
  `--experimental-vm-modules` flag for that, which is exactly the friction the
  mobile app has to live with (see the next section).
- **Next.js documents it.** The testing guides bundled with Next.js cover
  Vitest, Jest, Playwright and Cypress.
- **Projects map to layers.** One `vitest.config.ts` per app defines `unit`,
  `integration` and `e2e` projects selected by file name, each with its own
  environment (`node` or `jsdom`) and setup files. That is how the rule "the
  file name decides the layer" is enforced rather than just written down.
- **Same API in both apps**, so a pattern learned in `api` transfers to `web`.

**Alternatives and trade-offs.**

| Alternative          | What it does well                                                         | Why not here                                                                                            |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Jest                 | Most widely used runner, largest ecosystem, the one most tutorials assume | ESM behind an experimental flag; needs a transform for TypeScript. Using it would unify the three apps. |
| `node:test`          | Built into Node, no dependency, fast start                                | No projects, no DOM environment integration, thinner mocking and watch tooling                          |
| Mocha + Chai + Sinon | Flexible, long track record                                               | Three libraries to assemble and configure for what one tool already provides                            |
| Bun test             | Very fast, Jest-compatible API                                            | Requires the Bun runtime; the lab is pinned to Node.js 24, the runtime the apps ship on                 |

**Costs we accept.**

- The monorepo has two runners (Vitest and Jest), so mocks are `vi.fn()` in
  two apps and `jest.fn()` in one.
- Vitest does not support `async` Server Components, according to the Next.js
  guide. Those are covered by Playwright instead of component tests.

## Test runner for the mobile app: Jest with `jest-expo`

**Why it is well known.** Jest was created at Facebook (now Meta) and has been
the default runner for React and React Native for years: it bundles the
runner, assertions, mocks and coverage in one package. `jest-expo` is the
preset maintained by Expo. It configures the React Native transforms and
mocks the native side of the Expo SDK so tests run on Node without a device.

**Why we chose it.** It is the only runner Expo documents and supports.
React Native code needs Babel transforms and native-module mocks that the
preset provides for Jest; no equivalent is maintained for Vitest. Criterion 1
decides this one.

**Alternatives and trade-offs.**

| Alternative                                | What it does well                    | Why not here                                                                       |
| ------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------------- |
| Vitest with community React Native plugins | One runner for the whole monorepo    | Unofficial; the lab would maintain the transforms and Expo mocks on every SDK bump |
| React Native's own Jest preset             | Fewer layers between the test and RN | Loses the Expo module mocks and platform presets that `jest-expo` adds             |

**Costs we accept.** All three are visible in the repository and documented
where they live:

- The `test:*` scripts pass `--experimental-vm-modules` so ESM-only
  dependencies (MSW 3) load natively.
- `transformIgnorePatterns` in `jest.config.js` has to account for pnpm's
  `node_modules/.pnpm` layout.
- Integration tests need a custom environment
  (`src/test/integration-environment.js`) that restores Node's `fetch`,
  because Expo's native `fetch` is a no-op stub under Jest.

## Component testing: Testing Library

**Why it is well known.** Testing Library is built on one idea: a test should
use the component the way a user does. It finds elements by role, label or
visible text and gives no access to component instances, state or props. It
replaced Enzyme as the standard for React, and React 19 deprecated
`react-test-renderer` in its favor. React Native Testing Library (maintained
by Callstack) offers the same API on top of the React Native renderer.

**What we use.**

| Package                         | App      | Role                                                                    |
| ------------------------------- | -------- | ----------------------------------------------------------------------- |
| `@testing-library/react`        | `web`    | Renders components into jsdom and exposes the queries                   |
| `@testing-library/dom`          | `web`    | Query engine; peer dependency of the package above                      |
| `@testing-library/jest-dom`     | `web`    | DOM matchers such as `toBeInTheDocument` and `toHaveTextContent`        |
| `@testing-library/user-event`   | `web`    | Realistic user interaction. Installed for the first feature; unused yet |
| `@testing-library/react-native` | `mobile` | Same queries on React Native, plus matchers such as `toBeOnTheScreen`   |

**Why we chose it.**

- It applies "test behavior through public interfaces" to UI: the rendered,
  accessible output _is_ the public interface of a component.
- `getByRole` checks basic accessibility for free. A control without a role or
  accessible name cannot be selected.
- The same queries exist in web, mobile and (as locators) in Playwright, so
  one selection style runs through every layer.
- Tests survive refactors: renaming a hook or splitting a component does not
  break them.

**Alternatives and trade-offs.**

| Alternative                                       | What it does well                                       | Why not here                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Enzyme                                            | Direct access to instances and state, shallow rendering | Encourages testing implementation details; no adapter for current React                          |
| `react-test-renderer`                             | No DOM needed                                           | Deprecated in React 19; asserts on a JSON tree rather than on what the user sees                 |
| Vitest browser mode, Playwright component testing | Real browser: real layout, events and browser APIs      | Slower and heavier per test; Playwright's variant is still labelled experimental. See _Revisit_. |
| Storybook interaction tests                       | Tests live next to visual documentation                 | Adds a whole tool the lab has no other use for                                                   |

### DOM implementation: jsdom

jsdom is the long-standing pure-JavaScript implementation of web standards and
the environment most Testing Library examples assume. happy-dom is faster but
implements less of the platform, and a real browser is more faithful but
slower. jsdom is the middle that fits an integration layer meant to stay
sub-second, because real-browser behavior is already covered by Playwright.
The cost is the usual one: jsdom has no layout, so anything that depends on
element size or visibility in the viewport belongs in E2E.

## Network mocking: MSW

**Why it is well known.** Mock Service Worker intercepts requests at the
network level instead of replacing `fetch` or the API client. Handlers
describe the remote API in terms of requests and responses, and the same
handlers can serve tests, local development and tools such as Storybook. It
works in the browser (through a Service Worker), in Node and in React Native.

**Why we chose it.**

- The integration layer replaces only what lies outside the app. With MSW the
  real client code runs: URL building, headers, status handling and JSON
  parsing are all under test.
- One handler style works in both frontends (`src/test/msw` in each app).
- Unhandled requests are configured to fail the test, which guarantees no
  integration test reaches a real network.
- A test overrides one response with `server.use(...)` and the override is
  reset after each test, so failure paths are cheap to write.

**Alternatives and trade-offs.**

| Alternative                        | What it does well                                | Why not here                                                                            |
| ---------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Mocking the API module (`vi.mock`) | Simplest; no extra dependency                    | Skips the real client code and couples tests to the module structure                    |
| Stubbing global `fetch`            | No extra dependency                              | Tests assert on call shapes and build `Response` objects by hand                        |
| nock                               | Mature, expressive matching                      | Node-only, so handlers cannot be shared with a browser or a dev server                  |
| Mirage JS                          | In-memory server with a data layer and factories | Heavier model than the lab needs; replaces `fetch` rather than intercepting the network |
| A real stub server on a port       | Real HTTP end to end                             | Process and port management in every test run; slower                                   |
| Playwright request routing         | Built into the E2E tool                          | Only exists in the browser E2E layer, where the lab mocks nothing                       |

**Costs we accept.** MSW 3 is ESM-only, which is what forces the experimental
flag and the custom `fetch` environment on the mobile app. On the web app it
needed no workaround.

## HTTP testing of the API: `@nestjs/testing` and Supertest

**Why they are well known.** `@nestjs/testing` is the first-party package
that builds a real Nest dependency-injection container for tests and lets a
test override individual providers. Supertest has been the standard way to
assert on a Node HTTP server for over a decade: it binds the server to an
ephemeral port and offers a fluent API for requests and expectations.

**Why we chose them.**

- Integration tests build the real module (routing, DI, serialization) and
  use `overrideProvider` only for edge providers such as the clock. That is
  the mocking boundary of the layer, expressed in the framework's own API.
- Supertest exercises the real HTTP stack in-process, with no port to manage
  and no server to start or stop outside the test.
- E2E tests import `AppModule` with no overrides and call `configureApp`, the
  same function `main.ts` calls, so the HTTP surface under test is the
  production one.

**Alternatives and trade-offs.**

| Alternative                         | What it does well                                   | Why not here                                                                        |
| ----------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Fastify `inject`                    | No socket at all; very fast                         | Requires the Fastify adapter; the API uses the Express platform                     |
| A started server + `fetch`          | Closest to what a real client does                  | Port management and hand-written assertions on status, headers and body             |
| Pactum                              | Rich API-testing DSL, contract-testing features     | Less widely known; a larger surface than the lab needs today                        |
| Auto-mocking helpers for unit tests | Less boilerplate when a class has many dependencies | The strategy prefers plain fakes passed through constructors, which need no library |

**Costs we accept.** The API E2E suite boots the full application in-process
through the Nest testing module; it does not start the compiled
`node dist/main` artifact. That artifact is exercised by the web E2E suite,
where Playwright starts it as a separate process.

## Browser E2E: Playwright

**Why it is well known.** Playwright is maintained by Microsoft. It drives
Chromium, Firefox and WebKit through one API, waits automatically for
elements to be actionable, and retries assertions until they pass or time
out, which removes the most common source of flaky browser tests. Each test
gets an isolated browser context, tests run in parallel by default, and a
failing run can produce a trace with DOM snapshots, network and console for
every step. All of that is in the open-source package.

**Why we chose it.**

- **It can start the system under test.** `webServer` in
  `playwright.config.ts` starts the compiled API and `next start`, waits for
  both, and shuts them down. That is what makes "E2E runs against production
  builds" a property of the configuration.
- **No sleeps.** Auto-waiting assertions satisfy the determinism rule without
  any explicit wait.
- **Role-based locators** (`getByRole`) match the selection style of the
  integration tests.
- **CI needs nothing else.** The GitHub reporter annotates failures and the
  HTML report and traces are uploaded as an artifact.

**Alternatives and trade-offs.**

| Alternative          | What it does well                                      | Why not here                                                                                                                                |
| -------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Cypress              | Excellent interactive runner and time-travel debugging | Runs inside the browser, which complicates multi-tab and multi-origin flows; parallel runs across machines typically rely on its paid cloud |
| Selenium (WebDriver) | W3C standard, widest browser and language support      | No built-in runner or auto-waiting; more plumbing to reach the same reliability                                                             |
| WebdriverIO          | WebDriver-based, can also drive mobile through Appium  | More configuration; its mobile reach does not replace a mobile-first tool                                                                   |
| Puppeteer            | Solid browser automation library                       | A library, not a test framework, and Chrome-first                                                                                           |

**Costs we accept.**

- Browser binaries are downloaded separately
  (`playwright install chromium`), locally and in CI.
- Only the `chromium` project is configured. Adding Firefox and WebKit is a
  configuration change, postponed until a feature has browser-sensitive
  behavior.

## Mobile E2E: Maestro

**Why it is well known.** Maestro, from mobile.dev, describes a test as a
YAML flow: launch the app, tap, type, assert. It drives the installed app
from the outside through the platform's accessibility layer, works on iOS and
Android with the same file, and tolerates the timing variance of mobile UIs
without explicit waits. Nothing is compiled into the app under test. It
became popular with React Native and Flutter teams as the low-setup
alternative to Detox and Appium.

**Why we chose it.**

- **Readable by people and agents.** A flow such as
  [`e2e/flows/home.yaml`](../apps/mobile/e2e/flows/home.yaml) reads as the
  user path it checks.
- **It fits Continuous Native Generation.** The app has no `ios/` or
  `android/` directories to configure; Maestro only needs an installed build.
- **One flow, two platforms.**
- **Black box by design**, which is the definition of the E2E layer: only the
  interface a user sees.

**Alternatives and trade-offs.**

| Alternative           | What it does well                                                                  | Why not here                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Detox                 | Gray box: synchronizes with the app's activity, so waits are precise; tests are JS | Needs native build configuration and a dedicated test build; heavier with generated projects |
| Appium                | WebDriver standard, any language, any kind of app                                  | The most setup and maintenance of the three; slower                                          |
| XCUITest and Espresso | First-party, fastest and most stable per platform                                  | Two suites in Swift and Kotlin, living in native projects the app does not keep in the repo  |

**Costs we accept.**

- Maestro is a CLI installed outside pnpm, so its version is **not pinned by
  the lockfile**, and it needs a simulator or emulator. The flows run locally
  only and are not in CI yet (tracked in `architecture.md`).
- YAML is deliberately limited. Complex logic or data setup needs scripts
  beside the flow.
- As a black-box tool it cannot observe the JS thread, so long operations
  need an explicit timeout (`extendedWaitUntil` in the current flow).
- The CLI is open source; the vendor's hosted device cloud is a separate paid
  product and is not used.

## Coverage: `@vitest/coverage-v8`

The V8 provider reads the coverage data the JavaScript engine already
collects, so it needs no instrumentation step and adds little overhead. The
Istanbul provider instruments the source instead, which works on any runtime
and was historically more precise on branches. The V8 provider is the Vitest
default and is sufficient for how the lab uses coverage: as a signal, not a
gate (see [`testing-strategy.md`](testing-strategy.md#coverage)).

Only the API exposes a `test:cov` script today. The provider is also
installed in the web app, without a script yet, and the mobile app would use
Jest's built-in coverage.

## Supporting toolchain

These are not test libraries, but the test workflow depends on them. They are
recorded briefly; details are in [`architecture.md`](architecture.md).

| Tool                 | Role                                                   | Why this one                                                                                 | Main alternatives                                             |
| -------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| pnpm                 | Package manager and workspaces                         | Strict, isolated `node_modules`; explicit allow-list for install scripts; release-age policy | npm or Yarn workspaces, Bun                                   |
| Turborepo            | Task graph and caching (`test` depends on both layers) | Small configuration surface; caches test results by inputs                                   | Nx (more features, more to learn), plain `pnpm -r` (no cache) |
| TypeScript           | Type checking in every app, tests included             | Tests are type-checked against the code they cover                                           | —                                                             |
| Prettier             | Formatting from the root                               | One formatter for code, Markdown, YAML and JSON                                              | Biome                                                         |
| oxlint (API), ESLint | Linting                                                | Each app keeps the linter its framework ships with                                           | One ESLint or Biome setup for all apps                        |

## Planned, not installed yet

[`features.md`](features.md) lists persistence with a real database as a
testing problem to cover. When the API gets a database, the strategy already
commits to a real database in a container for integration tests, with
Testcontainers as the expected tool. The alternatives it will be weighed
against are in-memory substitutes (fast, but a different engine than
production), mocked repositories (which move the tests back to the unit
layer) and a shared database started outside the tests (simple, but tests
stop being isolated). This section becomes a full entry when the dependency
is added.

## When to revisit

A choice here should be reopened when its main reason stops being true:

- **Expo supports another runner.** If Expo documents Vitest, moving the
  mobile app to it would remove the second runner and the ESM workarounds.
- **Maestro runs in CI.** Until then the mobile E2E layer is the only one not
  enforced on pull requests.
- **A component needs real browser behavior** (layout, scrolling, observers).
  That is the point to evaluate a browser-mode runner for selected
  integration tests instead of stretching jsdom.
- **A feature is browser-sensitive.** Add Firefox and WebKit projects to
  Playwright.
- **The API gets a database.** Add Testcontainers and complete the section
  above.

Update this document in the same change that adds, replaces or removes one of
these dependencies.
