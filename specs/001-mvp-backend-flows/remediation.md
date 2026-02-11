# Remediation: Fix Spec/Plan/Tasks Gaps (BH-1)

Date: 2026-02-10  
Scope: specs/001-mvp-backend-flows/{spec.md,plan.md,tasks.md}

Goal: Resolve all issues found by /speckit.analyze:
- Fill coverage gaps (FR-012/012a, FR-031, FR-032, FR-044, FR-020, FR-039a, FR-009)
- Remove key ambiguities (shift-series behavior, daily message feed minimal definition)
- Align Swagger UI posture with constitution SHOULD guidance
- Clarify OpenAPI task split (no duplication)

---

## A) Decisions (locking behavior to remove ambiguity)

### A1) Activities tracking (FR-032)
MVP interpretation: Activity tracking is implemented via:
- Scheduling ACTIVITY items (a schedule type), and
- Logging executions for those occurrences (participants + duration),
with reporting/aggregation derived from executions.

No separate “ad-hoc activity tracker” module in MVP.

### A2) “Shift series forward by one slot” (FR-025e)
Deterministic behavior definition:
- Action applies to a not-completed occurrence O in a recurring series S.
- Mark O as shifted (or create an exception record for O).
- Move the next planned occurrence forward to the next valid slot per the recurrence rule.
- Conflict resolution: if a candidate slot is already occupied by another occurrence of S, keep advancing by the recurrence rule until a free slot is found.
- Guardrail: if no free slot exists within a bounded search window (e.g., 365 days), fail with a stable, documented error code.
- Completed executions are immutable: shifting must not rewrite completed execution history.

### A3) Daily message feed (FR-048)
Minimal MVP definition:
- Endpoint returns one “message of the day” payload (image + formatted text).
- Content may be seeded/static; no admin UI is required for MVP.
- Response must be stable and testable (consistent shape; auth/license rules explicit).

### A4) OpenAPI tasks (T010 vs T024)
Use Option A:
- T010 is scaffolding/entrypoint stub only.
- T024 is the real Zod→OpenAPI generation implementation + wiring + CI drift checks.

---

## B) Apply these edits

### B1) spec.md edits
Target file: specs/001-mvp-backend-flows/spec.md

1) Clarify FR-009 revoke access
- Extend FR-009 to explicitly include revoking pending invites AND removing/deactivating an already-accepted adult membership, immediately blocking access.

2) Clarify cycles derivation (FR-012/FR-012a)
- Add that the API must expose derived cycle periods for a requested date range computed from (anchorDate + cycleDuration), without per-cycle start dates.

3) Clarify shift-series determinism (FR-025e)
- Add deterministic conflict/DST expectation and the “do not rewrite completed executions” constraint explicitly under FR-025e.

4) Clarify FR-032 implementation path
- Add that activity tracking is satisfied via scheduling ACTIVITY items + logging executions and enabling reporting/aggregation on those executions.

5) Clarify report variants (FR-039a)
- Require a report format selector (summary vs visual) and documented output differences.

6) Clarify daily message feed minimal behavior (FR-048)
- Add that MVP may return a single message-of-the-day payload; behavior must be consistent/testable.

---

### B2) plan.md edits
Target file: specs/001-mvp-backend-flows/plan.md

Add a docs posture note:
- Swagger UI at /docs should be disabled by default in production (or protected), aligning with constitution guidance.

---

### B3) tasks.md edits
Target file: specs/001-mvp-backend-flows/tasks.md

1) OpenAPI duplication cleanup (Option A)
- Update task text:
  - T010: “OpenAPI scaffolding (types + folder + script entrypoint stub only)”
  - Keep T024 as the real generator implementation.

2) Add tasks after T163 (continue numbering)

Cycles CRUD + Derived Periods (FR-012/FR-012a)
- T164 [US1] Define cycles schemas in src/modules/families/cycles.schemas.ts
- T165 [US1] Implement cycles repo/service/controller/routes in src/modules/families/cycles.*
- T166 [US1] Implement derived cycle periods endpoint (range query) in src/modules/families/cyclePeriods.*
- T167 [P] [US1] API tests for cycles CRUD + derived periods in tests/integration/cycles.test.ts
- T168 [US1] Prisma update + migration if needed for cycles duration/constraints in prisma/schema.prisma and prisma/migrations/

Membership revoke access (FR-009)
- T169 [US1] Add membership revoke/deactivate endpoint in src/modules/families/memberships.*
- T170 [P] [US1] API tests for revoke after acceptance in tests/integration/memberships.test.ts

Tracking configuration (FR-044)
- T171 Add tracking configuration schemas in src/modules/families/tracking.schemas.ts
- T172 Implement tracking configuration repo/service/routes in src/modules/families/tracking.*
- T173 [P] API tests for tracking configuration in tests/integration/tracking-config.test.ts

Graded flag (FR-020)
- T174 [US2] Add graded flag to lesson/class schemas + persistence + list responses in src/modules/lessons/*
- T175 [P] [US2] API tests for graded flag in tests/integration/lessons-graded.test.ts

Activities tracking coverage (FR-032) via schedules + executions
- T176 [US3] Ensure ACTIVITY schedules persist indoor/outdoor classification and child assignment rules in src/modules/schedules/*
- T177 [P] [US3] Integration test: create ACTIVITY schedule + mark completed execution (duration + participants) in tests/integration/activity-execution.test.ts

Medals/honors (FR-031)
- T178 Define medals schemas in src/modules/medals/medals.schemas.ts
- T179 Implement medals repo/service/controller/routes in src/modules/medals/*
- T180 [P] API tests for awarding + listing medals in tests/integration/medals.test.ts
- T181 Prisma models + migration for Medal and ChildMedal (or Achievement) in prisma/schema.prisma and prisma/migrations/

Report variants (FR-039a)
- T182 [US6] Add report format selector and implement summary vs visual output in src/modules/reports/reports.*
- T183 [P] [US6] API tests for both report formats in tests/integration/reports-formats.test.ts

Swagger UI production guard (constitution SHOULD)
- T184 Add docs enable/disable guard (and optional auth) for /docs in src/modules/docs/docs.routes.ts and mount logic in src/app.ts
- T185 [P] Integration test verifying /docs disabled by default in production mode in tests/integration/docs-guard.test.ts

---

## C) Expected outcome after applying
- Previously uncovered FRs now have explicit tasks: FR-012/012a, FR-031, FR-044, FR-020.
- FR-009 is unambiguous and testable (membership revoke after acceptance).
- FR-032 is implemented without a new module (schedule type + execution + aggregation).
- FR-025e ambiguity reduced with deterministic conflict/DST expectations.
- Swagger UI posture aligns with constitution guidance.
- OpenAPI tasks no longer overlap in intent.

---

## D) Re-run checklist
After you apply the edits:
1) Re-run /speckit.analyze and confirm no HIGH coverage gaps remain.
2) If any remaining gaps appear, treat them as either:
   - add tasks, or
   - explicitly de-scope in spec (MVP boundary).
