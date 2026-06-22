# Life OS — Phase 1–5

**Phase 1 — Foundation:** project setup, authentication, layout system, sidebar, dashboard shell.
**Phase 2 — Task Management:** daily/weekly/monthly tasks, quick tasks.
**Phase 3 — Habit Tracking:** habit creation, daily/weekly logging, monthly tracker grid, yearly overview.
**Phase 4 — Recurring Tasks:** recurrence engine, auto-generated tasks.
**Phase 5 — Journal:** daily entries, Tiptap rich-text editor, image uploads, full-text search, tags.

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
- `004_phase4_recurring_tasks.sql` — `recurring_tasks` table, `tasks.recurring_task_id` link, RLS
- `005_phase5_journal.sql` — `journal_entries` (with full-text search vector + GIN index, tags array), `journal_images`, Supabase Storage bucket + RLS

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

**Phase 4**
- **Recurring task templates**: title + recurrence (`daily/weekly/monthly` × an interval, e.g. "every 3 days") + start date, pausable without losing the schedule
- **Recurrence engine**: runs on-demand — every time the Tasks page loads, the backend checks all active templates and creates any occurrences that are now due as real rows in `tasks` (backed by a unique index so it can never double-generate the same occurrence)
- Generated tasks are linked back to their template (`recurring_task_id`) and show a small recurring-icon in the task list
- Manage page at `/tasks/recurring`, linked from the Tasks page header (not a separate sidebar entry, since it's an extension of Tasks rather than its own module)

**Phase 5**
- **Journal entries**: title, date, Tiptap WYSIWYG editor (bold, italic, headings H1–H3, bullet/ordered lists, code, blockquote, code block, horizontal rule, undo/redo), comma-separated tags
- **Image uploads**: uploaded to Supabase Storage (`journal-images` bucket, private, path `userId/entryId/filename`), images stored with signed URLs (1-hour TTL). The backend proxies uploads so ownership is verified before the file hits Storage — direct client-to-Storage upload is blocked by RLS
- **Search**: Postgres full-text search (`websearch_to_tsquery`) over title (weight A) + content (weight B) via a generated `tsvector` column and GIN index — no separate search infrastructure needed
- **Tag filtering**: click any tag on a card to filter the list; Postgres `@>` array contains operator used server-side

## What's intentionally not here

Per the roadmap, only Phases 1–4 are built. No journal, moodboard, or
analytics code exists yet — those are Phases 5–8. The sidebar links to them
are present but disabled so the full product shape is visible without
pretending those modules already work. Quick Task → full Task conversion was
explicitly scoped out of Phase 2. Habit frequency is intentionally
daily/weekly only — the "every N days/weeks/months" flexibility you might
expect from habits instead lives in Phase 4's Recurring Tasks. Recurring
task generation is on-demand (triggered by loading the Tasks page) rather
than a true background scheduler — there's no cron/queue infrastructure in
this stack, and a real scheduler can be layered in later without changing
the engine's core date math.

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
| GET | `/api/recurring-tasks` | |
| POST | `/api/recurring-tasks` | body: `{ title, recurrence_type, recurrence_interval, start_date }` — recurrence_type: `daily \| weekly \| monthly` |
| PATCH | `/api/recurring-tasks/:id` | body: any subset of `{ title, recurrence_type, recurrence_interval, start_date, active }` |
| DELETE | `/api/recurring-tasks/:id` | Does not delete already-generated tasks (FK is `ON DELETE SET NULL`) |

Note: `GET /api/tasks` runs the recurrence engine before returning results — it's the on-demand trigger point, so any due occurrences are generated as a side effect of loading the Tasks page.

## Notes for the next phase

- Auth state lives in `frontend/src/features/auth/context/AuthContext.tsx` —
  Phase 5+ features should consume `useAuth()` rather than re-deriving session state.
- The backend's `requireAuth` middleware (`backend/src/middlewares/auth.middleware.ts`)
  should gate every future protected route the same way existing feature routes are gated.
- `frontend/src/shared/layouts/navConfig.ts` is the single place to flip a module
  from "Soon" to active once its phase ships — flip `journal` next (Phase 5).
- `ValidationError` lives in `backend/src/validators/ValidationError.ts` —
  import it from there, not from `task.validator.ts`, for any new validator.
- `getParam()` in `backend/src/utils/request.ts` should be reused for any
  new route with an `:id` param.
- `frontend/src/shared/utils/date.ts` has the week/date/month helpers shared
  across Tasks, Habits, and Recurring Tasks — reuse rather than reimplementing.
- The recurrence engine (`backend/src/services/recurringTask.service.ts`)
  currently runs synchronously inside `GET /api/tasks`. If a real
  scheduler/cron is added later, `runRecurrenceEngine(userId)` can be called
  from a job instead — the function itself doesn't assume it's running
  inside a request.
