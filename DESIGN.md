# Design

Visual system for the 100 Mile Project dashboard. Register: **product**. Aesthetic:
**performance HUD** — near-black instrument panel, oversized bold metrics, a single
orange signal color, scannable at a glance. Tokens here are implemented as CSS custom
properties in `src/index.css` and exposed to Tailwind in `tailwind.config.js`.

## Theme

Dark only. The athlete checks this on a phone, often at night or first thing; a dark
instrument panel suits the context and makes the orange signal pop. Not dark "because
tools look cool" — dark because the data is the light source.

## Color (OKLCH)

Strategy: **Restrained** — neutral near-black surfaces, one saturated accent (Strava
orange) reserved for the primary action, current state, and live data. Semantics carry
status; they are never decorative.

| Token | OKLCH | ~Hex | Use |
|---|---|---|---|
| `--bg` | `oklch(0.145 0.004 264)` | `#09090b` | App background |
| `--surface` | `oklch(0.196 0.005 264)` | `#161619` | Panels |
| `--surface-2` | `oklch(0.238 0.006 264)` | `#1f1f23` | Raised / inputs |
| `--line` | `oklch(0.305 0.006 264)` | `#2c2c31` | Borders, dividers |
| `--ink` | `oklch(0.985 0 0)` | `#fafafa` | Primary text, hero numbers |
| `--muted` | `oklch(0.760 0.012 264)` | `#aeb0b6` | Secondary text (≥4.5:1 on bg) |
| `--faint` | `oklch(0.620 0.013 264)` | `#86878f` | Labels, units (large/label only) |
| `--accent` | `oklch(0.696 0.196 41)` | `#fc5200` | Strava orange: primary action, live data |
| `--accent-weak` | `oklch(0.30 0.09 41)` | — | Accent tint backgrounds/borders |
| `--good` | `oklch(0.78 0.16 152)` | `#34d27b` | Zone 2 in-zone |
| `--warn` | `oklch(0.84 0.15 90)` | `#f0c000` | Zone 2 under (too easy) |
| `--bad` | `oklch(0.64 0.21 25)` | `#f0443e` | Zone 2 over (too hard) |

Contrast: `--ink`, `--muted` clear 4.5:1 on `--bg`/`--surface`. `--faint` is for
labels and units only (≥3:1), never body prose. Button text on `--accent` is bold
near-white (large/bold, ≥3:1).

## Typography

Two families (cap is 3): **Inter Variable** for UI/body and all numbers; **JetBrains
Mono Variable** for instrument labels, units, and tiny telemetry. Self-hosted via
`@fontsource-variable/*` (no external requests).

- **Hero metrics**: Inter, weight 800, `font-variant-numeric: tabular-nums`, tracking
  `-0.03em`. This is the signature — big, dense, aligned.
- **Headings**: Inter 600–700, tracking `-0.01em`.
- **Body / UI**: Inter 400–500.
- **Labels / units**: JetBrains Mono, 500, uppercase, tracking `0.08em`, `--faint`.
- Scale (fixed rem, product ratio ~1.2): xs .75 · sm .875 · base 1 · lg 1.125 ·
  xl 1.25 · 2xl 1.5 · 3xl 1.875 · stat 2.75 · hero 3.5rem. Tabular-nums on anything
  that updates.

## Layout

- Mobile-first single column, `max-width: 28rem`, centered.
- App shell: sticky top bar (title + live sync dot) and a fixed bottom tab bar
  (Dashboard / Progress) — thumb-reachable, the HUD navigation pattern.
- Rhythm over uniformity: sections are differentiated by treatment and weight, not a
  single repeated card. No identical card grids. Dividers and spacing carry structure;
  borders are hairline (`--line`).
- Content bottom-padded to clear the fixed tab bar.

## Components

- **Panel**: hairline border, `--surface`, generous padding, rounded `0.875rem`. Used
  sparingly; not every block is a panel.
- **Metric**: oversized tabular number + small mono unit + mono label. The core unit.
- **Quit-Fighter**: the one loud element — accent border + tint, subtle one-time
  entrance and a slow attention pulse (reduced-motion: static). Only when triggered.
- **Zone 2 status**: colored dot **plus** text (`in` / `easy` / `over` / `—`), so
  status never relies on color alone.
- **Progress bar**: 6px track (`--surface-2`), accent fill, rounded.
- **Tab bar**: two items, icon + label, active = accent + filled icon.
- States: every interactive element has hover/active/focus-visible and disabled.

## Motion

- 150–220ms, ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`). Conveys state, never
  decorative; no page-load choreography.
- Quit-Fighter entrance + slow pulse is the one expressive moment.
- `@media (prefers-reduced-motion: reduce)`: transitions collapse to ~1ms, pulse off.

## Charts (Progress)

Recharts, single-axis, de-cluttered: horizontal gridlines only, hairline `--line`,
mono tick labels in `--faint`, accent series, semantic fills for status charts. No
dense vertical grids, minimal ticks — scannable first, precise on tap (tooltip).
