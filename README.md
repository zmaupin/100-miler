# 100 Mile Project — Training Dashboard

Personal, single-user training dashboard for a multi-year ultramarathon project.
Auto-imports activities from Strava, tracks progress against the plan, and — first
and foremost — makes quitting harder and the next run easier.

Stack: React (Vite) · Tailwind · Recharts · Netlify Functions · Strava OAuth ·
localStorage. See `docs/spec-review.md` for the design review behind the current spec.

## Scripts

```bash
npm install
npm run dev      # vite only — NO serverless functions (OAuth won't work here)
npm test         # vitest (pure utils + sync logic)
npm run build    # production build to dist/
netlify dev      # app + functions together at http://localhost:8888  ← use this for OAuth
```

## Strava API app

Create one at <https://www.strava.com/settings/api>. You need its **Client ID** and
**Client Secret**. The only field with rules is **Authorization Callback Domain** —
a bare domain, no scheme/path/port:

- Local dev: `localhost`
- Production: your Netlify domain, e.g. `zac-100-miler.netlify.app`

Strava allows one callback domain per app; the clean pattern for dev + prod is two
apps. OAuth scope used: `activity:read_all`.

## Environment variables

All **server-side only** (the Client Secret never reaches the browser):

| Variable                    | Where                        | Value                                            |
| --------------------------- | ---------------------------- | ------------------------------------------------ |
| `STRAVA_CLIENT_ID`          | `.env` (local) / Netlify env | `254626`                                         |
| `STRAVA_CLIENT_SECRET`      | `.env` (local) / Netlify env | from the Strava app page                         |
| `STRAVA_ALLOWED_ATHLETE_ID` | Netlify env (optional)       | your Strava athlete ID; locks connect to you only |

The OAuth redirect URI is derived from `window.location.origin` at runtime
(`<origin>/auth/callback`), so the same build works on localhost and in production —
nothing to configure beyond the callback domain registered with Strava.

## Local development

```bash
cp .env.example .env          # fill in STRAVA_CLIENT_SECRET
npm install
netlify dev                   # http://localhost:8888
```

`netlify dev` serves the Vite app and the `/api/strava/*` functions on one origin and
injects `.env` into the functions. (Plain `npm run dev` skips the functions, so the
"Connect Strava" round-trip won't complete.)

## Deploy to Netlify

1. **New site from Git** → pick this repo. Build settings are auto-detected from
   `netlify.toml` (`npm run build` → `dist`, functions in `netlify/functions`).
2. **Site configuration → Environment variables** → add `STRAVA_CLIENT_ID` and
   `STRAVA_CLIENT_SECRET`.
3. Deploy. Optionally rename the site (**Site configuration → Change site name**) to
   control the `*.netlify.app` subdomain.
4. Update the Strava app's **Authorization Callback Domain** to that domain.
5. Open the site → **Connect Strava** → approve → activities sync.

`netlify.toml` already maps `/api/strava/*` to the functions and adds the SPA
fallback, so client routes like `/auth/callback` and `/progress` resolve on reload.
