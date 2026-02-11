<!--
Sync Impact Report

- Version change: 0.1.1 → 0.1.2
- Modified principles: N/A (new constitution authored)
- Added sections: Branch naming digits clarified (Governance)
- Removed sections: N/A
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gates)
  - ✅ .specify/templates/tasks-template.md (tests made mandatory for this backend)
  - ✅ .specify/templates/spec-template.md (reviewed; no change needed)
  - ✅ .specify/templates/spec-template.md (branch naming convention)
  - ⚠ .specify/templates/commands/*.md (folder not present in this repo)
- Follow-up TODOs:
  - (resolved) RATIFICATION_DATE set to 2026-02-07
-->

# BeeHome Planner Backend Constitution

**Constitution Version**: 0.1.2  
**Ratification Date**: 2026-02-07  
**Last Amended**: 2026-02-07

## Scope

This constitution defines non-negotiable rules for the BeeHome Planner backend:

- Node.js (LTS), Express, PostgreSQL
- TypeScript (mandatory, `strict: true`)
- Prisma for DB access and migrations
- Zod for validation and as API contract source-of-truth
- OpenAPI/Swagger UI generated from Zod schemas

## Principles (Non-Negotiable)

1. **Keep it simple**: prefer explicit, readable code over clever abstractions.
2. **Separate responsibilities**: keep HTTP, application logic, and data access clearly separated.
3. **Type safety is mandatory**: strict typing + schema validation is the default.
4. **Tests are mandatory**: no endpoint is “done” without automated tests.
5. **Avoid dependency bloat**: add dependencies only when they clearly reduce risk or time.

## TypeScript-First (Mandatory)

- `src/` MUST contain TypeScript only (no `.js`).
- TypeScript MUST run with `strict: true`.
- `any` MUST NOT be used except in rare, explicitly justified cases.
- Prefer `unknown` for untrusted data and validate it through Zod schemas.
- Public interfaces (controllers/services/repos) MUST have explicit parameter and return types.

## Architecture (Lean Layers)

The backend MUST follow this flow:

Route → Controller → Service → Repository

- **Routes** MUST define endpoints and attach middleware (auth, validation) and delegate.
- **Controllers** MUST be the HTTP boundary (parse/validate inputs, call service, send response).
  Controllers MUST NOT call the database directly and MUST NOT contain complex business rules.
- **Services** MUST implement use-case/application logic and MUST NOT depend on Express types.
- **Repositories** MUST perform data access only (Prisma, transactions, mapping) and MUST NOT
  depend on HTTP concerns.

## Project Structure (Feature Modules)

Code SHOULD be organized by feature modules:

```text
src/
  app.ts
  server.ts
  config/
  core/
  modules/
    subjects/
      subjects.routes.ts
      subjects.controller.ts
      subjects.service.ts
      subjects.repo.ts
      subjects.schemas.ts
```

- Cross-module imports MUST be avoided unless going through `core/`.
- Shared code MUST live in `core/` only when genuinely shared.

## Dependency Injection (Manual)

- No DI framework is required.
- Modules MUST be wired manually: repo → service → controller → routes.

## Validation & API Contracts

- All external input (`req.body`, `req.params`, `req.query`) MUST be validated (Zod).
- Zod schemas MUST be the single source of truth for request/response shapes.

## API Documentation (OpenAPI)

- OpenAPI MUST be generated from Zod schemas (e.g., `zod-to-openapi`).
- Swagger UI SHOULD be served (e.g., `/docs`). In production it SHOULD be protected or disabled.
- OpenAPI generation MUST run in CI to prevent documentation drift.
- Open-source generators and Swagger UI are typically free to use, but the project MUST respect
  their licenses.

## Error Handling & HTTP Semantics

- The backend MUST use a single error model (`AppError`) for expected failures.
- A centralized error middleware MUST format errors consistently.
- Controllers SHOULD avoid per-handler try/catch boilerplate (use an async handler wrapper).

### HTTP status rules

- **2xx** for success (`200`, `201`, `204` as appropriate).
- **4xx** for client errors (`400` validation, `401` unauthenticated, `403` forbidden, `404` missing,
  `409` conflict, `429` rate limited). `422` MAY be used for semantic validation if consistently.
- **5xx** for unexpected failures (`500`) or temporary unavailability (`503`).
- The API MUST NOT return `200` to represent an error.

### Error response contract

All error responses MUST use a consistent envelope:

```json
{ "error": { "code": "LESSON_NOT_FOUND", "message": "Lesson not found" } }
```

- Error `code` values MUST be stable to support client handling.
- Production responses MUST NOT include stack traces or sensitive internal details.

## API Accessibility (Inclusive Client Consumption)

The backend serves a webapp and other clients. Accessibility for the UI (WCAG, screen readers,
contrast) belongs in the frontend project, but the API MUST be designed for inclusive consumption:

- Responses MUST be consistent and predictable.
- Documentation MUST be complete (examples, required fields, error codes).
- Large lists MUST be paginated; defaults MUST be safe.
- Breaking changes MUST be handled with a clear migration plan (versioning + deprecation).
- Error messages MUST be actionable (what failed and what to fix) without leaking sensitive data.

## Performance & Cost (Do Not Waste Server Money)

- Endpoints that return lists MUST paginate (no unbounded queries).
- Repositories MUST avoid N+1 queries; prefer correct joins/relations and batched access.
- Frequently queried fields SHOULD have indexes; slow queries SHOULD be profiled and fixed.
- Request payload size limits SHOULD be enforced to prevent abuse and cost spikes.
- Compression SHOULD be enabled for JSON responses when appropriate.
- Expensive operations (reports/exports) SHOULD be asynchronous (job/queue) instead of blocking.
- Caching MAY be used when it reduces DB load and cost (with clear TTLs and invalidation strategy).

## Security Baseline

- Validate all inputs (Zod). Never trust the client.
- Use Prisma/parameterized queries; never concatenate SQL with user input.
- Enforce authentication and authorization server-side (least privilege).
- In production, assume TLS termination at infrastructure; the app MUST be proxy-ready
  (e.g., `app.set('trust proxy', 1)` when behind a proxy).
- Use security headers (Helmet) and set cookies securely if used (`httpOnly`, `secure` in prod,
  correct `sameSite`).
- Secrets MUST come from environment variables and MUST be validated at startup.
- Do not log passwords/tokens/PII; redact sensitive fields.
- Rate limiting SHOULD be applied to login and expensive endpoints.
- Security-relevant behavior MUST be covered by API tests (401/403/validation/rate limits).

## Testing & Definition of Done (Mandatory)

- Services MUST have unit tests for business logic.
- Every endpoint MUST have API integration tests (e.g., `supertest`) covering success and negative
  cases (validation/auth/not found).
- OpenAPI generation MUST be updated/validated in the same PR as API changes.

A backend feature is done only when:

- Route + controller + service + repo exist (as applicable)
- Input validation exists
- Errors map to `AppError` with stable codes
- Unit tests exist for service logic
- API integration tests exist for endpoints
- OpenAPI docs are updated/generated
- Lint + typecheck pass and no debug prints remain

## Non-Goals

- No ultra-clean architecture with many layers per feature.
- No generic base controllers/services/repos unless clearly justified.
- No code generation except OpenAPI generation from schemas.

## Governance

### Branch naming (mandatory)

- All backend work MUST use one of these branch prefixes:
  - `feature/BH-<number>` for new features
  - `bug-fix/BH-<number>` for bug fixes
- `<number>` MUST be the task number (no zero-padding required; e.g., `BH-1`, `BH-23`).
- PRs MUST target the correct branch type (feature vs bug-fix).

### Amendment procedure

- Amendments MUST be made via PR that updates this file.
- Each amendment MUST include:
  - updated `Last Amended` date
  - a SemVer version bump rationale
  - any required updates to `.specify/templates/*` gates/checks

### Versioning policy (SemVer)

- **MAJOR**: backward-incompatible governance change (principle removed/redefined).
- **MINOR**: new principle/section added or materially expanded guidance.
- **PATCH**: clarifications/wording/typos with no semantic change.

### Compliance expectations

- Reviewers MUST check changes against this constitution.
- CI SHOULD enforce: lint, typecheck, unit tests, API tests, and OpenAPI generation.

