# Life OS — Phase 1 & 2

**Phase 1 — Foundation:** project setup, authentication, layout system, sidebar, dashboard shell.
**Phase 2 — Task Management:** daily/weekly/monthly tasks, quick tasks.

## Structure

```
life-os/
├── frontend/    Vite + React + TypeScript + Tailwind CSS
├── backend/     Express + TypeScript
└── database/    Supabase SQL migrations + setup notes
```

## Setup order

Run these in order — each step depends on the previous one.

### 1. Supabase project

Create a project at [supabase.com](https://supabase.com) if you don't have one yet.

### 2. Database

Follow `database/README.md`. This runs the SQL migrations:
- `001_phase1_users.sql` — `public.users` profile table, signup trigger, RLS
- `002_phase2_tasks.sql` — `tasks` and `quick_tasks` tables, RLS

And walks through enabling Google OAuth.

### 3. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

Runs on `http://localhost:4000`. Health check: `GET /api/health`.

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Runs on `http://localhost:5173`.

## What's included

**Phase 1**
- **Auth**: email/password + Google OAuth via Supabase Auth, session persistence across refresh
- **Protected routing**: unauthenticated users are redirected to `/login`
- **Layout**: sidebar (Dashboard and Tasks active, others marked "Soon") + topbar with user menu/logout
- **Dashboard shell**: authenticated empty state, pulls the user's profile from the backend (`GET /api/users/me`)

**Phase 2**
- **Tasks**: single `tasks` table filtered into Daily / Weekly / Monthly views by `due_date`
  - Create, complete, delete tasks; priority (`none/low/medium/high`); status (`todo/pending/completed/overdue`)
  - `overdue` is recalculated server-side on every read — no stored status ever silently goes stale
- **Quick Tasks**: lightweight capture inbox (title + completed flag only), separate from full tasks, no conversion logic
- Full CRUD on both, scoped per-user via RLS + backend auth middleware

Mobile-first responsive layout throughout (sidebar collapses to a drawer below `md`).

## What's intentionally not here

Per the roadmap, only Phases 1–2 are built. No habit, journal, moodboard, or
analytics code exists yet — those are Phases 3–8. The sidebar links to them
are present but disabled so the full product shape is visible without
pretending those modules already work. Quick Task → full Task conversion was
explicitly scoped out of Phase 2.

## API reference (Phase 2)

All routes below require `Authorization: Bearer <supabase-access-token>`.

| Method | Path | Notes |
|---|---|---|
| GET | `/api/tasks?range=daily\|weekly\|monthly` | `range` optional — omit for all tasks |
| GET | `/api/tasks/:id` | |
| POST | `/api/tasks` | body: `{ title, description?, priority?, due_date? }` |
| PATCH | `/api/tasks/:id` | body: any subset of `{ title, description, status, priority, due_date }` |
| DELETE | `/api/tasks/:id` | |
| GET | `/api/quick-tasks` | |
| POST | `/api/quick-tasks` | body: `{ title }` |
| PATCH | `/api/quick-tasks/:id` | body: `{ completed }` |
| DELETE | `/api/quick-tasks/:id` | |

## Notes for the next phase

- Auth state lives in `frontend/src/features/auth/context/AuthContext.tsx` —
  Phase 3+ features should consume `useAuth()` rather than re-deriving session state.
- The backend's `requireAuth` middleware (`backend/src/middlewares/auth.middleware.ts`)
  should gate every future protected route the same way `/api/users/me` and
  `/api/tasks` are gated.
- `frontend/src/shared/layouts/navConfig.ts` is the single place to flip a module
  from "Soon" to active once its phase ships — flip `habits` next.
- The `ValidationError` pattern in `backend/src/validators/task.validator.ts`
  (thrown, caught by `errorHandler`, mapped to 400) is the convention to
  follow for Habit Tracking's validators in Phase 3.
- `getParam()` in `backend/src/utils/request.ts` should be reused for any
  new route with an `:id` param — needed because of Express 5's stricter
  `req.params` typing.
