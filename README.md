# Life OS — Phase 1, 2 & 3

**Phase 1 — Foundation:** project setup, authentication, layout system, sidebar, dashboard shell.
**Phase 2 — Task Management:** daily/weekly/monthly tasks, quick tasks.
**Phase 3 — Habit Tracking:** habit creation, daily/weekly logging, weekly tracker, streaks, completion rate.

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
- `003_phase3_habits.sql` — `habits` and `habit_logs` tables, RLS

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

**Phase 3** (revised)
- **Habits**: daily or weekly frequency
- **Monthly tracker grid**: one unified table per month — habits as rows, every day of the selected month as a column, tap a cell to toggle that day's completion. Month tabs (Jan–Dec) switch the grid.
- **Yearly overview**: a separate tab showing a yearly average score plus a card per month (completion % progress bar + qualitative label: Good / Decent / Needs work / Not started)
- **Streaks**: computed on the fly from logs (never stored) — consecutive days for daily habits, consecutive weeks for weekly habits. Not currently surfaced in the grid UI (only used internally); easy to add as a tooltip/badge later if wanted.
- Full CRUD, scoped per-user via RLS (habit_logs ownership is checked through the parent habit, since the table has no user_id of its own)

## What's intentionally not here

Per the roadmap, only Phases 1–3 are built. No recurring task, journal,
moodboard, or analytics code exists yet — those are Phases 4–8. The sidebar
links to them are present but disabled so the full product shape is visible
without pretending those modules already work. Quick Task → full Task
conversion was explicitly scoped out of Phase 2. Habit frequency is
intentionally daily/weekly only — no custom weekday patterns or "X times
per week" — per the roadmap's actual feature list; that flexibility, if
wanted, belongs to Phase 4's Recurring Tasks instead.

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
| GET | `/api/habits?year=YYYY&month=M` | Both optional, default to current year/month. Returns each habit with that month's `logs`, plus `currentStreak` and `completionRate` (always "as of today," independent of which month is being viewed) |
| POST | `/api/habits` | body: `{ title, frequency }` — frequency: `daily \| weekly` |
| PATCH | `/api/habits/:id` | body: any subset of `{ title, frequency }` |
| DELETE | `/api/habits/:id` | |
| PUT | `/api/habits/:id/logs` | body: `{ date, completed }` — upserts a log entry for that date |
| GET | `/api/habits/yearly-overview?year=YYYY` | `year` optional, defaults to current year. Returns `{ year, yearlyAverage, months: [{ month, completionRate, hasStarted }] }` — an aggregate (all habits combined) completion % per month |

## Notes for the next phase

- Auth state lives in `frontend/src/features/auth/context/AuthContext.tsx` —
  Phase 4+ features should consume `useAuth()` rather than re-deriving session state.
- The backend's `requireAuth` middleware (`backend/src/middlewares/auth.middleware.ts`)
  should gate every future protected route the same way existing feature routes are gated.
- `frontend/src/shared/layouts/navConfig.ts` is the single place to flip a module
  from "Soon" to active once its phase ships — flip `journal` next (Phase 4 is
  Recurring Tasks, which extends `tasks` rather than adding a new sidebar entry).
- `ValidationError` now lives in `backend/src/validators/ValidationError.ts` —
  import it from there, not from `task.validator.ts`, for any new validator.
- `getParam()` in `backend/src/utils/request.ts` should be reused for any
  new route with an `:id` param.
- `frontend/src/shared/utils/date.ts` has the week/date helpers used by the
  habit tracker — reuse `currentWeekDates`/`toDateString` rather than
  reimplementing date math for Recurring Tasks' scheduling logic.
