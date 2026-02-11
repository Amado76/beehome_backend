# Phase 1 — Data Model (Draft)

This document proposes the minimum data model to satisfy the MVP spec in [spec.md](spec.md), with paywall/trial enforcement and recurring scheduling semantics.

## Conventions

- IDs are UUIDs.
- All timestamps are stored as UTC (`timestamptz`).
- Family is the primary data boundary: most rows belong to a `familyId`.

## Entities

### User

Represents an adult who can authenticate.

Fields (suggested):
- `id`
- `email` (nullable if OAuth-only, but typically present)
- `passwordHash` (nullable if OAuth-only)
- `createdAt`, `updatedAt`

Relationships:
- has many `AuthIdentity`
- has many `FamilyMembership`

### AuthIdentity

Links OAuth providers to a User.

Fields:
- `id`
- `userId`
- `provider` (enum: `EMAIL_PASSWORD`, `GOOGLE`, `APPLE`)
- `providerSubject` (string; provider user id)
- `createdAt`

Constraints:
- unique `(provider, providerSubject)`

### Family

Workspace boundary.

Fields:
- `id`
- `name` (optional)
- `createdAt`, `updatedAt`

Relationships:
- has many `FamilyMembership`
- has many `ChildProfile`
- has one `AcademicYearSettings`
- has many `Cycle`
- has many `Subject`, `Lesson`, `Schedule`, etc.
- has one `FamilyLicense`

### FamilyMembership

Connects user to family with permissions.

Fields:
- `id`
- `familyId`
- `userId`
- `role` (enum: `VIEW_ONLY`, `CREATE_EDIT`, `MANAGE_SETTINGS_GOALS`, `ADMIN`) — map to spec levels
- `createdAt`

Constraints:
- unique `(familyId, userId)`
- enforce max 2 adults per family at service level (and optionally DB constraint logic)

### FamilyInvite

Invitation for second adult.

Fields:
- `id`
- `familyId`
- `email`
- `role`
- `tokenHash`
- `expiresAt`
- `acceptedAt` (nullable)

### ChildProfile

Fields:
- `id`
- `familyId`
- `name`
- `birthDate` (optional) or `age` (optional)
- `imageAssetId` (optional)
- `createdAt`, `updatedAt`

### AcademicYearSettings

Fields:
- `familyId` (PK)
- `anchorDate` (date) — the day the family’s academic year starts (used to derive academic-year and cycle periods)
- `planningMode` (enum: `ACADEMIC_YEAR`, `CYCLES`, `BOTH`)
- `durationDisplayUnit` (enum: `MINUTES`, `HOURS`, optional) — UI preference; API can still accept explicit units

### Cycle

Fields:
- `id`
- `familyId`
- `name`
- `durationDays` (int) or `durationWeeks` (int)
- `order` (int) — optional; used to define cycle sequence within the academic year

Notes:
- Cycles do not store a calendar start date. Their effective date ranges are derived from `AcademicYearSettings.anchorDate` plus cycle duration and order.

### Subject

Fields:
- `id`
- `familyId`
- `name`
- `archivedAt` (nullable)

### Lesson

Reusable unit.

Fields:
- `id`
- `familyId`
- `subjectId` (optional)
- `title`
- `description` (optional)
- `academicYearId` (optional; could be derived) or link via dates
- `cycleId` (optional)
- `estimatedMinutes` (optional) — canonical storage; clients may input minutes or hours
- `isGraded` (bool)
- `createdAt`, `updatedAt`

Relationships:
- has many `LessonAttachment`
- has many `LessonMaterial`
- has many `ClassUnit` (optional)

### ClassUnit

Fields:
- `id`
- `lessonId`
- `title`
- `order` (int)
- `estimatedMinutes` (optional) — canonical storage; clients may input minutes or hours

### Material

We model materials as attached to lessons and/or schedules.

#### LessonMaterial

Fields:
- `id`
- `lessonId`
- `name`
- `quantity` (optional)
- `notes` (optional)

#### ScheduleMaterial

Fields:
- `id`
- `scheduleId`
- `name`
- `quantity` (optional)
- `notes` (optional)

### Schedule

Represents a planned series.

Fields:
- `id`
- `familyId`
- `type` (enum: `LESSON_CLASS`, `ACTIVITY`)
- `lessonId` (nullable; required when `LESSON_CLASS`)
- `title` (string; for activities or ad-hoc)
- `timezone` (IANA TZ string)
- `estimatedMinutes` (optional) — canonical storage; clients may input minutes or hours
- `scoringEnabled` (bool)
- `maxPoints` (optional; required if scoring enabled)
- `activityEnvironment` (enum `INDOOR`/`OUTDOOR`/`MIXED` nullable; relevant to activities)
- `createdAt`, `updatedAt`

Relationships:
- has many `ScheduleRule`
- has many `ScheduleChild` (planned children)
- has many `ScheduleException`

### ScheduleRule

Recurrence definition.

Fields:
- `id`
- `scheduleId`
- `daysOfWeek` (array of ints 0-6)
- `startTimeLocal` (time)
- `durationMinutes` (optional)
- `startsOn` (date)
- `endsOn` (date, nullable)

### ScheduleChild (planned)

Fields:
- `scheduleId`
- `childId`

### ScheduleException

Per-occurrence overrides.

Fields:
- `id`
- `scheduleId`
- `occurrenceStartsAt` (timestamptz) — the original occurrence identity
- `type` (enum: `SKIP`, `SHIFT_FORWARD`, `RESCHEDULE`)
- `newStartsAt` (timestamptz, nullable; required for RESCHEDULE)
- `createdAt`

Notes:
- `SHIFT_FORWARD` can be modeled as a marker that affects subsequent generated occurrences.

### ClassExecution

Record of completion.

Fields:
- `id`
- `familyId`
- `scheduleId`
- `occurrenceStartsAt` (timestamptz) — which planned occurrence was executed
- `completedAt` (timestamptz)
- `actualMinutes` (int, nullable)
- `pointsAwarded` (int, nullable)
- `createdAt`

Relationships:
- has many `ExecutionParticipant`
- has many `MediaAsset`
- has many `PrivateNote` / `PublicHighlight` (or a single table with type)

### ExecutionParticipant

Fields:
- `executionId`
- `childId`

### ScienceProject

Fields:
- `id`
- `familyId`
- `title`
- `description` (optional)
- `startsAt`/`endsAt` (optional)

Relationships:
- many-to-many to `ChildProfile`

### ScienceProjectEntry

Fields:
- `id`
- `projectId`
- `occurredAt` (date or timestamptz)
- `minutesSpent` (int)
- `notes` (optional)

### MediaAsset

Fields:
- `id`
- `familyId`
- `type` (enum: `IMAGE`, `VIDEO`, `FILE`)
- `storageKey` / `url` (depending on provider)
- `createdAt`

### FamilyLicense

Controls paywall.

Fields:
- `familyId` (PK)
- `trialStartsAt` (timestamptz)
- `trialEndsAt` (timestamptz)
- `status` (enum: `TRIAL`, `ACTIVE`, `EXPIRED`, `MANUAL_ACTIVE`)
- `manualActiveUntil` (timestamptz, nullable)
- `updatedAt`

### FamilyLicenseAudit

Fields:
- `id`
- `familyId`
- `changedBy` (staff identifier)
- `fromStatus`, `toStatus`
- `reason`
- `createdAt`

## Validation rules (high level)

- Max 2 adult memberships per family.
- `scoringEnabled=true` ⇒ `maxPoints` required.
- Schedule occurrences are generated deterministically from rule + timezone + exceptions.
- Executions can have participants different from planned schedule children.

## State transitions

### FamilyLicense

- TRIAL → ACTIVE (payment)
- TRIAL → EXPIRED (trial ends)
- EXPIRED → ACTIVE (payment)
- (any) → MANUAL_ACTIVE (staff override)
- MANUAL_ACTIVE → EXPIRED/ACTIVE (override end or staff change)
