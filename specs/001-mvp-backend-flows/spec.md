# Feature Specification: BeeHome Planner MVP Backend API (Core Flows)

**Feature Branch**: `feature/BH-1`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: MVP summary provided by product: BeeHome Planner supports homeschooling families across Plan/Act/Improve/Connect, including subjects/lessons/classes scheduling, class execution logging, science projects, sharing artifacts, reports/notifications, data export, and family permissions. Authentication must support email+password plus Google and Apple sign-in.

## Clarifications

### Session 2026-02-09

- Q: What should happen when the family trial expires (no paid/manual license)? → A: Allow access only to the dashboard view; block history/learning history, reports, and export as paid features; all other actions should respond with a clear “payment required” message.
- Q: When the family is not licensed, can they still manage basic settings (children/adults/config)? → A: No. Block everything except dashboard + license/billing.
- Q: In dashboard-only mode (not licensed), what can the dashboard show? → A: Overview-only counters/aggregates, no detailed lists and no drill-down links.
- Q: Who can use the manual license override? → A: Internal staff/admin only (the product operator), not family users.
- Q: How is the staff/admin license override exposed? → A: Protected admin API endpoints (with audit trail).

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Account, Family, Child Setup (Priority: P1)

Parents create an account, create a family, invite another adult (up to two adults total), optionally create child profiles, and define initial planning settings for the household (academic year and/or cycles).

**Why this priority**: This is the minimum foundation required for every other flow and establishes ownership, permissions, and the child context used by planning and tracking.

**Independent Test**: Can be fully tested by creating an account, creating a family, adding one child, and verifying that a second adult can be invited and assigned a role.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they sign up and create a family, **Then** they become a family admin and can access the family workspace.
2. **Given** a family with one adult, **When** the admin invites a second adult, **Then** the invited adult can accept the invite and access the same family data according to their role.
3. **Given** a family admin, **When** they optionally create a child profile with a required name and optional image, **Then** the child appears in the family and can be selected in planning and tracking flows.
4. **Given** a family with no children created yet, **When** the admin proceeds to planning, **Then** they can still create subjects/lessons/schedules and assign children later.
5. **Given** a family admin, **When** they configure planning settings, **Then** they can set an academic-year start date and optionally define cycles (or choose to plan using only one of these concepts).

---

### User Story 2 - Plan: Subjects, Lessons, and Materials (Priority: P2)

Parents create subjects and lessons, optionally link lessons to an academic year and/or cycle, add flexible descriptions, attach links/files, optionally break lessons into classes, and attach materials with reminders.

**Why this priority**: Planning is core value. Capturing reusable lesson structures enables future scheduling, reuse across children, and sharing between families.

**Independent Test**: Can be tested by creating a subject, creating a lesson with optional attachments, and verifying materials and reminders can be configured.

**Acceptance Scenarios**:

1. **Given** a family, **When** a parent creates a subject and a lesson, **Then** the lesson is saved and can optionally be linked to an academic year and/or a cycle.
2. **Given** an existing lesson (or a scheduled class/activity), **When** a parent adds materials and sets a reminder cadence (daily/weekly/monthly), **Then** reminders can be generated for the appropriate future dates.

---

### User Story 3 - Plan: Schedule Classes and Activities (Priority: P3)

Parents schedule classes and/or activities using one-time or recurring schedules. Scheduling can optionally assign children up-front, but must also support assigning (and changing) children later.

Scheduled items can represent either:
- a lesson-based class (optionally with estimated time and optional scoring/points), or
- an activity (e.g., cinema/theater) with indoor/outdoor classification, estimated time, and optional scoring/points.

**Why this priority**: Scheduling connects planning to daily execution. Recurrence enables real-world homeschooling routines (e.g., twice weekly).

**Independent Test**: Can be tested by scheduling a recurring class for two children and verifying a generated schedule for a given week.

**Acceptance Scenarios**:

1. **Given** a lesson or activity template, **When** a parent creates a recurring schedule (days/time) and optionally assigns children, **Then** upcoming scheduled instances are produced for the requested time range.
2. **Given** a scheduled recurring series, **When** a parent edits the recurrence, **Then** future instances update accordingly while past completed instances remain unchanged.
3. **Given** a scheduled instance that was not completed, **When** a parent selects an action for that occurrence, **Then** the system supports:
  - **Skip occurrence** (suggested product label: “Pular”): this occurrence is marked as skipped and the rest of the series stays on the original dates, or
  - **Shift series forward by one slot** (suggested product label: “Atrasar plano”): the plan is delayed so the next planned item moves to the next available scheduled slot, shifting subsequent planned items forward, or
  - **Reschedule occurrence to a date** (suggested product label: “Reagendar”): the parent picks a new date/time for that occurrence.

---

### User Story 4 - Act: Register a Class/Activity Execution (Priority: P4)

Parents open the schedule, mark a class/activity as completed, record actual participating children (which may differ from the originally planned children) and actual duration, and optionally add media and notes (including parent reflections). Parents can also create “public highlight” notes intended for sharing.

**Why this priority**: This is the daily workflow that turns planned work into learning history.

**Independent Test**: Can be tested by marking a scheduled class complete for one child and verifying the created execution record appears in the child’s history.

**Acceptance Scenarios**:

1. **Given** a scheduled class/activity for today, **When** a parent marks it completed and records duration and participants, **Then** the system stores an execution record linked to the schedule and the selected participating children.
2. **Given** a completed class, **When** a parent adds private notes and a separate public highlight, **Then** private notes are visible only to authorized adults while the highlight is shareable.

---

### User Story 5 - Science Projects: Long-Running Activities (Priority: P5)

Parents create science projects and log project activities over time (time spent, media, notes). Projects contribute to reports, child profiles, and insights.

**Why this priority**: Projects are a distinct learning format with a timeline and cumulative tracking.

**Independent Test**: Can be tested by creating a science project, adding two activities, and verifying totals and timeline are correct.

**Acceptance Scenarios**:

1. **Given** a family with children, **When** a parent creates a science project and assigns children, **Then** the project appears in the family workspace and in each assigned child’s project list.
2. **Given** an existing project, **When** a parent logs an activity entry with time and media, **Then** the project timeline and total time spent update.

---

### User Story 6 - Reports, Notifications, and Data Export (Priority: P6)

Parents can generate on-demand reports (materials needed, upcoming activities, completed activities). Reports can be scheduled and delivered through configured channels. Parents can request weekly data exports and receive a downloadable file set.

**Why this priority**: Reporting and export create ongoing value, accountability, and portability of family learning data.

**Independent Test**: Can be tested by generating a “materials needed for next week” report and requesting a data export for a small dataset.

**Acceptance Scenarios**:

1. **Given** a week of scheduled classes with materials, **When** a parent generates a materials-needed report, **Then** the report includes the correct items for the chosen time range.
2. **Given** a family with recorded class executions, **When** a parent requests a weekly export, **Then** the system produces an export artifact and provides secure access to retrieve it.

---

### User Story 7 - Connect: Shareable Artifacts (Priority: P7)

Parents can generate shareable images for completed classes and projects and share lesson plans/reports and child profiles in exportable formats.

**Why this priority**: Sharing supports community-building and makes results tangible.

**Independent Test**: Can be tested by generating a shareable artifact for a completed class with one image and short text.

**Acceptance Scenarios**:

1. **Given** a completed class with a highlight, **When** a parent generates a shareable image, **Then** the system returns a shareable artifact linked to that class.

---

### User Story 8 - Improve: Insights Dashboard (Priority: P8)

Parents can view insights and reflections derived from prior classes and activities, including metrics like completed vs skipped, time spent by subject, and progress against goals.

**Why this priority**: Insights help families improve planning and execution, but depend on earlier data capture.

**Independent Test**: Can be tested by recording several class executions and verifying dashboard aggregates match the recorded data.

**Acceptance Scenarios**:

1. **Given** a set of class executions and goals, **When** a parent views the dashboard for a child and time window, **Then** the system returns correct aggregates (time spent, completion rate, progress vs goals).

### Edge Cases

- A child is removed from a family after having historical class records.
- A recurring schedule is edited mid-cycle; ensure past executions remain unchanged.
- A recurring series has a mixture of completed and planned instances; skipping/shifting/rescheduling must not rewrite completed execution history.
- Shifting a series forward encounters conflicts (e.g., already occupied schedule slots) and must produce deterministic results.
- Time zones and daylight savings affect schedule generation.
- File uploads fail mid-way; partial uploads do not create broken records.
- Invited adult never accepts; invite can be revoked and re-sent.
- Two adults attempt to edit the same lesson/schedule at the same time.
- A user with “view only” role attempts to create/edit content.
- Export requests are repeated frequently; enforce limits and provide clear status.
- Trial expiration occurs mid-day; define entitlement checks in a time-zone-safe way.
- A family is manually granted a license and later reverted; ensure access changes immediately and is auditable.
- A user belongs to multiple families with different license states.

## Assumptions & Dependencies

- The backend will serve one or more client applications (mobile and web).
- Authentication must support email+password, plus Google and Apple sign-in.
- Delivery of emails and push notifications depends on external delivery providers configured by the product team.
- File/media handling depends on an external storage mechanism with access controls; the API must treat media as sensitive family data.
- Monetization (trial/subscription) may depend on external billing providers; the API must support a provider-agnostic license state for each family.
- The MVP scope focuses on core homeschooling planning/tracking flows; advanced analytics and highly customized reporting layouts may be iterative.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to create an account using email + password.
- **FR-002**: System MUST allow users to sign in using email + password.
- **FR-003**: System MUST allow users to sign in using Google accounts.
- **FR-004**: System MUST allow users to sign in using Apple accounts.
- **FR-005**: System MUST link sign-in methods to a single user identity when the same person uses multiple methods.

- **FR-006**: System MUST allow a user to create a family.
- **FR-007**: System MUST support up to two adult users per family.
- **FR-008**: System MUST allow a family admin to invite an adult user and assign one of these permission levels: view-only, create/edit, manage settings/goals.
- **FR-009**: System MUST allow admins to revoke access at any time.
  - Clarification: “Revoke access” MUST include revoking pending invites AND removing/deactivating an already-accepted adult membership such that access is blocked immediately.

- **FR-010**: System MUST allow creation and management of child profiles (name, age, optional profile image).
- **FR-010a**: Planning features (subjects, lessons, scheduling) MUST be usable even if no child profiles exist yet.

- **FR-011**: System MUST allow configuring an academic-year anchor date (the date when the family’s academic year begins).
- **FR-011a**: System MUST allow families to choose whether they plan primarily by academic year, by cycles, or by both.
- **FR-012**: System MUST allow defining cycles using a user-defined duration and associating content to cycles.
- **FR-012a**: Cycle periods MUST be derived from the family’s planning anchor configuration (e.g., academic-year anchor date + cycle duration) rather than requiring a per-cycle start date.
  - Clarification: The API MUST provide a way to compute/return derived cycle periods for a requested date range using (anchorDate + cycleDuration) without storing per-cycle start dates.

- **FR-013**: System MUST allow creating subjects.
- **FR-014**: System MUST allow editing and archiving subjects.

- **FR-015**: System MUST allow creating lessons with required title and optional fields: subject, cycle, academic year, description, links, and attachments.
- **FR-016**: System MUST support attaching external sources (links) to lessons.
- **FR-017**: System MUST support attaching files (e.g., PDFs, images, audio) to lessons and to class executions.
- **FR-018**: System MUST allow a lesson to be represented as either a generic lesson or a lesson broken into smaller class units.
- **FR-019**: System MUST allow specifying estimated duration/time goals at least at the subject level and optionally at lesson/class level.
- **FR-019a**: System MUST allow setting time goals per subject for monthly, yearly, and per-cycle horizons.
- **FR-019b**: System MUST allow optionally assigning goals per child.
- **FR-020**: System MUST allow configuring whether a lesson/class is graded.

- **FR-021**: System MUST allow adding materials to lessons and/or scheduled classes.
- **FR-022**: System MUST support material reminders with at least daily, weekly, and monthly cadence.

- **FR-023**: System MUST allow scheduling classes and/or activities.
- **FR-024**: System MUST support one-time schedules and recurring schedules with days-of-week and times.
- **FR-025**: System MUST allow “simple planning” by scheduling repeated class instances for a generic lesson.

- **FR-025a**: Scheduling MUST allow assigning zero or more children at plan time, and later changing the planned children without rewriting historical executions.
- **FR-025b**: Scheduled items MUST support estimated duration/time, and the system MUST accept duration input in either minutes or hours (per user preference).
- **FR-025c**: Scheduled items MAY support scoring/points; if enabled, a maximum possible points value MUST be stored.
- **FR-025d**: Activities MUST support indoor/outdoor classification.

- **FR-025e**: For a not-completed scheduled occurrence in a recurring series, the system MUST support at least these outcomes: skip occurrence, shift series forward by one slot, and reschedule occurrence to a chosen date/time.
  - Clarification (deterministic): “Shift series forward by one slot” MUST be deterministic in the presence of conflicts/DST and MUST NOT rewrite completed executions. If shifting encounters an occupied slot, the algorithm MUST advance to the next valid slot per rule until it finds a free one (or fail with a stable error).

- **FR-026**: System MUST allow marking a scheduled class instance as completed.
- **FR-027**: System MUST allow recording participating children and actual duration for an execution, even when participants differ from the planned children.
- **FR-028**: System MUST allow attaching photos and videos to a class execution.
- **FR-029**: System MUST allow storing notes for an execution, with all reflection fields optional.
- **FR-030**: System MUST separate private notes (adults-only) from public highlights intended for sharing.
- **FR-031**: System MUST allow awarding medals/honors to a child and tracking them over time.
- **FR-031a**: System MAY allow optionally evaluating a class/activity execution with points/scores.

- **FR-032**: System MUST allow tracking activities (including indoor/outdoor) and associating them with children and time spent.
  - Clarification (MVP): Activity tracking is satisfied by scheduling ACTIVITY items and recording executions (participants + duration) and enabling reporting/aggregation on those executions.

- **FR-033**: System MUST allow creating science projects with title, optional description, optional time range, assigned children, resources, materials, and goals.
- **FR-034**: System MUST allow logging science project activity entries over time including date, time spent, optional media, and notes.
- **FR-035**: System MUST provide a project timeline view and total time spent per project.

- **FR-036**: System MUST generate reports for materials needed and upcoming activities for a chosen time range.
- **FR-037**: System MUST generate learning history reports per child (weekly, monthly, yearly, per-cycle).
- **FR-038**: System MUST support at least on-screen reports and downloadable document formats.
  - Clarification (MVP): “Downloadable document formats” MUST include PDF generated by the backend (server-side).
  - Clarification (rendering): PDF MUST be rendered from HTML templates using headless Chromium (or equivalent) to enable future report templates.
  - Clarification (API contract): The API MUST provide a dedicated endpoint for PDF download for learning history reports:
    - `GET /reports/learning-history/pdf?childId=...&startDate=...&endDate=...&format=summary|visual`
  - Clarification (clients incl. mobile): Clients (web/mobile) download/view the PDF; clients MUST NOT be required to generate PDFs locally.
  - Clarification (security): PDF downloads MUST enforce the same authz + family isolation + license/paywall rules as the on-screen report endpoints.
- **FR-039**: System MUST allow parents to configure which reports they receive, the delivery method (in-app, email, push), and the frequency (daily, weekly, monthly).
- **FR-039a**: System MUST support generating a default summarized learning history report and a more visual report that can include images when available.
  - Clarification: The API MUST expose a report format selector (at least `summary` vs `visual`) and document output differences.
  - Clarification (consistency): The same selector MUST apply to both on-screen (JSON) learning history reports and PDF downloads (FR-038).

- **FR-040**: System MUST allow requesting a periodic data export of all family information.
- **FR-041**: Exports MUST include structured learning history per child and media organized by child and date.
- **FR-042**: Exports MUST be retrievable via secure download and/or email delivery.
- **FR-042a**: Exports SHOULD include a spreadsheet-friendly format for learning history (e.g., suitable for Excel import).

- **FR-043**: System MUST provide a dashboard with consolidated metrics (completed vs skipped, time spent by subject, progress vs goals) with filters at least by child and time period.
- **FR-044**: System MUST allow families to choose what they want to track vs skip (tracking configuration).

- **FR-045**: System MUST enforce permissions on every protected action (view-only cannot edit; create/edit cannot manage settings unless granted; etc.).
- **FR-046**: System MUST ensure that families cannot access other families’ data.
- **FR-047**: System MUST return consistent, documented error responses and appropriate HTTP statuses for failures.

- **FR-048**: System MUST provide a daily message feed containing an image and formatted text suitable for social sharing.
  - Clarification (MVP): “Daily message feed” may return a single “message of the day” payload (image + formatted text) without admin tooling, as long as behavior is consistent and testable.
- **FR-049**: System MUST allow generating share-ready artifacts from public highlights (short text + selected images) without exposing private notes.

- **FR-050**: System MUST enforce access based on a **family license state**.
- **FR-051**: System MUST grant each family a **30-day free trial** starting at family creation time.
- **FR-052**: Trial and paid entitlement MUST be tracked **per family** (not per user).
- **FR-053**: When a family license is not active (trial expired and no paid/manual license), the system MUST:
  - allow access only to the **dashboard** view for that family and to **license/billing** endpoints needed to pay/restore access, and
  - block access to **all other** protected resources (including child profiles, subjects, lessons, schedules, executions, learning history, reports, and exports), and
  - return a consistent “payment required / license required” error response for blocked actions suitable for clients to show a paywall message.
  - Clarification (HTTP + stable code): Blocked actions MUST return HTTP `402 Payment Required` using the standard error envelope with a stable `error.code` (e.g., `LICENSE_REQUIRED`).

- **FR-053a**: In the unlicensed **dashboard-only** view, the system MUST only return high-level aggregates/counters and MUST NOT return itemized lists or identifiers that enable drill-down into gated content.
- **FR-054**: System MUST provide an admin-only capability to **manually set/override** a family license, including an audit trail (who, when, from→to, reason).
- **FR-054a**: Manual license override MUST be restricted to internal staff/admin (not family users), and must not be accessible to standard authenticated family accounts.
- **FR-054b**: The system MUST expose admin-only API operations to view and update a family's license state, protected by a staff/admin authentication & authorization mechanism distinct from family roles.
- **FR-055**: System MUST allow retrieving the current family license status and trial end date for display in clients.

### Key Entities *(include if feature involves data)*

- **User**: A person who can authenticate and access one or more families (adult accounts).
- **Family**: The household/workspace boundary for data access.
- **FamilyMembership**: The relationship between a user and a family, including role/permission level.
- **ChildProfile**: A child in a family, with optional profile image and longitudinal learning history.

- **Subject**: A topic area defined by a family (e.g., Math, History).
- **Cycle**: A user-defined learning cycle definition with a custom duration (its calendar position is derived from planning settings).
- **AcademicYearSettings**: Family settings defining the academic-year anchor date and related planning context.

- **Lesson**: A reusable learning unit; can be generic or contain multiple class units.
- **ClassUnit**: An optional subdivision within a lesson.
- **Schedule**: A one-time or recurring plan that produces scheduled instances.
- **ScheduledInstance**: A concrete occurrence on a date/time. Instances can represent either a class (lesson-based) or an activity.
- **ScheduleException**: A per-occurrence override (e.g., skipped, shifted, rescheduled).

- **Material**: A thing needed for a lesson/class (with optional reminders).
- **Reminder**: A configured cadence/time window for material preparation.

- **ClassExecution**: The record of what actually happened for a scheduled class instance.
- **PrivateNote**: Adults-only observations and reflections.
- **PublicHighlight**: Shareable positive moments intended for external sharing.
- **MediaAsset**: Photos/videos/files attached to lessons, executions, and projects.

- **Medal/Achievement**: Rewards or honors granted to a child.
- **Activity**: Extra activities (indoor/outdoor) tracked outside standard classes.

- **ScienceProject**: A long-running project with assigned children, resources, materials, and goals.
- **ScienceProjectEntry**: A time-stamped activity record within a project.

- **Report**: A generated view or artifact for materials, upcoming activities, or learning history.
- **NotificationPreference**: A family/user configuration for delivery method and frequency.
- **ExportRequest**: A request to generate a data export.
- **ExportArtifact**: The output bundle for export (file(s) + metadata + secure access window).

- **FamilyLicense**: The license/entitlement state for a family (trial start/end, paid/manual status, and audit metadata).

- **DailyMessage**: A daily share-ready message with an image and formatted text.
- **ShareArtifact**: A generated shareable output derived from a class execution, project entry, report, or daily message.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: A parent can complete onboarding (account → family → first child) in under 5 minutes.
- **SC-002**: A parent can create a subject, lesson, and recurring schedule in under 3 minutes.
- **SC-003**: A parent can mark a scheduled class completed (participants + duration + optional note) in under 60 seconds.
- **SC-004**: Reports for a typical family (single week range) generate successfully in under 10 seconds.
- **SC-005**: Weekly export requests complete within 30 minutes for a typical family dataset and provide secure retrieval.
- **SC-006**: At least 95% of authenticated API calls succeed without server errors under normal usage patterns.
- **SC-007**: Permission violations are consistently blocked (unauthorized/forbidden) in automated tests for all protected endpoints.

## Monetization Notes

- Trial/subscription is **in MVP scope**.
- Trial and payment are **per family**.
- The backend must support **manual license overrides** for admin/staff operations.
- Post-trial default: allow **dashboard only** + **license/billing**; block all other features with a clear paywall-ready error.
- Manual overrides are performed through **admin-only API endpoints**.
