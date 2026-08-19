/**
 * Geocode a city name to lat/lng using Nominatim (OpenStreetMap).
 * Free, no API key needed. Rate-limited to 1 req/sec.
 */
export async function geocodeCity(city: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Collettive/1.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

/**
 * Convert lat/lng to IANA timezone using geo-tz.
 */
export function latLngToTimezone(lat: number, lng: number): string {
  try {
    // geo-tz: findTimezone(lat, lng) returns the IANA timezone string
    const { findTimezone } = require("geo-tz");
    return findTimezone(lat, lng);
  } catch {
    // Fallback: estimate from longitude
    const offset = Math.round(lng / 15);
    const sign = offset >= 0 ? "+" : "";
    return `Etc/GMT${sign}${offset}`;
  }
}

/**
 * Convert birth date, time, and timezone to UTC epoch milliseconds.
 */
export function birthToEpoch(date: string, time: string, timezone: string): number {
  try {
    const spacetime = require("spacetime");
    const s = spacetime(`${date} ${time}`, timezone);
    return s.epoch;
  } catch {
    // Fallback: manual calculation
    const [y, m, d] = date.split("-").map(Number);
    const [h, min] = time.split(":").map(Number);
    const utcDate = new Date(Date.UTC(y, m - 1, d, h, min));
    return utcDate.getTime();
  }
}