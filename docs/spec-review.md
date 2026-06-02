# 100 Mile Project Dashboard — Spec Review (PRD v2)

> Staff-engineer + PM review of the v2 PRD, written to feed back into planning.
> Date: 2026-06-02

## Verdict

This is a strong, unusually disciplined PRD. It knows what it is, it edits ruthlessly
(two screens, five charts), and the core insight — that the product's job is fighting
the quit, not tracking data — is genuinely good product thinking. Most fitness-app
specs are a pile of features; this one has a thesis.

It's buildable close to as-written. But there are a handful of things that will bite,
and one of them is conceptual rather than a bug. Details below.

---

## What's right — keep it, don't touch it

- **Two-screen / five-chart discipline.** The hardest thing to get right, and the spec
  nails it. Resisting the seventh chart is worth more than adding it.
- **Quit-fighter as conditional, silent-when-fine.** Psychologically correct. Nagging
  when things are good trains the user to ignore the app. Loud only when slipping, and
  the loud version lowers the barrier instead of guilt-tripping.
- **Serverless for the OAuth secret.** Correct — `STRAVA_CLIENT_SECRET` can't live in the
  frontend, so the three functions are the right shape. No DB is the right call for one user.
- **Open-Meteo.** Right choice. No key, reliable, free. Don't second-guess it.
- **Honesty about Zone 2 from `average_heartrate`.** Good that the spec already flags the
  limitation. (More on the cost of it below.)

---

## What'll bite you — ordered by how much it matters

### 1. The MVD daily streak fights the spec's own design principle (the big one)

Conceptual, not a bug. There are two streaks. The **week-streak** (plan adherence, rest
days don't break it) is excellent and should be the primary metric. But the **MVD streak
— "consecutive days with any activity" — is structurally incoherent with a plan that
prescribes rest.**

The plan has a Sunday rest day and Mon/Wed/Fri strength days. Strength isn't an imported
type (`Run, TrailRun, Hike, Walk`), so it generates no activity the app can see. Following
the plan perfectly therefore **resets the MVD streak every few days by design** — it'll
mostly read 1–3. So "{streakDays} day streak on the line" brags about a number that's
small *because you're doing it right*.

The only way to keep it alive daily is to log a walk every day — and that turns it into a
"did I move today" metric, which **principle #4 explicitly rejects** ("the signal is did I
do what this week called for, not did I move today").

**Recommendation:** Drop the MVD *streak* as a displayed metric. Have the quit-fighter say
**"You haven't run since {day} — {N} days"** and **"{weekStreak} weeks on plan on the
line."** Honest, scary in the right way, and it doesn't require degrading "activity" into
"any movement." Keep "days since last run" as the quit-fighter trigger.

### 2. Wrong date field — `start_date` instead of `start_date_local`

The field list uses `start_date` (UTC). Every day-of-week and "today" decision — "did I
log anything today," "Saturday long run," week bucketing — must use **`start_date_local`**,
or a 6 AM Saturday run can read as Friday or Sunday depending on the UTC offset, and long-run
detection and streaks silently misfire. One-word fix now, maddening bug later. Add
`start_date_local` to the imported fields and use it for all calendar logic.

### 3. The phases have gaps, and the races live in the gaps

```
Phase 1 ends 2026-09-06   →  gap  →  Phase 2 starts 2026-09-14
Phase 2 ends 2026-11-13   →  gap  →  Phase 3 starts 2026-11-15
```

- Chewacla 5K is **2026-09-13** → inside gap 1.
- Cathedral 15K is **2026-11-14** → inside gap 2.

So `getPhase(date)` returns **undefined on the race days/weeks** — the most important days.
Define behavior for gap dates (taper / race-week is the natural answer). Not an edge case;
guaranteed to hit on the three days you most want the app working.

### 4. Defining "long run" as "Saturday, >60 min" contradicts the whole app

The thesis is that life gets heavy and the plan must bend (ADHD, momentum, "the streak
respects the plan"). Then `isLongRun` hardcodes Saturday. Real long runs move to Sunday
constantly. When they do, `isLongRun` returns false → the week-streak misclassifies it →
the long-run chart drops the point → the app punishes the exact flexibility it claims to
support.

**Recommendation:** Define the long run by *what it is, not what day it's on* — the longest
qualifying run of the week (or any run past a duration/distance threshold for the phase).
Day-of-week is the wrong primary key.

### 5. The sync anxiety is pointed at the wrong risk

The spec treats rate limits as "the part that breaks if rushed." For **one athlete** that
fear is overblown — even a full re-fetch is 1–2 requests (200 activities/page), nowhere
near 100/15min unless a bug loops. Incremental sync is still worth building for *speed*,
but the framing hides the real risks:

- **Cursor correctness.** `after` filters on activity **start** time. Upload a backdated or
  late run (you will) while the cursor is "now," and that activity is skipped *forever*.
  Fix: **dedupe by activity `id` on every merge** (non-negotiable), and set the cursor from
  the **max `start_date` of synced activities minus a small buffer**, not wall-clock now.
- **Refresh single-flight.** App-load sync + manual sync can fire together, both see an
  expired token, both call `/refresh`. Strava returns a (rotating) refresh token; concurrent
  refreshes can invalidate each other. Wrap refresh in a single-flight guard so the second
  caller awaits the first.

Get those two right and rate limits never come up.

### 6. The hero chart is built on the weakest data

Aerobic efficiency (pace at Zone 2 HR) is the headline of the Progress screen and runs
entirely on `average_heartrate` — one number for the whole activity. A run that's 30 min
easy + hill repeats can *average* into Zone 2 while not being a Zone 2 run. So the chart
you're selling hardest will be the noisiest, and it'll look underwhelming for weeks. The
"~4 weeks" empty state helps; set the expectation in the label, and consider filtering to
runs whose avg HR *and* a pace-steadiness proxy both look clean. Going in, know that **the
marquee feature sits on the thinnest data.**

---

## Smaller stuff worth deciding up front (cheap now, annoying later)

- **Week start is undefined.** Monday or Sunday? Everything weekly depends on it. Given
  Tue/Thu + Sat, **Monday-start** keeps the week's runs together. Pin it.
- **Partial current week in the streak.** You can't "break" a week that isn't over. Count
  completed weeks for the streak; show the current week as in-progress, not failed —
  otherwise the app nags mid-week.
- **Mixed units in the plan.** Phase 1 prescribes long runs in **minutes**, Phases 2–3 in
  **miles**, LEVELS in minutes — but the Long Run Progression chart is a **distance** axis
  with race-distance reference lines. Decide how minutes-based long runs render on a
  distance chart (estimate distance from time, or switch the axis by phase).
- **Dual-axis charts on a 375px phone.** "Excellent on a phone" and Recharts dual-Y are in
  tension — they get cramped. Consider two stacked single-axis charts for cumulative
  miles/elevation and weekly volume.
- **End-of-plan state.** Plan data stops 2027-04-23; `FUTURE_LADDER` has no dates. Make sure
  "next race" / phase logic degrades gracefully after the HM instead of going blank.
- **Trim activities on ingest.** Store only the ~13 listed fields, not raw Strava objects,
  so localStorage stays small over a multi-year cache.
- **Strength is invisible by design.** The plan prescribes Mon/Wed/Fri strength, but it's not
  an imported type and Strava-as-truth means it's never credited. Fine — but "the plan" and
  "what the app tracks" aren't the same thing. Be explicit so you don't expect credit for
  lifting.
- **Tokens in localStorage** = XSS → token theft. For a single-user personal app the threat
  model is tiny and I wouldn't change it — just naming it so it's a decision, not an accident.
- **No tests in the build order.** The pure utils (zone calc, streak logic, plan-awareness,
  conversions) have real edge cases — week boundaries, phase gaps, unit conversions — and the
  streak logic is the heart of the app. Unit-test at least those.

---

## Three calls needed before writing code

These change what gets built, so they shouldn't be guessed:

1. **MVD streak** — kill it as a displayed metric and switch the quit-fighter to "days since
   last run" + weeks-on-plan? *(Strong rec: yes.)*
2. **Long run** — define by longest-run-of-week / threshold instead of Saturday? *(Rec: yes.)*
3. **Week start** — Monday? *(Rec: yes.)*

Everything else above can fold into the build with sensible defaults, called out as it goes.
