// Hardcoded plan + athlete context. Single user, so this lives in source, not a DB.
// All dates are "YYYY-MM-DD" local keys. Phases are CONTIGUOUS — each ends the day
// before the next begins — so getPhase() is always defined, including on race days.

export const ATHLETE = {
  name: 'Zac',
  trainingStartDate: '2026-06-01',
  maxHR: 180,
  zone2Min: 108,
  zone2Max: 144,
  weightLbs: 215,
  age: 40,
  homeTrail: { name: 'Chewacla State Park', lat: 32.5505, lon: -85.4808 },
  weekStartsOn: 'monday', // pinned — Tue/Thu + Sat stay in one week block
}

export const PHASES = [
  {
    id: 1,
    name: 'Base Build',
    start: '2026-06-01',
    end: '2026-09-13', // through race day — no gap before Phase 2
    goal: 'Establish habit, build aerobic base, complete Trail 5K',
    exitRace: 'chewacla-5k',
    longRunThresholdMin: 50, // time-based: a run past this (and the week's longest) = long run
  },
  {
    id: 2,
    name: 'Build to 15K',
    start: '2026-09-14',
    end: '2026-11-14', // through race day — no gap before Phase 3
    goal: 'Build to 15K, introduce real climbing, technical trail',
    exitRace: 'cathedral-15k',
    longRunThresholdMi: 5, // distance-based
  },
  {
    id: 3,
    name: 'Half Marathon',
    start: '2026-11-15',
    end: '2027-04-24', // through race day
    goal: 'Build to trail half marathon on Pinhoti terrain',
    exitRace: 'choccolocco-hm',
    longRunThresholdMi: 7,
  },
]

// Returned by getPhase() after the plan ends so Today/plan logic still resolve.
export const MAINTENANCE_PHASE = {
  id: 'maintenance',
  name: 'Maintenance / Between Plans',
  start: '2027-04-25',
  end: '9999-12-31',
  goal: 'Hold fitness, pick the next ladder goal',
  longRunThresholdMi: 7, // falls back to Phase 3
}

export const LEVELS = [
  { id: 1, name: 'Reset', weekdayMin: 60, longRunMin: 60 },
  { id: 2, name: 'Extension', weekdayMin: 60, longRunMin: 75 },
  { id: 3, name: 'Building', weekdayMin: 60, longRunMin: 90 },
  { id: 4, name: 'Exit Benchmark', weekdayMin: 60, longRunMin: 120 },
]

// Default weekly plan shape. weekdayRuns flexes via settings.weekdayRunTarget.
export const WEEKLY_PLAN = {
  weekdayRuns: 2, // Tue/Thu baseline
  longRuns: 1, // any day counts (see longrun.js)
  plannedRunCount: 3,
}

// Quit-fighter trigger. Start at 4, NOT 3: the baseline cadence is Sat long run ->
// Sun rest -> Mon strength -> Tue run, so by Tuesday morning daysSinceLastRun is
// already 3 *before* the planned Tuesday run. A 3-day threshold would fire every
// Tuesday (nagging when fine); 4 ignores normal cadence and still catches a missed
// Tuesday by Wednesday. Tune after living with it.
export const QUIT_FIGHTER_DAYS = 4

export const RACES = [
  {
    id: 'chewacla-5k',
    name: 'Chewacla Cha Cha Trail 5K',
    date: '2026-09-13',
    distanceMi: 3.1,
    surface: 'Trail singletrack',
    location: 'Chewacla State Park, Auburn AL',
    estMin: 42,
    estMax: 55,
    goal: 'Finish, run it like a training effort',
    notes: '8 AM start, hot and humid, home trail advantage',
    registered: true,
  },
  {
    id: 'cathedral-15k',
    name: 'Cathedral Caverns 15K',
    date: '2026-11-14',
    distanceMi: 9.3,
    surface: 'Trail + cave',
    location: 'Cathedral Caverns SP, Woodville AL',
    estMin: 120,
    estMax: 140,
    cutoffMin: 150,
    goal: 'Finish strong, run/hike strategy',
    notes: 'Cave section last 1.2 mi, 58°F. Layers: 44°F start, 67°F finish.',
    registered: true,
  },
  {
    id: 'choccolocco-hm',
    name: "Rockin' Choccolocco Half Marathon",
    date: '2027-04-24',
    distanceMi: 13.1,
    surface: 'Trail, 95%+ singletrack (Pinhoti)',
    location: 'Cahulga Creek Park, Heflin AL',
    estMin: 165,
    estMax: 195,
    goal: 'First trail half, execute fueling, survive hard second half',
    notes: 'Creek crossings throughout, hard second half, same trail system as Pinhoti 100',
    registered: true,
  },
]

export const FUTURE_LADDER = ['Trail Marathon', '50K', '100K', 'Pinhoti 100']

// Default plan object consumed by streak math. plannedRunCount may also be a
// function (weekStartKey) => number, so changing the weekday target never
// retroactively recomputes past weeks (see streak.js).
export const DEFAULT_PLAN = {
  trainingStartDate: ATHLETE.trainingStartDate,
  plannedRunCount: WEEKLY_PLAN.plannedRunCount,
}
