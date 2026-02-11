# Implementation Plan: BeeHome Planner MVP Backend (Core Flows)

**Branch**: `feature/BH-1` | **Date**: 2026-02-09 | **Spec**: [specs/001-mvp-backend-flows/spec.md](spec.md)
**Input**: Feature specification from `/specs/001-mvp-backend-flows/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Deliver the BeeHome Planner MVP backend API for core flows (auth, family setup, planning, scheduling, execution logging, projects, dashboard/insights) with a paid model: 30-day free trial per family, paywall enforced after trial (dashboard-only + license/billing), and staff-only admin license override.

Implementation follows a lean modular Express + TypeScript architecture (Route → Controller → Service → Repository) with PostgreSQL + Prisma, Zod validation as the source of truth for OpenAPI, and mandatory unit + API integration tests.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript (strict) on Node.js (LTS)  
**Primary Dependencies**: Express, Prisma, Zod, Swagger UI + OpenAPI (generated from Zod; e.g. `zod-to-openapi`)  
**Storage**: PostgreSQL (primary DB) + external object storage for media (provider-agnostic)  
**Testing**: Unit tests for services + API integration tests for all endpoints (Supertest). Test runner: Vitest (chosen in research)  
**Target Platform**: Linux server (API) consumed by web and mobile clients  
**Project Type**: Single backend project (API only)  
**Performance Goals**: Meet spec success criteria (reports <10s typical range; onboarding/planning/execution latency suitable for interactive UX)  
**Constraints**: Strong authz boundaries per family; paywall enforcement after trial; no sensitive logs; predictable errors; paginated lists  
**Docs Posture**: Swagger UI at `/docs` SHOULD be disabled by default in production (or protected) to align with constitution guidance.
**Scale/Scope**: MVP scope for a small-to-medium early user base; prioritize correctness, testability, and simple operations over premature optimization

**Report Documents (PDF)**: Reports MUST support server-side PDF generation for web and mobile clients. PDF rendering will be implemented as HTML templates rendered via headless Chromium to support future report templates with richer layout control. The implementation MUST enforce the same authz/paywall rules as on-screen reports.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

For BeeHome Planner backend work, this gate MUST be explicitly checked:

- TypeScript-only in `src/`, `strict: true`, and no `any` without justification
- Architecture boundaries respected (Route → Controller → Service → Repository)
- All external inputs validated with Zod (`body`, `params`, `query`)
- `AppError` + centralized error middleware used; correct HTTP status codes (no `200` for errors)
- OpenAPI generated from Zod schemas and CI prevents drift
- Tests included: unit tests for services and API integration tests for endpoints
- Security basics covered: authz enforced server-side, secrets/env validation, no sensitive logs

Gate status (plan-time): PASS (design aligns).

## Project Structure

### Documentation (this feature)

```text
specs/001-mvp-backend-flows/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app.ts
├── server.ts
├── config/
│   └── env.ts
├── core/
│   ├── errors/
│   │   ├── AppError.ts
│   │   └── errorMiddleware.ts
│   ├── http/
│   │   └── asyncHandler.ts
│   └── validation/
│       └── validate.ts
└── modules/
  ├── auth/
  ├── families/
  ├── children/
  ├── subjects/
  ├── lessons/
  ├── schedules/
  ├── executions/
  ├── projects/
  ├── dashboard/
  ├── license/
  └── admin/

prisma/
└── schema.prisma

tests/
├── integration/
└── unit/
```

**Structure Decision**: Single backend project at repository root. The current repo contains specs only; implementation will create `src/`, `prisma/`, and `tests/` as above.

## Phases

### Phase 0 — Research (output: `research.md`)

- Confirm library/tooling choices for OpenAPI generation, tests, auth/session model, recurrence modeling, and admin licensing.

### Phase 1 — Design & Contracts (outputs: `data-model.md`, `contracts/*`, `quickstart.md`)

- Define Prisma entities/relationships to cover the spec and paywall rules.
- Define API contracts (OpenAPI) from Zod schemas, including admin-only endpoints.

### Phase 2 — Implementation Planning (output: `tasks.md` via `/speckit.tasks`)

- Slice work by module (auth, families, scheduling, executions, dashboard, license/admin) and enforce tests + OpenAPI checks per slice.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
