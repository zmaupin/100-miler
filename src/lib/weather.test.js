import { describe, it, expect } from 'vitest'
import { wmoToText, pickMorning } from './weather.js'

describe('wmoToText', () => {
  it('maps representative codes', () => {
    expect(wmoToText(0)).toBe('clear')
    expect(wmoToText(2)).toBe('partly cloudy')
    expect(wmoToText(3)).toBe('overcast')
    expect(wmoToText(61)).toBe('rain')
    expect(wmoToText(95)).toBe('thunderstorms')
    expect(wmoToText(null)).toBe('unknown')
  })
})

describe('pickMorning', () => {
  const hourly = {
    time: ['2026-06-03T06:00', '2026-06-03T07:00', '2026-06-03T08:00'],
    temperature_2m: [68, 72, 81],
    weather_code: [3, 0, 95],
  }

  it('reads the 7 AM slot for the target day', () => {
    expect(pickMorning(hourly, '2026-06-03')).toEqual({
      tempF: 72,
      code: 0,
      condition: 'clear',
      hot: false,
      wet: false,
    })
  })

  it('flags hot + wet mornings', () => {
    const m = pickMorning(hourly, '2026-06-03', 8) // 81°F, thunderstorms
    expect(m.hot).toBe(true)
    expect(m.wet).toBe(true)
  })

  it('returns null when the day is not in the window', () => {
    expect(pickMorning(hourly, '2026-06-05')).toBeNull()
  })
})
