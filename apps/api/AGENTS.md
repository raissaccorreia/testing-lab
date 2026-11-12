# AGENTS.md — `apps/api`

Read the root [`AGENTS.md`](../../AGENTS.md) and
[`docs/testing-strategy.md`](../../docs/testing-strategy.md) first. This file
only adds what is specific to the NestJS API.

## NestJS

This app's version of NestJS is likely newer than what you know.
https://docs.nestjs.com/llms.txt indexes its documentation, with a markdown page
per chapter. Check Nest's first-party packages (`@nestjs/config`,
`@nestjs/terminus`, `@nestjs/throttler`, ...) before adding another library or
writing your own.

- Nest's packages are ESM only, and this app is ESM too: relative imports end in
  `.js`, and `__dirname` does not exist (use `import.meta.dirname`).
- Tests run on Vitest, so mocks are `vi.fn()`, not `jest.fn()`.
- Validation works with any Standard Schema library through
  `StandardSchemaValidationPipe`; `class-validator` still works through
  `ValidationPipe`.

## App-specific rules

- All global app configuration (prefixes, pipes, filters, versioning) goes in
  [`src/app.setup.ts`](src/app.setup.ts). Both `main.ts` and the E2E tests call
  `configureApp`, so E2E tests exercise the same configuration as production.
- Test file naming decides the layer:
  - `src/**/*.spec.ts` — unit
  - `src/**/*.int-spec.ts` — integration
  - `test/**/*.e2e-spec.ts` — end-to-end
