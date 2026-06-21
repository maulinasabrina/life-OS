# Life OS — Phase 1: Foundation

Project setup, authentication, layout system, sidebar, and dashboard shell.
Deliverable: working login and dashboard.

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

Follow `database/README.md`. This runs the SQL migration (creates `public.users`,
the signup trigger, and RLS policies) and walks through enabling Google OAuth.

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

- **Auth**: email/password + Google OAuth via Supabase Auth, session persistence across refresh
- **Protected routing**: unauthenticated users are redirected to `/login`
- **Layout**: sidebar (all modules listed, only Dashboard active — others marked "Soon") + topbar with user menu/logout
- **Dashboard shell**: authenticated empty state, pulls the user's profile from the backend (`GET /api/users/me`) to confirm the full stack — frontend → backend → Supabase — is wired correctly
- Mobile-first responsive layout (sidebar collapses to a drawer below `md`)

## What's intentionally not here

Per the roadmap, Phase 1 is foundation only. No task, habit, journal, moodboard,
or analytics code exists yet — those are Phases 2–8. The sidebar links to them
are present but disabled so the full product shape is visible without
pretending those modules already work.

## Notes for the next phase

- Auth state lives in `frontend/src/features/auth/context/AuthContext.tsx` —
  Phase 2+ features should consume `useAuth()` rather than re-deriving session state.
- The backend's `requireAuth` middleware (`backend/src/middlewares/auth.middleware.ts`)
  should gate every future protected route the same way `/api/users/me` is gated.
- `frontend/src/shared/layouts/navConfig.ts` is the single place to flip a module
  from "Soon" to active once its phase ships.
