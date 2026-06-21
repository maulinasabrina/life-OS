# Database Setup — Phase 1

## 1. Run the migration

In your Supabase project, open the SQL Editor and run:

```
sql/001_phase1_users.sql
```

This creates:
- `public.users` — profile table synced 1:1 with `auth.users`
- A trigger that auto-inserts a `public.users` row on signup (covers both email/password and Google OAuth)
- Row Level Security: users can only read/update their own row

## 2. Enable Google OAuth

This is a dashboard step, not SQL:

1. Supabase Dashboard → **Authentication → Providers → Google**
2. Toggle it on, add your Google OAuth **Client ID** and **Client Secret** (from Google Cloud Console)
3. Add the redirect URL Supabase shows you to your Google OAuth app's **Authorized redirect URIs**

## 3. Email confirmation setting

By default, Supabase requires email confirmation before a session is issued on signup. The frontend's `SignupForm` already handles this case (shows a "check your inbox" message). If you'd rather skip confirmation for faster local testing:

**Authentication → Providers → Email → uncheck "Confirm email"**

## 4. Verify

After running the migration, sign up a test user through the app and confirm a matching row appears in `public.users` (Table Editor → users).
