# Tasks: BeeHome Planner MVP Backend (Core Flows)

**Input**: Design documents from `/specs/001-mvp-backend-flows/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: For BeeHome Planner backend work, tests are MANDATORY per constitution.
Include unit tests for services and API integration tests for endpoints.

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create backend folder structure in src/, tests/, prisma/
- [X] T002 Initialize Node/TypeScript project in package.json (scripts: dev/build/test/openapi) at package.json
- [X] T003 Add TypeScript strict config in tsconfig.json
- [X] T004 [P] Add ESLint + Prettier config for TypeScript in eslint.config.js and .prettierrc
- [X] T005 [P] Add Vitest configuration in vitest.config.ts and tests/setup.ts
- [X] T006 [P] Add environment template in .env.example and document required vars in README.md
- [X] T007 Add env validation with Zod in src/config/env.ts
- [X] T008 Add Prisma baseline in prisma/schema.prisma and prisma/migrations/ (empty initial migration)
- [X] T009 [P] Add DB/dev runtime (docker-compose.yml for Postgres) in docker-compose.yml
- [X] T010 Add OpenAPI scaffolding (types + folder + script entrypoint stub only) in src/core/openapi/generateOpenApi.ts
- [X] T011 [P] Pin dependency versions and record them in specs/001-mvp-backend-flows/research.md

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T012 Create Express app bootstrap in src/app.ts and src/server.ts
- [X] T013 Add centralized error model in src/core/errors/AppError.ts
- [X] T014 Add error middleware in src/core/errors/errorMiddleware.ts
- [X] T015 [P] Add async handler helper in src/core/http/asyncHandler.ts
- [X] T016 [P] Add request validation middleware in src/core/validation/validate.ts
- [X] T017 Add Prisma client singleton in src/core/db/prisma.ts
- [X] T018 Define base auth types and middleware contracts in src/core/auth/authTypes.ts
- [X] T019 Add bearer auth middleware (JWT) in src/core/auth/requireAuth.ts
- [X] T020 Decide and implement current-family selection (e.g., X-Family-Id header) in src/core/auth/requireFamily.ts
- [X] T021 Add role/permission guard middleware in src/core/auth/requireRole.ts
- [X] T022 Implement paywall/license enforcement middleware in src/modules/license/license.middleware.ts
- [X] T023 Wire Swagger UI docs endpoint in src/modules/docs/docs.routes.ts and mount at /docs in src/app.ts
- [X] T024 Implement OpenAPI generation from Zod schemas in src/core/openapi/openapi.ts
- [X] T025 [P] Add integration test harness (createTestApp, db helpers) in tests/integration/_helpers/app.ts and tests/integration/_helpers/db.ts
- [X] T026 Add CI workflow to run typecheck + unit + integration + openapi generation in .github/workflows/ci.yml

**Checkpoint**: Foundation ready; user stories can begin.

## Phase 3: User Story 1 — Account, Family, Child Setup (Priority: P1) 🎯 MVP

**Goal**: Auth + create family + invite second adult + child profiles + planning settings (academic-year anchor + cycles definitions).

**Independent Test**: Sign up → create family (trial starts) → create child → invite 2nd adult → accept invite; verify roles and access boundaries.

- [X] T027 [P] [US1] Define auth schemas (signup/login) in src/modules/auth/auth.schemas.ts
- [X] T028 [P] [US1] Implement auth repo (users/identities) in src/modules/auth/auth.repo.ts
- [X] T029 [US1] Implement auth service (signup/login, password hashing) in src/modules/auth/auth.service.ts
- [X] T030 [US1] Implement auth controller in src/modules/auth/auth.controller.ts
- [X] T031 [US1] Implement auth routes in src/modules/auth/auth.routes.ts
- [X] T032 [P] [US1] API tests for /auth/signup and /auth/login in tests/integration/auth.test.ts
- [X] T033 [P] [US1] Unit tests for auth service in tests/unit/auth.service.test.ts

- [ ] T034 [P] [US1] Define family schemas in src/modules/families/families.schemas.ts
- [ ] T035 [P] [US1] Implement family repo in src/modules/families/families.repo.ts
- [ ] T036 [US1] Implement family service (create family + start trial, max 2 adults) in src/modules/families/families.service.ts
- [ ] T037 [US1] Implement family controller/routes in src/modules/families/families.controller.ts and src/modules/families/families.routes.ts
- [ ] T038 [P] [US1] API tests for POST /families in tests/integration/families.test.ts
- [ ] T039 [P] [US1] Unit tests for families service (2-adult rule, trial start) in tests/unit/families.service.test.ts

- [ ] T040 [P] [US1] Define invites schemas in src/modules/families/invites.schemas.ts
- [ ] T041 [P] [US1] Implement invites repo in src/modules/families/invites.repo.ts
- [ ] T042 [US1] Implement invites service (create/revoke/accept) in src/modules/families/invites.service.ts
- [ ] T043 [US1] Implement invites controller/routes in src/modules/families/invites.controller.ts and src/modules/families/invites.routes.ts
- [ ] T044 [P] [US1] API tests for invites flow in tests/integration/invites.test.ts

- [ ] T169 [US1] Add membership revoke/deactivate endpoint in src/modules/families/memberships.*
- [ ] T170 [P] [US1] API tests for revoke after acceptance in tests/integration/memberships.test.ts

- [ ] T045 [P] [US1] Define children schemas in src/modules/children/children.schemas.ts
- [ ] T046 [P] [US1] Implement children repo in src/modules/children/children.repo.ts
- [ ] T047 [US1] Implement children service in src/modules/children/children.service.ts
- [ ] T048 [US1] Implement children controller/routes in src/modules/children/children.controller.ts and src/modules/children/children.routes.ts
- [ ] T049 [P] [US1] API tests for children list/create in tests/integration/children.test.ts

- [ ] T050 [P] [US1] Define planning settings schemas (anchorDate, planningMode, durationDisplayUnit) in src/modules/families/settings.schemas.ts
- [ ] T051 [P] [US1] Implement planning settings repo in src/modules/families/settings.repo.ts
- [ ] T052 [US1] Implement planning settings service in src/modules/families/settings.service.ts
- [ ] T053 [US1] Implement planning settings routes in src/modules/families/settings.routes.ts
- [ ] T054 [P] [US1] API tests for planning settings in tests/integration/settings.test.ts

- [ ] T164 [US1] Define cycles schemas in src/modules/families/cycles.schemas.ts
- [ ] T165 [US1] Implement cycles repo/service/controller/routes in src/modules/families/cycles.*
- [ ] T166 [US1] Implement derived cycle periods endpoint (range query) in src/modules/families/cyclePeriods.*
- [ ] T167 [P] [US1] API tests for cycles CRUD + derived periods in tests/integration/cycles.test.ts
- [ ] T168 [US1] Prisma update + migration if needed for cycles duration/constraints in prisma/schema.prisma and prisma/migrations/

- [X] T055 [US1] Add Prisma models for US1 entities (User, AuthIdentity, Family, Membership, Invite, ChildProfile, AcademicYearSettings, Cycle, FamilyLicense, FamilyLicenseAudit) in prisma/schema.prisma
- [ ] T056 [US1] Create and apply Prisma migration for US1 schema in prisma/migrations/

## Phase 4: User Story 2 — Plan: Subjects, Lessons, and Materials (Priority: P2)

**Goal**: Create subjects and lessons; attach materials at lesson or schedule level; validate optional academic year/cycle links.

**Independent Test**: Create subject → create lesson with materials; verify listing returns expected shapes.

- [ ] T057 [P] [US2] Define subject schemas in src/modules/subjects/subjects.schemas.ts
- [ ] T058 [P] [US2] Implement subjects repo in src/modules/subjects/subjects.repo.ts
- [ ] T059 [US2] Implement subjects service in src/modules/subjects/subjects.service.ts
- [ ] T060 [US2] Implement subjects controller/routes in src/modules/subjects/subjects.controller.ts and src/modules/subjects/subjects.routes.ts
- [ ] T061 [P] [US2] API tests for /subjects in tests/integration/subjects.test.ts
- [ ] T062 [P] [US2] Unit tests for subjects service in tests/unit/subjects.service.test.ts

- [ ] T063 [P] [US2] Define lesson schemas in src/modules/lessons/lessons.schemas.ts
- [ ] T064 [P] [US2] Implement lessons repo in src/modules/lessons/lessons.repo.ts
- [ ] T065 [US2] Implement lessons service in src/modules/lessons/lessons.service.ts
- [ ] T066 [US2] Implement lessons controller/routes in src/modules/lessons/lessons.controller.ts and src/modules/lessons/lessons.routes.ts
- [ ] T067 [P] [US2] API tests for /lessons in tests/integration/lessons.test.ts

- [ ] T068 [P] [US2] Implement materials (lesson-level) repo/service/routes in src/modules/lessons/materials.*.ts
- [ ] T069 [P] [US2] API tests for lesson materials in tests/integration/lesson-materials.test.ts

- [ ] T070 [US2] Add Prisma models for Subject, Lesson, ClassUnit, LessonMaterial in prisma/schema.prisma
- [ ] T071 [US2] Create and apply Prisma migration for US2 schema in prisma/migrations/

## Phase 5: User Story 3 — Plan: Schedule Classes and Activities (Priority: P3)

**Goal**: Create schedules for lessons or activities with recurrence; assign planned children optionally; support skip/shift/reschedule exceptions.

**Independent Test**: Create recurring schedule → generate upcoming instances for a week → apply exception and verify updated generation.

- [ ] T072 [P] [US3] Define schedule schemas (including duration unit input) in src/modules/schedules/schedules.schemas.ts
- [ ] T073 [P] [US3] Implement schedules repo in src/modules/schedules/schedules.repo.ts
- [ ] T074 [US3] Implement recurrence engine (generate occurrences) in src/modules/schedules/recurrence.ts
- [ ] T075 [US3] Implement schedules service in src/modules/schedules/schedules.service.ts
- [ ] T076 [US3] Implement schedules controller/routes in src/modules/schedules/schedules.controller.ts and src/modules/schedules/schedules.routes.ts
- [ ] T077 [P] [US3] API tests for creating schedule in tests/integration/schedules.test.ts

- [ ] T197 [P] [US3] Integration test: planning works with zero children (create subject + lesson + schedule with no assigned children) in tests/integration/no-children-planning.test.ts

- [ ] T192 [US3] Add schedule materials CRUD endpoints (attach/list/update/remove) in src/modules/schedules/materials.* (schemas/service/controller/routes)
- [ ] T193 [P] [US3] Integration tests for schedule materials in tests/integration/schedule-materials.test.ts

- [ ] T078 [P] [US3] Define exception schemas in src/modules/schedules/exceptions.schemas.ts
- [ ] T079 [P] [US3] Implement exceptions repo in src/modules/schedules/exceptions.repo.ts
- [ ] T080 [US3] Implement exception application rules (skip/shift/reschedule) in src/modules/schedules/exceptions.service.ts
- [ ] T081 [US3] Implement exception controller/routes in src/modules/schedules/exceptions.controller.ts and src/modules/schedules/exceptions.routes.ts
- [ ] T082 [P] [US3] API tests for exceptions in tests/integration/schedule-exceptions.test.ts

- [ ] T083 [US3] Add Prisma models for Schedule, ScheduleRule, ScheduleChild, ScheduleException, ScheduleMaterial in prisma/schema.prisma
- [ ] T084 [US3] Create and apply Prisma migration for US3 schema in prisma/migrations/

## Phase 6: User Story 4 — Act: Register a Class/Activity Execution (Priority: P4)

**Goal**: Mark a scheduled occurrence as completed; record actual participants (override planned children), duration, points, notes and media.

**Independent Test**: Create schedule → create execution with different participant list → verify stored execution participants.

- [ ] T085 [P] [US4] Define execution schemas (participants + duration units) in src/modules/executions/executions.schemas.ts
- [ ] T086 [P] [US4] Implement executions repo in src/modules/executions/executions.repo.ts
- [ ] T087 [US4] Implement executions service (participant override, points validation) in src/modules/executions/executions.service.ts
- [ ] T088 [US4] Implement executions controller/routes in src/modules/executions/executions.controller.ts and src/modules/executions/executions.routes.ts
- [ ] T089 [P] [US4] API tests for /executions in tests/integration/executions.test.ts

- [ ] T198 [P] [US4] Integration test: updating planned children MUST NOT rewrite historical executions (FR-025a) in tests/integration/planned-children-invariant.test.ts
- [ ] T090 [P] [US4] Unit tests for executions service in tests/unit/executions.service.test.ts

- [ ] T091 [US4] Add Prisma models for ClassExecution and ExecutionParticipant in prisma/schema.prisma
- [ ] T092 [US4] Create and apply Prisma migration for US4 schema in prisma/migrations/

## Phase 7: User Story 5 — Science Projects (Priority: P5)

**Goal**: Create science projects and log project entries with time spent, notes, and optional media.

**Independent Test**: Create project → add two entries → list project timeline and verify totals.

- [ ] T093 [P] [US5] Define project schemas in src/modules/projects/projects.schemas.ts
- [ ] T094 [P] [US5] Implement projects repo in src/modules/projects/projects.repo.ts
- [ ] T095 [US5] Implement projects service in src/modules/projects/projects.service.ts
- [ ] T096 [US5] Implement projects controller/routes in src/modules/projects/projects.controller.ts and src/modules/projects/projects.routes.ts
- [ ] T097 [P] [US5] API tests for projects in tests/integration/projects.test.ts

- [ ] T194 [US5] Implement project entries (log activity entries + list timeline + totals) in src/modules/projects/entries.* (schemas/service/controller/routes)
- [ ] T195 [P] [US5] API tests for project entries + timeline + total time spent in tests/integration/project-entries.test.ts

- [ ] T098 [US5] Add Prisma models for ScienceProject and ScienceProjectEntry in prisma/schema.prisma
- [ ] T099 [US5] Create and apply Prisma migration for US5 schema in prisma/migrations/

## Phase 8: User Story 6 — Reports, Notifications, and Data Export (Priority: P6)

**Goal**: Generate materials-needed and upcoming-activities reports; create export requests and produce downloadable artifacts.

**Independent Test**: Create schedules with materials → run materials report for next week; create export request and poll status.

- [ ] T100 [P] [US6] Define reports schemas (range filters) in src/modules/reports/reports.schemas.ts
- [ ] T101 [P] [US6] Implement reports repo queries in src/modules/reports/reports.repo.ts
- [ ] T102 [US6] Implement reports service in src/modules/reports/reports.service.ts
- [ ] T103 [US6] Implement reports controller/routes in src/modules/reports/reports.controller.ts and src/modules/reports/reports.routes.ts
- [ ] T104 [P] [US6] API tests for reports in tests/integration/reports.test.ts

- [ ] T105 [P] [US6] Define export schemas in src/modules/exports/exports.schemas.ts
- [ ] T106 [P] [US6] Implement exports repo in src/modules/exports/exports.repo.ts
- [ ] T107 [US6] Implement export job model + worker loop in src/modules/exports/exportWorker.ts
- [ ] T108 [US6] Implement exports controller/routes in src/modules/exports/exports.controller.ts and src/modules/exports/exports.routes.ts
- [ ] T109 [P] [US6] API tests for exports (request + status) in tests/integration/exports.test.ts

- [ ] T110 [US6] Add Prisma models for ExportRequest and ExportArtifact in prisma/schema.prisma
- [ ] T111 [US6] Create and apply Prisma migration for US6 schema in prisma/migrations/

## Phase 9: User Story 7 — Connect: Shareable Artifacts (Priority: P7)

**Goal**: Generate share-ready artifacts from public highlights.

**Independent Test**: Create execution highlight → request share artifact → verify returned share payload.

- [ ] T112 [P] [US7] Define sharing schemas in src/modules/sharing/sharing.schemas.ts
- [ ] T113 [P] [US7] Implement sharing service in src/modules/sharing/sharing.service.ts
- [ ] T114 [US7] Implement sharing controller/routes in src/modules/sharing/sharing.controller.ts and src/modules/sharing/sharing.routes.ts
- [ ] T115 [P] [US7] API tests for sharing in tests/integration/sharing.test.ts

## Phase 10: User Story 8 — Improve: Insights Dashboard (Priority: P8)

**Goal**: Return dashboard aggregates by child and time window; enforce dashboard-only aggregates in unlicensed mode.

**Independent Test**: Record executions → call /dashboard and verify aggregates match; ensure unlicensed response contains no IDs/lists.

- [ ] T116 [P] [US8] Define dashboard schemas in src/modules/dashboard/dashboard.schemas.ts
- [ ] T117 [P] [US8] Implement dashboard repo queries in src/modules/dashboard/dashboard.repo.ts
- [ ] T118 [US8] Implement dashboard service (aggregations, license-aware shaping) in src/modules/dashboard/dashboard.service.ts
- [ ] T119 [US8] Implement dashboard controller/routes in src/modules/dashboard/dashboard.controller.ts and src/modules/dashboard/dashboard.routes.ts
- [ ] T120 [P] [US8] API tests for /dashboard (licensed vs unlicensed) in tests/integration/dashboard.test.ts

## Phase 11: Monetization & Admin Operations (Cross-cutting, MVP-required)

- [ ] T121 Define license status schemas in src/modules/license/license.schemas.ts
- [ ] T122 Implement license status endpoint /license/status in src/modules/license/license.controller.ts and src/modules/license/license.routes.ts
- [ ] T123 Implement billing checkout placeholder endpoint /billing/checkout in src/modules/license/billing.controller.ts and src/modules/license/billing.routes.ts
- [ ] T124 [P] API tests for license/billing endpoints in tests/integration/license.test.ts

- [ ] T199 [P] Integration test: paywall contract returns HTTP 402 + stable error.code LICENSE_REQUIRED for representative endpoints in tests/integration/paywall-contract.test.ts

- [ ] T125 Define admin license override schemas in src/modules/admin/admin.schemas.ts
- [ ] T126 Implement admin auth middleware (X-Admin-Key) in src/modules/admin/adminAuth.middleware.ts
- [ ] T127 Implement admin license repo/service/controller/routes in src/modules/admin/licenseOverride.*.ts
- [ ] T128 [P] API tests for admin override (auth + audit) in tests/integration/admin-license.test.ts

## Phase 12: Polish & Cross-Cutting Concerns

- [ ] T129 [P] Add request logging with redaction in src/core/logging/logger.ts
- [ ] T130 Add security headers (Helmet) and body size limits in src/app.ts
- [ ] T131 Add rate limiting for auth endpoints in src/modules/auth/rateLimit.ts
- [ ] T132 Ensure pagination defaults for list endpoints in src/core/pagination/pagination.ts
- [ ] T133 [P] Add OpenAPI drift check script and wire into CI in package.json and .github/workflows/ci.yml
- [ ] T134 Run quickstart scenario validation and update specs/001-mvp-backend-flows/quickstart.md with real commands

## Phase 13: Coverage Fixes (Spec Alignment)

### Auth: Google/Apple + Account Linking (FR-003/FR-004/FR-005)

- [ ] T135 [US1] Add OAuth/OIDC callback endpoints for Google in src/modules/auth/oauth.google.* (routes/controller/service)
- [ ] T136 [US1] Add OAuth/OIDC callback endpoints for Apple in src/modules/auth/oauth.apple.* (routes/controller/service)
- [ ] T137 [US1] Persist external identities (provider, providerUserId, email) in src/modules/auth/auth.repo.ts + Prisma
- [ ] T138 [US1] Implement account linking rules (single identity across methods, conflict handling) in src/modules/auth/auth.service.ts
- [ ] T139 [P] [US1] Integration tests for Google/Apple login + linking in tests/integration/auth-oauth.test.ts
- [ ] T140 [P] [US1] Unit tests for linking edge cases in tests/unit/auth-linking.service.test.ts

### Goals / Time Goals (FR-019/FR-019a/FR-019b)

- [ ] T141 [US2] Define goals schemas in src/modules/goals/goals.schemas.ts
- [ ] T142 [US2] Implement goals repo/service/controller/routes in src/modules/goals/*
- [ ] T143 [P] [US2] API tests for goals CRUD in tests/integration/goals.test.ts
- [ ] T144 [US2] Prisma models + migration for subject goals and optional child overrides in prisma/schema.prisma and prisma/migrations/

### Media / Files (FR-017/FR-028)

- [ ] T145 [US2] Add media module (provider-agnostic upload intent + secure access) in src/modules/media/*
- [ ] T146 [US2] Add endpoints for attaching media to lessons in src/modules/media/media.routes.ts
- [ ] T147 [US4] Add endpoints for attaching media to executions in src/modules/media/media.routes.ts
- [ ] T148 [P] Integration tests for media intent + family authorization in tests/integration/media.test.ts
- [ ] T149 [US2] Prisma models + migration for MediaAsset and linking tables in prisma/schema.prisma and prisma/migrations/

### Notes & Highlights (FR-030/FR-049 prerequisites)

- [ ] T150 [US4] Add schemas for private notes and public highlights in src/modules/executions/notes.schemas.ts
- [ ] T151 [US4] Implement notes/highlights repo/service/controller/routes in src/modules/executions/notes.* (authz + separation)
- [ ] T152 [P] API tests to ensure private notes never leak; highlights shareable only in tests/integration/execution-notes.test.ts
- [ ] T153 [US4] Prisma models + migration for PrivateNote and PublicHighlight in prisma/schema.prisma and prisma/migrations/

### Reminders Cadence (FR-022)

- [ ] T154 [US2] Add reminders model + “compute reminders for date range” endpoint/job stub in src/modules/reminders/*
- [ ] T155 [P] API tests for reminder computation in tests/integration/reminders.test.ts

### Daily Message Feed (FR-048)

- [ ] T156 [US7] Add daily message feed endpoint + minimal model in src/modules/dailyMessage/*
- [ ] T157 [P] API tests for daily message feed access in tests/integration/daily-message.test.ts

### Notification Preferences + Delivery Stub (FR-039)

- [ ] T158 [US6] Add NotificationPreference CRUD endpoints in src/modules/notifications/*
- [ ] T159 [US6] Add scheduled delivery stub (worker loop placeholder) for report preferences in src/modules/notifications/worker.ts
- [ ] T160 [P] API tests for notification preferences in tests/integration/notification-preferences.test.ts

### Export Secure Retrieval + Spreadsheet-Friendly Output (FR-042/FR-042a)

- [ ] T161 [US6] Add secure export artifact download endpoint (short-lived token or signed URL abstraction) in src/modules/exports/download.*
- [ ] T162 [US6] Add CSV/spreadsheet-friendly learning history export format option in src/modules/exports/formats/*
- [ ] T163 [P] Integration tests for export download authorization + expiry in tests/integration/export-download.test.ts

### Export Bundle Layout (FR-041)

- [ ] T190 [US6] Define export bundle directory layout + manifest for learning history + media (organized by child and date) in src/modules/exports/bundleLayout.ts and src/modules/exports/exportWorker.ts
- [ ] T191 [P] [US6] Integration test validates export artifact structure includes media grouped by child and date (and learning history per child) in tests/integration/export-bundle-structure.test.ts

### Tracking Configuration (FR-044)

- [ ] T171 Add tracking configuration schemas in src/modules/families/tracking.schemas.ts
- [ ] T172 Implement tracking configuration repo/service/routes in src/modules/families/tracking.*
- [ ] T173 [P] API tests for tracking configuration in tests/integration/tracking-config.test.ts

### Graded Flag (FR-020)

- [ ] T174 [US2] Add graded flag to lesson/class schemas + persistence + list responses in src/modules/lessons/*
- [ ] T175 [P] [US2] API tests for graded flag in tests/integration/lessons-graded.test.ts

### Activities Tracking Coverage (FR-032) via Schedules + Executions

- [ ] T176 [US3] Ensure ACTIVITY schedules persist indoor/outdoor classification and child assignment rules in src/modules/schedules/*
- [ ] T177 [P] [US3] Integration test: create ACTIVITY schedule + mark completed execution (duration + participants) in tests/integration/activity-execution.test.ts

### Medals / Honors (FR-031)

- [ ] T178 Define medals schemas in src/modules/medals/medals.schemas.ts
- [ ] T179 Implement medals repo/service/controller/routes in src/modules/medals/*
- [ ] T180 [P] API tests for awarding + listing medals in tests/integration/medals.test.ts
- [ ] T181 Prisma models + migration for Medal and ChildMedal (or Achievement) in prisma/schema.prisma and prisma/migrations/

### Report Variants (FR-039a)

- [ ] T182 [US6] Add report format selector and implement summary vs visual output in src/modules/reports/reports.*
- [ ] T183 [P] [US6] API tests for both report formats in tests/integration/reports-formats.test.ts

### Swagger UI Production Guard (Constitution SHOULD)

- [ ] T184 Add docs enable/disable guard (and optional auth) for /docs in src/modules/docs/docs.routes.ts and mount logic in src/app.ts
- [ ] T185 [P] Integration test verifying /docs disabled by default in production mode in tests/integration/docs-guard.test.ts

### Report PDF Downloads (FR-038)

- [ ] T186 [US6] Add PDF rendering wrapper (HTML → PDF via headless Chromium) in src/modules/reports/pdf/*
- [ ] T187 [US6] Add dedicated learning history PDF endpoint `GET /reports/learning-history/pdf` returning application/pdf (with Content-Disposition filename) in src/modules/reports/pdfDownload.*
- [ ] T188 [P] [US6] Integration tests for `GET /reports/learning-history/pdf` (assert `%PDF`, Content-Type, Content-Disposition, authz, paywall behavior) in tests/integration/reports-pdf.test.ts
- [ ] T189 Add server runtime notes for headless Chromium (OS libs / container strategy) in specs/001-mvp-backend-flows/quickstart.md

---

## Dependencies & Execution Order

- Phase 1 (Setup) → Phase 2 (Foundational) → then user stories can proceed.
- Recommended delivery order: US1 → US2 → US3 → US4 → US8 → US5 → US6 → US7.
- Monetization/Admin (Phase 11) should be implemented early because it affects gating and operations.

## Parallel Opportunities (examples)

- US1: T027 + T028 + T032 can run in parallel; T034 + T035 + T038 can run in parallel.
- US2: T057 + T058 + T061 can run in parallel; T063 + T064 + T067 can run in parallel.
- US3: T072 + T073 + T077 can run in parallel; T078 + T079 + T082 can run in parallel.
- US8: T116 + T117 + T120 can run in parallel.

## Implementation Strategy

- MVP: complete Setup + Foundational + US1 (tests + OpenAPI) and demo onboarding.
- Add planning (US2/US3) next, then execution (US4), then dashboard gating (US8).
- Keep each story independently testable: its endpoints + service unit tests + integration tests must pass before moving on.
