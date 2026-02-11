# Phase 0 — Research (Decisions)

This document resolves technical decisions needed to implement the BeeHome Planner MVP backend in a TypeScript-first Express architecture (Route → Controller → Service → Repository) with PostgreSQL + Prisma, Zod validation, and OpenAPI generated from Zod.

## Decision: Test runner and strategy

- **Decision**: Use **Vitest** for unit tests and **Supertest** for API integration tests.
- **Rationale**: Fast feedback loop, good TypeScript support, easy to run unit + integration tests in one toolchain, minimal ceremony.
- **Alternatives considered**:
  - Jest: mature ecosystem, but heavier configuration and slower in many TS projects.
  - Node.js built-in `node:test`: very lean, but TypeScript + ESM ergonomics and tooling can be more work in MVP.

## Decision: Request validation and OpenAPI generation

- **Decision**: Use **Zod** for all request validation (`body`, `params`, `query`) and generate OpenAPI using **`@asteasolutions/zod-to-openapi`**.
- **Rationale**: Keeps schemas as the single source of truth; reduces drift between runtime validation and docs.
- **Alternatives considered**:
  - Manual OpenAPI writing: high drift risk.
  - Different Zod/OpenAPI generators: acceptable, but `@asteasolutions/zod-to-openapi` is widely used and flexible.

## Decision: Recurring schedules and exceptions

- **Decision**: Model schedules as a recurrence rule (days-of-week + time + timezone) with **explicit per-occurrence exceptions** (skip, shift-series-forward, reschedule).
- **Rationale**: Matches product behavior (edit future without rewriting history; handle “skip/shift/reschedule” without mutating completed executions).
- **Alternatives considered**:
  - Materialize every occurrence as rows up-front: simple querying, but heavy write amplification and tricky edits.
  - Store iCal RRULE strings: flexible but adds parsing complexity and less explicit domain rules.

## Decision: Schedule instance identity

- **Decision**: Identify an occurrence by `(scheduleId, startsAt)` and keep executions tied to that identity.
- **Rationale**: Stable reference without requiring a stored instance row for every generated event; works with on-demand generation.
- **Alternatives considered**:
  - Store `ScheduledInstance` rows for each occurrence: easier to reference, but requires background generation and sync.

## Decision: Authentication & authorization baseline

- **Decision**: Use a token-based auth (e.g., JWT access tokens) for clients; enforce authorization via membership/role checks at service layer plus route-level guards.
- **Rationale**: Works across web + mobile; keeps Express controllers thin.
- **Alternatives considered**:
  - Server sessions/cookies only: fine for web but adds friction for mobile.

## Decision: Family license enforcement (trial + paywall)

- **Decision**: Store a **FamilyLicense** state per family (trial start/end; active/expired; manual override) and enforce a strict paywall:
  - If unlicensed: allow only **dashboard (aggregates only)** and **license/billing** endpoints.
  - Block everything else with a consistent “payment required / license required” error.
- **Rationale**: Aligns with clarified product behavior and reduces edge cases.
- **Alternatives considered**:
  - Read-only access after trial: simpler UX but contradicts current business requirement.

## Decision: Admin-only license override mechanism

- **Decision**: Provide **admin-only API endpoints** for license overrides, protected by a staff/admin auth mechanism distinct from family roles (e.g., admin API key/Bearer secret).
- **Rationale**: Auditability + operational safety; avoids direct DB manipulation as a process.
- **Alternatives considered**:
  - Manual DB changes: fast but error-prone and hard to audit.

## Decision: Time handling

- **Decision**: Store timestamps in UTC in Postgres; store schedule timezone explicitly; compute occurrences using timezone-aware logic.
- **Rationale**: Prevent DST bugs and ambiguous times.
- **Alternatives considered**:
  - Store local times only: causes DST ambiguity and inconsistent results.

## Decision: Academic year + cycles derived from planning anchor

- **Decision**: Do not require a stored `startAt` on academic year or cycles. Store a family-level planning **anchor date** (academic-year start) and define cycles by **duration** (and optionally order). Derive academic-year and cycle periods from that configuration.
- **Rationale**: Matches product intent (user chooses when it starts; system derives periods) and avoids drift between per-cycle dates.
- **Alternatives considered**:
  - Persist per-cycle `startsAt/endsAt`: flexible, but introduces redundancy and drift.

## Decision: Duration units (minutes vs hours)

- **Decision**: API accepts durations as `{ value, unit }` where `unit ∈ { MINUTES, HOURS }`. Persist durations canonically in minutes where stored.
- **Rationale**: Supports user preference while keeping storage/reporting simple.

## Pinned versions (2026-02-09)

These are the exact versions we plan to pin in `package.json` for the initial implementation.

- Node.js: `v24.13.0`
- npm: `11.9.0`
- express: `5.2.1` *(note: if Express 5 introduces migration friction, fall back to dist-tag `latest-4` = `4.22.1` and record rationale)*
- prisma / @prisma/client: `7.3.0`
- zod: `4.3.6`
- @asteasolutions/zod-to-openapi: `8.4.0`
- swagger-ui-express: `5.0.1`
- vitest: `4.0.18`
- supertest: `7.2.2`
- typescript: `5.9.3`
- tsx: `4.21.0`
- eslint: `10.0.0`
- prettier: `3.8.1`

### Notes for fast-moving dependencies

- Prisma 7.3.0 introduces performance/compiler options (e.g., `compilerBuild`) and continues changes post-7.0; keep Prisma release notes handy during implementation: https://github.com/prisma/prisma/releases/tag/7.3.0
- Zod 4.x and Vitest 4.x are moving quickly; pin exact versions and avoid canary/beta tags unless explicitly needed.
