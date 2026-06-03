// Tomorrow's early-morning forecast for the home trail, via Open-Meteo (no API key,
// CORS-friendly, so it's a direct client fetch). Weather is non-critical — callers
// degrade silently if it fails.

import { ATHLETE } from './constants.js'

export const HOT_F = 78

// WMO weather codes -> short condition text.
export function wmoToText(code) {
  if (code == null) return 'unknown'
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly cloudy'
  if (code === 3) return 'overcast'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rain showers'
  if (code <= 86) return 'snow showers'
  if (code <= 99) return 'thunderstorms'
  return 'unknown'
}

export function forecastUrl(lat, lon) {
  const p = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    hourly: 'temperature_2m,weather_code',
    temperature_unit: 'fahrenheit',
    timezone: 'auto',
    forecast_days: '2',
  })
  return `https://api.open-meteo.com/v1/forecast?${p}`
}

// Pull the reading at a given local date + hour from Open-Meteo's hourly arrays.
export function pickMorning(hourly, dateKey, hour = 7) {
  if (!hourly?.time) return null
  const target = `${dateKey}T${String(hour).padStart(2, '0')}:00`
  const i = hourly.time.indexOf(target)
  if (i === -1) return null
  const tempF = hourly.temperature_2m?.[i]
  const code = hourly.weather_code?.[i]
  return {
    tempF,
    code,
    condition: wmoToText(code),
    hot: tempF >= HOT_F,
    wet: code >= 51 && code <= 99,
  }
}

export async function fetchMorningForecast(
  dateKey,
  lat = ATHLETE.homeTrail.lat,
  lon = ATHLETE.homeTrail.lon,
) {
  const res = await fetch(forecastUrl(lat, lon))
  if (!res.ok) throw new Error('weather_failed')
  const data = await res.json()
  return pickMorning(data.hourly, dateKey)
}
