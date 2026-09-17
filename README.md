# Restaurant Journal

Mobile-first web app that helps travelers with multiple food allergies
(including MCAS / histamine sensitivity) find restaurants they can trust — and
get fed fast when blood sugar is crashing.

The frontend is wired to a **Supabase** backend: Postgres tables + Row Level
Security + email/password auth. Every component still imports only from the
`src/data` service layer, so swapping data sources again means touching only
those files.

## Stack

- Vite + React + TypeScript
- React Router (`react-router-dom`)
- Tailwind CSS
- `lucide-react` icons
- Zustand for shared state (`src/store/`) — `authStore` + `appStore`
- `@supabase/supabase-js` (pinned)

## Running it

```bash
npm install
npm run dev
```

`npm run dev` binds to `0.0.0.0`, so it prints both a **Local**
(`http://localhost:5173`) and a **Network** URL — open the Network URL on a
phone on the same Wi-Fi to test on device. (Windows may prompt to allow Node
through the firewall the first time.)

Other scripts:

```bash
npm run build      # tsc -b && vite build
npm run lint       # tsc -b --noEmit (type-check only)
```

> **Note on this machine:** `node` / `npm` are installed at
> `C:\Program Files\nodejs` but not on the shell `PATH`. Prepend it first:
> `$env:PATH = "C:\Program Files\nodejs;" + $env:PATH` (PowerShell).

## Environment

`.env` (git-ignored — see `.env.example`):

```
VITE_SUPABASE_URL=https://ctibgmitirxxftnvzvot.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # publishable key, safe in the browser
```

`src/lib/supabase.ts` creates the shared typed client. Sessions persist to
`localStorage` and auto-refresh.

## Auth

- Email + password via Supabase Auth (`src/store/authStore.ts`,
  `src/pages/AuthPage.tsx`). Email confirmation is **off** on the project, so
  sign-up logs you straight in; the UI still handles the "confirm your email"
  state if that setting is turned on later.
- `<App>` gates every route: unauthenticated users only see `/auth`.
- The `handle_new_user` trigger creates a blank `profiles` row on signup;
  new users are routed to `/onboarding`.
- Sign out lives on the Profile screen.

## Routes

| Route              | Screen                                                        |
| ------------------ | ------------------------------------------------------------- |
| `/auth`            | Sign in / create account (shown when signed out)             |
| `/onboarding`      | Build a trigger profile (allergens + severity + MCAS presets)|
| `/`                | Home — matched nearby restaurants, confidence + filters      |
| `/restaurants/:id` | Detail — allergen match breakdown, structured reviews, actions|
| `/emergency`       | Emergency Mode — high-contrast, nearest safe food + snacks   |
| `/trips`           | Trip Planner — pick a destination, build a saved shortlist   |
| `/allergy-card`    | Auto-generated allergy card + language placeholder           |
| `/profile`         | View / edit the trigger profile · sign out                   |

## Database (`supabase/`)

`migrations/` holds the two migrations applied to the project; `seed.sql` holds
the shared reference data (10 restaurants across Lisbon / Copenhagen / Kyoto,
20 structured reviews, 5 destinations). Per-user rows are never seeded.

| Table          | Notes                                                            |
| -------------- | --------------------------------------------------------------- |
| `restaurants`  | shared; readable by any signed-in user                          |
| `reviews`      | shared read; insert must set `user_id = auth.uid()`             |
| `destinations` | shared; trip-planner pick list                                  |
| `profiles`     | `id = auth.users.id`; RLS scopes every op to the owner          |
| `trips`        | `user_id` owned; RLS scopes every op to the owner               |

RLS is on for all tables. `snake_case` columns; the review checklist, MCAS
presets and profile triggers are `jsonb` blobs whose keys already match the app
models (`src/data/_mappers.ts` is a thin pass-through).

## Data layer (`src/data/`)

Components import only from `src/data` (the barrel in `index.ts`).

- `types.ts` — domain interfaces (`UserProfile`, `Restaurant`, `Review` with a
  structured `AccommodationChecklist`, `Trip`, `AllergyCard`, …).
- `database.types.ts` — generated Supabase row types (regenerate after schema
  changes).
- `allergens.ts` — trigger catalogue, severity ordering, MCAS preset meta.
- `matching.ts` — pure `matchRestaurant(restaurant, profile)` → per-allergen
  `safe | caution | unknown`, a 0–100 score, and a verdict.
- `_mappers.ts` — row ⇄ domain-model conversion.
- `restaurantService.ts` / `profileService.ts` / `tripService.ts` /
  `allergyCardService.ts` — all async; every call goes through the Supabase
  client. `profileService` / `tripService` are scoped to the signed-in user.
- `mock/languages.ts` — allergy-card language list (still client-side).

## Reusable components (`src/components/`)

`ConfidenceBadge`, `SeverityPill`, `VerdictBadge`, `AllergenChip` (display +
filter-chip modes), `FilterChips`, `RestaurantCard`, `ReviewCard`,
`AllergenMatchBreakdown`, `TriggerEditor` (shared by onboarding + profile),
`Toggle`, `SeveritySelect`, `AppShell` / `BottomNav`, `ToastViewport`.

## Security posture

RLS + ownership policies are in place. The one thing to tighten before real
use: Supabase project **Auth settings** (password strength, rate limiting) and
turning email confirmation back on for production.
