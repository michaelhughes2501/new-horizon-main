# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**new-horizon** is an **Expo / React Native** mobile app, with a web target via `expo start --web`. Backend services are provided by **Supabase** (`@supabase/supabase-js`). Push notifications use `expo-notifications`; secure key storage uses `expo-secure-store`.

The app lives under [`NewHorizon/`](./NewHorizon). **Open the repository root in VS Code** so the workspace settings, extension recommendations, and launch configs (which point into `NewHorizon/`) are loaded.

## Tech stack

The authoritative versions live in `NewHorizon/package.json` — check there if anything below drifts. At the time of writing the pins were:

- Expo SDK (`expo: ~54.0.33`) + React Native (`react-native: 0.81.5`)
- React 19 + TypeScript ~5.9
- React Navigation (bottom tabs)
- Supabase JS client (`@supabase/supabase-js`)
- `expo-notifications`, `expo-secure-store`, `expo-device`, `expo-constants`

## Commands (run inside `NewHorizon/`)
Guidance for Claude Code (and other agentic coders) when working in this repo.

## What this is

The **New Horizon** mobile companion: an Expo (React Native) project that
talks to the same Supabase backend as the `newhorizonweb` web app. The
current `NewHorizon/App.tsx` is the unmodified Expo template — most
feature work still lives in the web repo. Treat this tree as a clean
starting point for the mobile build-out.

## Stack

- Expo SDK 54 (`expo`), React Native 0.81, React 19
- TypeScript (strict mode, `extends "expo/tsconfig.base"`)
- Navigation: `@react-navigation/native` + `@react-navigation/bottom-tabs`
  (installed; not yet wired up)
- Supabase JS client + `expo-secure-store` for token storage
- Push: `expo-notifications` + `expo-device`
- New Architecture (`newArchEnabled: true`) and edge-to-edge enabled on
  Android

## Commands

```bash
cd NewHorizon
npm install
npm start          # expo start — dev menu w/ QR code
npm run android    # build & run Android
npm run ios        # build & run iOS (macOS only)
npm run web        # run in browser via Metro web
```

## Environment

Create `NewHorizon/.env` (or use `app.config` extras) with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Only `EXPO_PUBLIC_*` vars are exposed to the JS bundle. The Supabase **service_role** key must never be referenced anywhere in the client — it bypasses Row-Level Security and belongs only on a trusted server.

## Repo layout

- `NewHorizon/App.tsx` — root component.
- `NewHorizon/index.ts` — Expo entry.
- `NewHorizon/assets/` — icons & images.
- `NewHorizon/app.json` — Expo config.

## Conventions

- Use `expo-secure-store` for tokens; never `AsyncStorage` for secrets.
- Use Supabase RLS policies; never trust client-side filters.
- Keep images optimized (`assets/`) and use **`expo-image`** for high-performance loading and caching (compatible with the New Architecture).

## VS Code

Open the repo root, install recommended extensions, then run `npm start` from the integrated terminal.
npm start          # expo start (Metro + dev menu)
npm run android    # expo run:android — requires Android SDK
npm run ios        # expo run:ios — requires Xcode (macOS)
npm run web        # expo start --web — fastest way to smoke-test changes
```

There is no lint script. `tsc` runs through Expo's bundler; treat the
strict-mode flag in `tsconfig.json` as the typecheck baseline.

## Where things live

- `NewHorizon/index.ts` — `registerRootComponent(App)` entry.
- `NewHorizon/App.tsx` — root component. Currently the default Expo
  scaffold; replace it with the navigator when feature work begins.
- `NewHorizon/app.json` — Expo config (icons, splash, `expo-secure-store`
  plugin, Android package `com.anonymous.NewHorizon`).
- `NewHorizon/assets/` — icon, splash, adaptive icon, favicon.
- `NewHorizon/package.json` — pinned to the SDK 54 dependency matrix;
  prefer `npx expo install <pkg>` over plain `npm install <pkg>` so new
  deps match the SDK.

## Conventions to follow

- Use `expo-secure-store` (not `AsyncStorage`) for the Supabase session
  token; mirror the web app's `AuthService` shape when you port it over.
- Hit the same Supabase project as `newhorizonweb`. Service identifiers
  (table names, RPCs like `increment_post_likes`) must match the schema
  in `newhorizonweb/new-horizon-web/supabase/database-schema.sql`.
- The Supabase JS client needs `react-native-url-polyfill/auto`
  imported once at app startup — the package is already in
  `dependencies`; import it at the **top of `index.ts`** (the
  `registerRootComponent` entry point) so the polyfill is installed
  before `App` and its transitive modules are evaluated.
- Keep navigation declarative under `@react-navigation/native`; don't
  introduce a second navigation library.
- Run `npm run web` before opening a native simulator — it's the fastest
  feedback loop and catches the same JS bugs.
