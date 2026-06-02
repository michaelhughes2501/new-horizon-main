# Security Policy

## Reporting

Use a private security advisory in this repo. Do not file public issues for security problems.

## Mobile-specific notes

- Secrets go through `expo-secure-store` (not AsyncStorage).
- Only `EXPO_PUBLIC_*` env vars reach the client bundle.
- Supabase Row-Level Security is **required** for any user data; the anon key is public by design and cannot be trusted to enforce access on its own.
- The Supabase **service_role** key must never be embedded in the app bundle, repo, CI logs, or shared in screenshots — it bypasses RLS. Keep it server-side only and rotate it immediately if it leaks.
- Rotate the anon key if it leaks in a context where you cannot tighten RLS — e.g. it was used to access an unprotected table.
