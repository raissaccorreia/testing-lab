---
type: project-readiness
schema_version: 1
project_id: testing-lab
project_lifecycle: active
auto_dev_scope: manual
pilot_priority: excluded
scope_note: 'Reference monorepo for unit, integration and E2E testing. Skeleton in place; features not chosen yet.'
report_language: en-US
snapshot_date: 2026-11-12
base_branch: main
remote: configured
remote_name: origin
remote_url: 'https://github.com/raissaccorreia/testing-lab.git'
staging_local: absent
staging_remote_tracking: absent
staging_remote: absent
local_gate: 'pnpm validate'
local_gate_definition: 'pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build'
local_gate_status: passed
e2e_gate: 'pnpm test:e2e'
e2e_gate_scope: 'api (Vitest + Supertest), web (Playwright); mobile Maestro flows run locally only'
github_actions: present
github_actions_gate: '.github/workflows/ci.yml (checks, e2e-web)'
branch_protection: not_verified
staging_environment: not_applicable
automation_eligibility: blocked
manual_development: allowed
promotion_path: 'task-branch -> human PR -> main'
blocker_codes:
  - STAGING_BRANCH_ABSENT
  - BRANCH_PROTECTION_UNVERIFIED
audit_mode: manual_update
---

# Project readiness state

Machine-readable state of the project for automated agent workflows. The
frontmatter is the queryable source; this prose only explains it.

## Policy

This state blocks unattended execution and promotion, not manual development.
Changes go through a task branch and a human-reviewed pull request into
`main`.

## Corrections

1. Decide whether a `staging` branch is needed for this project, and create it
   in an explicit task if so.
2. Enable branch protection on `main` requiring the CI checks before enabling
   unattended execution.

## Evidence boundary

The local gate and the API and web E2E suites were run on 2026-11-12 on the
skeleton. Mobile Maestro flows were not run (no simulator tooling in this
environment). Branch protection was not checked.
