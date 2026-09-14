# MamaCare Rwanda

A maternal & newborn health platform connecting mothers, partners, community health
workers (Abajyanama b'Ubuzima), and health officers — built to strengthen, not replace,
the work of Rwanda's community health system.

This repository currently implements **Phases 1 and 2** of a four-phase roadmap. See
[ARCHITECTURE.md](./ARCHITECTURE.md) for where later phases will live.

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 | Auth & RBAC, Mother dashboard, Pregnancy journey, Appointments, Reminders, Education, EN/RW i18n | **Done** — built and verified (see [Testing](#testing)) |
| 2 | Partner experience, CHW dashboard, Follow-up system, Notifications, RabbitMQ | **Done** — built and verified (see [Testing](#testing)) |
| 3 | Health Officer dashboard, Analytics, AI assistant | AI assistant **done** (English; Kinyarwanda pending — see [Testing](#testing)); Health Officer dashboard & Analytics not started |
| 4 | Newborn mode, Offline support, Deployment hardening | Not started |

The Health Officer nav entry is still a clearly labeled "Coming soon" page — no fake data
behind it. AI Assistant is a real, working mother-only feature as of this change. Partner
and CHW are real, working roles as of Phase 2 — the demo accounts below
(`partner@example.com`, `chw@example.com`) have full dashboards.

## Tech stack

**Frontend**: React, TypeScript, Vite, Tailwind CSS, hand-authored shadcn/ui-style
components (Radix primitives + `class-variance-authority`), React Router, TanStack Query,
React Hook Form + Zod, react-i18next.

**Backend**: NestJS, TypeScript, PostgreSQL, Prisma ORM, JWT (access + rotating refresh
tokens), role-based guards, REST API, Swagger/OpenAPI docs, RabbitMQ (`@nestjs/microservices`,
`Transport.RMQ`, hybrid app — publisher and consumer in one process).

## Repository structure

```
MamaCare/
├── backend/     NestJS API (see backend/src/modules for the module list)
├── frontend/    React SPA (see frontend/src/pages)
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md (this file)
```

## Getting started

### Runnable today, no external services required

These commands only need Node.js installed — no Docker, no Postgres, no RabbitMQ:

```bash
# Backend
cd backend
npm install
npx prisma format       # schema formatting check
npx prisma validate     # schema correctness — no DB connection needed
npx prisma generate     # generates the typed Prisma client
npx tsc --noEmit        # strict typecheck
npx eslint .
npm test                # unit tests, PrismaService + RabbitMQ client mocked — no live DB/broker
npm run build

# Frontend
cd ../frontend
npm install
npx tsc -b
npx eslint .
npm test                # Vitest + Testing Library, API layer mocked with MSW
npm run build
```

All of the above were run and passed in this session (or documented if not — see
[Testing](#testing)).

### Needs infrastructure you'll set up yourself

This session had neither Docker nor a local PostgreSQL/RabbitMQ instance available, so
the following are written and ready but **not executed**:

```bash
# 1. Start Postgres + RabbitMQ (from repo root)
cp .env.example .env               # fill in real values
docker compose up -d postgres rabbitmq

# 2. Configure the backend
cd backend
cp .env.example .env               # point DATABASE_URL (and RABBITMQ_URL) at the compose services
npx prisma migrate dev             # creates the schema in your database
npx prisma db seed                 # loads realistic demo data (see Demo credentials)
npm run start:dev
```

With `RABBITMQ_URL` set, the backend attaches a RabbitMQ consumer on startup (logged as
"RabbitMQ event consumer connected" or a warning if the broker isn't reachable — either way
the HTTP API still starts). Two events fire for real once a broker is present: creating an
appointment publishes `appointment.created` (a reminder + notification appear for the
mother), and marking one `MISSED` publishes `appointment.missed` (a follow-up is created and
the assigned CHW is notified).

```bash
# 3. Configure and run the frontend
cd ../frontend
cp .env.example .env               # VITE_API_URL should point at the backend
npm run dev
```

Or, once Docker is available, run everything at once from the repo root:

```bash
docker compose up --build
```

## Environment variables

**Root `.env`** (docker-compose only):

| Variable | Description |
|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | Postgres container credentials/port |
| `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_PORT`, `RABBITMQ_MANAGEMENT_PORT` | RabbitMQ container credentials/ports |
| `FRONTEND_PORT`, `BACKEND_PORT` | Host ports the compose services are published on |

**`backend/.env`**:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string used by Prisma |
| `PORT` | HTTP port the API listens on (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `CORS_ORIGIN` | Allowed frontend origin |
| `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN` | Access token signing secret + TTL (default 15m) |
| `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default 30d) — note the refresh token itself is a random opaque value hashed at rest, not a JWT, so this secret is reserved for consistency but not currently used to sign it |
| `COOKIE_SECURE` | Set `true` behind HTTPS in production |
| `RABBITMQ_URL` | Consumed since Phase 2 — if unset, the API still starts fine and just logs that the event consumer is disabled |
| `AI_API_KEY` | Anthropic API key for the AI assistant. If unset, the assistant falls back to a deterministic knowledge-base reply instead of calling the LLM |
| `AI_MODEL` | Anthropic model id, defaults to `claude-sonnet-5` if unset |

**`frontend/.env`**:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, e.g. `http://localhost:3000/api/v1` |

## Demo credentials

Once seed data is applied (`npx prisma db seed`), all accounts share the password
**`Password123!`**:

- `mother@example.com` — primary demo account, ~24 weeks pregnant, appointments covering
  every status (upcoming, completed, missed, cancelled), assigned to the demo CHW, linked
  to the demo partner, has one open follow-up
- `mother2@example.com` — ~8 weeks pregnant, also assigned to the demo CHW
- `mother3@example.com` — completed/postpartum pregnancy, no CHW assigned (demos that state)
- `partner@example.com` — ACTIVE-linked to `mother@example.com`; has a working dashboard
- `chw@example.com` — assigned to `mother@example.com` and `mother2@example.com`; has a
  working "My Community" dashboard with one open follow-up
- `officer@example.com`, `admin@example.com` — schema exercised for future phases; no
  dedicated UI yet

## API documentation

Once the backend is running, Swagger UI is available at `http://localhost:3000/api/docs`.
The full endpoint list is also documented inline in code via `@ApiTags` decorators on each
controller.

## Testing

**Ran this session (no live DB/broker needed):**
- Backend: Jest unit tests for auth (register/login/refresh rotation & rejection),
  appointment ownership (a mother cannot read another mother's appointment), CHW-scoped
  ownership (a CHW cannot access a mother assigned to a different CHW —
  `chw.service.spec.ts`), partner-scoped ownership (a partner never sees another partner's
  link — `partners.service.spec.ts`), the RabbitMQ publisher/consumer with the broker client
  mocked (`events-publisher.service.spec.ts`, `domain-events.consumer.spec.ts`), pregnancy
  week calculation, reminders, notifications, follow-ups, and education filtering — all
  with `PrismaService` mocked via `overrideProvider`.
- Frontend: Vitest + Testing Library + MSW for login flow, language switching, appointment
  status rendering, the partner dashboard's NONE/PENDING/ACTIVE states, the profile page's
  partner invite/revoke flow, the CHW summary dashboard, the notification bell's unread
  badge, and protected-route role redirection (including the CHW/PARTNER `/app` routing fix).

**Deferred until Postgres/RabbitMQ are available:**
- `backend/test/jest-e2e.json` — scaffolded, not run (needs a live database).
- Manual end-to-end click-through of the running app, including a live RabbitMQ
  publish → consume round trip.

## RabbitMQ

Wired in as of Phase 2 via `@nestjs/microservices` (`Transport.RMQ`) — see
[ARCHITECTURE.md](./ARCHITECTURE.md) for the exact event flows and the hybrid-app wiring
that keeps the HTTP API booting fine even with no broker present (verified this session with
the broker client mocked, not a live connection).

## AI configuration

`backend/src/modules/ai/` calls the Anthropic API behind a strict system prompt (see
`ai.system-prompt.ts`) enforcing no-diagnosis/no-prescription boundaries, grounded in a
curated English knowledge base (`ai.knowledge-base.ts`) covering ANC visits, danger signs,
nutrition, birth preparation, postnatal/newborn care, mental wellbeing, and hygiene. Set
`AI_API_KEY` in `backend/.env` to enable real LLM replies; with no key set, the assistant
falls back to a deterministic keyword-matched reply from the same knowledge base, so the
feature works end-to-end without any external dependency. Kinyarwanda content is not yet
translated — see the Phase status table above.

## Deployment

**Database (done)**: migrated and seeded on [Neon](https://neon.tech) Postgres.
`backend/prisma/schema.prisma` splits `url` (pooled, `DATABASE_URL`) from `directUrl`
(unpooled, `DIRECT_DATABASE_URL`) per Neon's documented Prisma pattern — migrations need the
direct connection, the running app uses the pooled one.

**Backend (in progress)**: targeting AWS App Runner, source-connected to this GitHub repo
(`backend/apprunner.yaml` configures the build/run commands — no Docker needed for this path).
Currently blocked on AWS account activation (`SubscriptionRequiredException` on a brand-new
account, most commonly a billing/payment-method verification step in the AWS Console) —
resume with the AWS CLI once that clears.

**Frontend**: two options, both using the same build —
1. **Vercel with mock data** (fastest path to a live demo while the backend isn't deployed
   yet): set `VITE_ENABLE_MOCKS=true` as a Vercel environment variable. The entire app then
   runs against realistic in-browser mock data (via [MSW](https://mswjs.io)) instead of a
   real API — see [Mock/demo mode](#mockdemo-mode) below. `frontend/vercel.json` handles the
   SPA routing fallback Vercel needs for React Router deep links.
2. **AWS S3 + CloudFront** with `VITE_ENABLE_MOCKS` unset/false and `VITE_API_URL` pointing
   at the real App Runner URL, once the backend is live.
- **RabbitMQ** → not deployed yet; Amazon MQ or CloudAMQP once the backend flows need to be
  demoed live (the app runs fine without it either way — see [RabbitMQ](#rabbitmq) above).

## Mock/demo mode

`frontend/src/mocks/` is a full [MSW](https://mswjs.io) browser-mode mock of every endpoint
the app calls (`handlers.ts`), backed by an in-memory store (`store.ts`) seeded with the same
fictional accounts as `backend/prisma/seed.ts` (`fixtures.ts`). Set `VITE_ENABLE_MOCKS=true`
(see `frontend/.env.example`) and `main.tsx` starts the mock worker before rendering — no
backend, no network calls, nothing to deploy except the static frontend build itself.

- Login as `mother@example.com`, `partner@example.com`, or `chw@example.com` (password
  `Password123!` for all) to see each role's dashboard.
- State (new appointments, dismissed reminders, accepted invites, etc.) persists only for the
  current tab session and resets on reload — expected for a mock, not a bug.
- A "Demo mode" banner (`components/common/DemoModeBanner.tsx`) renders automatically
  whenever this flag is on, so it's never ambiguous whether a deployment is live or mocked.
- This mode is additive: the exact same build works against a real backend by leaving
  `VITE_ENABLE_MOCKS` unset and setting `VITE_API_URL` instead — nothing else changes.
