# Product

## Register

product

## Users

A single athlete: Zac, 40, with inattentive ADHD, mid-way through a multi-year
ultramarathon project (building toward a 100-miler). He checks this on his phone,
daily, often first thing or late — and most critically on low-motivation days when
life is heavy and the failure mode is loss of momentum, not lack of ability.

## Product Purpose

Make quitting harder and the next run easier. It auto-imports activity from Strava
(the source of truth — runs are never logged by hand), measures it against the
training plan, and proves the aerobic work is working. Success is not "lots of
features used"; success is the athlete going for the next run when he didn't feel
like it.

## Brand Personality

A performance instrument, not a wellness companion. Three words: relentless,
precise, honest. The voice is a direct coach — short, specific, no cheerleading and
no guilt. It speaks up only when momentum is at risk and otherwise stays out of the
way. It reads like mission telemetry for one serious athlete.

## Anti-references

- Wellness-app pastel (Calm / Headspace / generic fitness): soft gradients, rounded
  blobs, mint-and-lavender, motivational fluff. Explicitly not this.
- Generic dark SaaS: interchangeable dark-gray dashboard, blue accent, identical
  cards repeated down the page.
- Chart clutter: dense gridlines and competing numbers. Every screen must be
  readable at a glance, on a phone, in two seconds.
- Cutesy / gamified: badges, confetti, mascots, streak-flames.

## Design Principles

1. **The next run is the only CTA that matters.** When momentum is at risk, the
   loudest thing on the screen lowers the barrier to one mile. When it's fine, the
   app is quiet.
2. **Data is the hero.** Numbers are oversized, high-contrast, and glanceable.
   Chrome recedes; the metric is the interface.
3. **Track the plan, not just motion.** The signal is "did I do what this week
   called for," surfaced plainly.
4. **Instrument-grade honesty.** Show the real number, name the caveat (e.g. Zone 2
   from average HR), never fake precision or nag with fluff.
5. **Earned familiarity.** Standard, trustworthy patterns executed with craft; the
   tool disappears into the task.

## Accessibility & Inclusion

- Dark theme, high contrast: body text ≥4.5:1, large/label text ≥3:1 against its
  surface.
- Color is never the only signal (Zone 2 status carries a label/shape, not just a
  colored dot).
- Mobile-first: comfortable tap targets (≥44px), thumb-reachable primary actions.
- Respect `prefers-reduced-motion`: every transition has a reduced/instant fallback.
