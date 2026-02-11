# Phase 1 — Quickstart (Planned)

This quickstart describes the intended developer workflow for the BeeHome Planner backend once implementation starts.

> Note: At the time of writing, this repository contains specs only. The plan assumes a new Express + TypeScript + Prisma project will be created at the repo root.

## Prerequisites

- Node.js (LTS)
- PostgreSQL (local or Docker)

## Environment

Expected environment variables (draft):

- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — signing secret for access tokens
- `ADMIN_API_KEY` — secret for admin-only endpoints (license override)
- `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` (if OAuth in MVP)
- `APPLE_OAUTH_CLIENT_ID`, `APPLE_OAUTH_CLIENT_SECRET` (if OAuth in MVP)
- `MEDIA_STORAGE_*` — provider-specific settings (S3/GCS/etc.)

## Local DB

- Create a local database (e.g., `beehome_dev`).
- Run Prisma migrations.

## Common commands (planned)

- Install deps: `npm install`
- Start dev server: `npm run dev`
- Run unit tests: `npm run test:unit`
- Run integration tests: `npm run test:integration`
- Generate OpenAPI from Zod: `npm run openapi:generate`

## Docs

- Swagger UI served at `/docs` (protected or disabled in production).

## Paywall behavior (sanity check)

- If the family license is unlicensed (trial expired and no paid/manual license):
  - `/dashboard` returns aggregates only (no lists/ids)
  - `/license/status` and billing endpoints are accessible
  - all other endpoints return a consistent `402`-style error envelope

## Duration units (minutes vs hours)

- API accepts duration inputs as `{ value, unit }` where unit is `MINUTES` or `HOURS`.
- Backend stores durations canonically in minutes where persisted.

## Admin license override

- Admin-only endpoints require `X-Admin-Key: <ADMIN_API_KEY>`.
- All updates must write an audit record (who, when, from→to, reason).
