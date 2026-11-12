# Features

The lab will have **few features, each one complex**. The features exist to
create realistic testing problems; they are not a product.

The specific features have **not been chosen yet**. This document defines how
they will be chosen and tracks the decision.

## What makes a good feature here

A candidate feature should:

- **Span the stack:** involve the API and at least one client, ideally both.
- **Have real logic:** rules, states and edge cases that deserve many unit
  tests, not just CRUD.
- **Have failure modes:** validation errors, conflicts, partial failures,
  retries, or offline behavior that tests must cover.
- **Have time or concurrency in it:** schedules, expiry, ordering or races that
  force deterministic test design (injected clocks, controlled async).
- **Be domain-neutral:** use synthetic data and a neutral domain that is safe
  to publish.
- **Fit in a few PRs:** small enough to finish, rich enough to teach.

## Testing problems we want to cover

Each feature should exercise some of these, and together they should cover
most of them:

- Input validation and error contracts on the API
- Authentication and authorization
- Persistence with a real database (Testcontainers in integration tests)
- Pagination, filtering and sorting
- Optimistic updates and rollback on the clients
- Offline behavior and sync on mobile
- Time-dependent rules (expiry, scheduling, time zones)
- Concurrency and idempotency (double submits, conflicting edits)
- Background jobs or real-time updates
- Forms with complex client-side validation
- Accessibility of key flows

## Backlog

| Feature         | Status | Apps | Main testing problems |
| --------------- | ------ | ---- | --------------------- |
| _To be decided_ | —      | —    | —                     |

Add a row when a feature is proposed, and link its design note once written.
