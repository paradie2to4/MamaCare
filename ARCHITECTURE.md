# Architecture & Phase Map

This document maps where later-phase functionality will live so earlier-phase code doesn't
need to be reshaped when it's built. It intentionally does not contain empty/unwired module
folders for unbuilt features — see the "no fake buttons" principle in the product spec.

## Phase 1 (built and tested)

- `backend/src/modules/auth` — register/login/refresh/logout, JWT + RBAC guards.
- `backend/src/modules/users` — own-profile read/update.
- `backend/src/modules/mothers` — mother profile + pregnancies, ownership enforced by
  deriving `motherProfileId` from the authenticated user, never a client-supplied id.
- `backend/src/modules/appointments` — CRUD + status transitions, scoped to the caller's
  own mother profile.
- `backend/src/modules/reminders` — CRUD/query, plus the `reminder.created` consumer path
  added in Phase 2.
- `backend/src/modules/education` — read-only bilingual content.
- `frontend/src/pages/{dashboard,journey,education,appointments,profile}` — the mother
  experience, plus `auth/` and `onboarding/`.

## Phase 2 (built and tested)

- **Partner experience**: `backend/src/modules/partners/` over the `PartnerLink` model —
  mother invites-by-email/revokes (`PartnersService`, pure derivation of her own profile,
  mirroring the MOTHER-scoped ownership pattern), partner accepts/views a narrow dashboard
  projection (`AppointmentsService.getNextAppointmentSummary`, never the mother's full
  records). Frontend: `frontend/src/pages/partner/PartnerDashboardPage.tsx`, plus an invite
  card on `frontend/src/pages/profile/ProfilePage.tsx`.
- **CHW dashboard & follow-up system**: `backend/src/modules/chw/` introduces the
  **CHW-scoped ownership pattern** — `ChwService.assertMotherAssignedToChw` checks a
  client-supplied `motherProfileId` against an allow-list (`MotherProfile.assignedCHWId`),
  the mirror-image of the mother-scoped "derive, never accept" pattern used everywhere else.
  `backend/src/modules/follow-ups/` is CRUD over `HealthFollowUp`, CHW-side gated through
  that same primitive, plus a read-only mother-facing view. Frontend:
  `frontend/src/pages/chw/{CHWDashboardPage,CHWMothersPage,CHWFollowUpsPage}.tsx`.
- **Notifications**: `backend/src/modules/notifications/` — list/unread-count/mark-read/
  mark-all-read, plus an internal `createForUser()` helper consumed by other modules and by
  the RabbitMQ consumer. Frontend: `NotificationBell` in the header, full list at
  `frontend/src/pages/notifications/NotificationsPage.tsx`.
- **RabbitMQ**: `backend/src/rabbitmq/` — NestJS's built-in `@nestjs/microservices`
  (`Transport.RMQ`), publisher + consumer in one hybrid process (`backend/src/main.ts` only
  calls `connectMicroservice`/`startAllMicroservices` when `RABBITMQ_URL` is set, and never
  awaits it before `app.listen()`, so the API boots fine with zero broker present — verified
  this session via unit tests with the broker mocked, not a live connection). Two events are
  wired for real: `appointment.created` (creates a reminder + notifies the mother) and
  `appointment.missed` (escalates priority — 1st miss MEDIUM, 2nd HIGH, 3rd+ URGENT — creates
  a `HealthFollowUp`, notifies the assigned CHW if any). Publish call sites live in
  `AppointmentsService.create()`/`updateStatus()`, wrapped so a publisher failure can never
  break the HTTP request.
- **Routing fix**: `frontend/src/routes/router.tsx` now gates `/app` itself behind
  `allowedRoles={['MOTHER','PARTNER','CHW']}`, with MOTHER-only and CHW-only sub-routes
  nested under their own `ProtectedRoute` — fixes a Phase 1 bug where a PARTNER/CHW hitting
  any protected route redirected into `/app` → rejected by the MOTHER-only gate → back to
  `/app`, forever.

## Phase 3 (not started): Health Officer dashboard, Analytics, AI assistant

- **Health officer dashboard**: `backend/src/modules/health-officer/` for aggregated,
  privacy-conscious analytics queries across districts/facilities; `frontend/src/pages/
  officer/`. Route placeholder at `/app/officer`.
- **AI assistant**: `backend/src/modules/ai/`, calling an LLM API (key via `AI_API_KEY`)
  behind a strict system prompt enforcing the no-diagnosis/no-prescription boundaries.
  Route placeholder at `/app/assistant`.

## Phase 4 (not started): Newborn mode, offline support, deployment hardening

- **Newborn mode**: extends `Pregnancy.status = COMPLETED` into a "Mother + Baby" mode;
  likely a new `Baby`/`Newborn` Prisma model plus `backend/src/modules/newborn/`.
- **Offline support**: the frontend's API layer (`frontend/src/lib/api/`) is already
  isolated behind typed functions, which is where a request queue / service worker cache
  would be introduced without touching page components.
- **Deployment**: `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile`
  are written and ready; this phase is about actually provisioning Postgres/RabbitMQ in
  the cloud and wiring CI.
