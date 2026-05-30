# 100 Mile Project — Build Plan

A personal training dashboard that pulls runs/hikes from **Strava** and scores them
against the heart-rate-governed training plan: Zone 2 compliance, current training
level, MVD ("didn't quit") streak, and the 7-race ladder from Trail 5K → 100 Miler.

> Status: **planning**. No app code yet. This document is the source of truth for the build.

---

## 1. Decisions locked

| Decision | Choice |
|---|---|
| Level progression & MVD streak | **Auto-derived from Strava activity data** (not manual checkboxes) |
| Database | **None** — Strava is the source of truth; preferences/cache in `localStorage` |
| Hosting / cost | **Netlify free tier**, deploy-on-push from GitHub |

---

## 2. Stack (from the PDF spec)

- **Frontend:** React + Vite, Tailwind CSS
- **Theme:** dark — background `#0d0f0e`, accent `#c8f55a`
- **Backend:** Netlify Functions (serverless) — OAuth token exchange + Strava API proxy
- **Auth:** Strava OAuth 2.0; access/refresh tokens in `localStorage`, silent auto-refresh
- **Charts:** lightweight lib (e.g. Recharts) for the weekly mileage bars

**Why serverless at all:** the Strava **Client Secret** must never ship in browser code.
The three functions exist purely to keep the secret server-side. Everything else is a
static SPA.

---

## 3. Architecture

```
Browser (React SPA + localStorage)
   │  "Connect Strava" → OAuth authorize redirect
   ▼
Strava ──► /api/strava/callback     code → { access_token, refresh_token, expires_at }
   │
   ├─────► /api/strava/refresh       expired token → fresh token
   └─────► /api/strava/activities    proxy: activity list + per-activity HR streams
```

**localStorage holds:** tokens, user's Zone 2 max HR, race-ladder checks, training notes,
cached normalized activities, and any manual overrides.

**Netlify Functions:**
- `callback` — exchange auth `code` for tokens (uses Client ID + Secret)
- `refresh` — exchange refresh token for a new access token
- `activities` — authenticated proxy to `GET /athlete/activities` and `GET /activities/{id}` (HR streams)

**Env vars (Netlify dashboard):** `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_REDIRECT_URI`.
Credentials from strava.com/settings/api.

---

## 4. Internal Activity model

Normalize every Strava activity into a stable shape the UI depends on:

```ts
Activity {
  id, name, type,            // Run | TrailRun | Hike | Walk
  startDate,                 // ISO, local-day derived for streaks
  distanceMi,                // meters → miles
  movingTimeMin,
  avgHeartrate,              // nullable
  maxHeartrate,
  elevationGainFt,
  inZone2: boolean,          // avgHeartrate <= zone2Max (see §5)
}
```

---

## 5. Auto-detection logic (the core design)

Most of the PDF's exit criteria are **subjective** ("legs recovered", "no joint pain",
"habit is locked") and cannot be read from Strava. So "auto" means: **infer level and
streak from demonstrated capability**, and surface the subjective criteria as
informational notes the user can acknowledge.

### 5.1 Zone 2 compliance
- User sets **`zone2Max`** HR once (settings).
- An activity is **Zone 2 compliant** when `avgHeartrate <= zone2Max`.
- Activities with no HR data are marked "no HR" (neither pass nor fail).
- Dashboard shows a compliance rate over a trailing window (e.g. last 30 days).

### 5.2 Current level (derived, not checkbox)
Each level defines duration/effort targets:

| Level | TUE/THU | Saturday long |
|---|---|---|
| 1 Reset | 30 min | 45–60 min |
| 2 Extension | 35–40 min | 60–75 min |
| 3 Building | 40–45 min continuous | 75–90 min |
| 4 Exit Benchmark | 45–50 min continuous | 90–120 min (benchmark: 3 mi continuous Zone 2, flat) |

**Inference rule:** over a trailing window (default 2–3 weeks), compute the athlete's
**demonstrated level** = the highest level whose *weekday duration* AND *Saturday long
duration* targets were met **in Zone 2**, sustained across ≥2 qualifying weeks. Partial
progress (met weekday but not long, or met once not twice) shows as "Level N → working
toward N+1". Thresholds live in a single `levels.ts` config so they're tunable.

> The three subjective exit-criteria checkboxes still render per level as a manual
> acknowledgement layer, but they do **not** gate the auto-derived level number.

### 5.3 MVD streak
- **MVD = ≥ 1.0 mi on a calendar day** (any pace, any format = "you didn't quit").
- Streak = consecutive days up to today each containing a qualifying activity.
- **Open design question (default chosen):** the plan schedules Sunday REST, which would
  break a strict daily streak. Default = a day with **0 activity counts as a miss**
  (true "didn't quit" streak), with a settings toggle for "rest days don't break the
  streak." Flagged for your call during build.
- Timezone: bucket by the activity's local start date.

### 5.4 Dashboard tiles
Total miles (all-time + trailing), runs logged, current derived level, MVD streak,
Zone 2 compliance rate.

---

## 6. Features → build phases (each phase is shippable)

**Phase 0 — Scaffold & deploy pipeline**
- Vite + React + Tailwind; theme tokens (`#0d0f0e` / `#c8f55a`)
- `netlify.toml`, `/netlify/functions`, `.env.example`
- Deploy the empty shell to Netlify first so the redirect URI exists before OAuth wiring

**Phase 1 — Auth spine**
- Connect Strava button → authorize redirect
- `callback` + `refresh` functions; token store + silent-refresh fetch wrapper

**Phase 2 — Activity ingestion**
- `activities` proxy; normalize to Activity model; local cache
- Activity feed UI, sorted by date

**Phase 3 — Training intelligence**
- Zone 2 compliance flagging (`zone2Max` setting)
- Derived level system (§5.2) + subjective acknowledgement checkboxes
- Dashboard tiles incl. derived MVD streak (§5.3)

**Phase 4 — Motivation layer**
- Race ladder: 7 races (5K, 10K, Half, Marathon, 50K, 100K, 100 Miler), checkable
- Weekly mileage bar chart, last 8 weeks
- Training notes (free text, persisted)

---

## 7. Prerequisites you'll need to provide (no code blocked, but deploy is)

1. **Strava API app** at strava.com/settings/api → Client ID + Client Secret.
2. **Netlify site** linked to this GitHub repo (for the live redirect URI).
3. Decide the **MVD rest-day rule** (§5.3) and your **Zone 2 max HR**.

---

## 8. Open questions parked for build time
- Rest-day streak behavior (§5.3 default = strict).
- Trailing-window length for level inference (default 2–3 weeks).
- Whether "flat trail / continuous" benchmark for Level 4 can be approximated from
  elevation + pace variance, or left as a manual acknowledgement.
