import { Capacitor } from '@capacitor/core'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// The provider is resolved from the resident's coordinates.
// Nothing assumes an organization until an address lands inside one.
let currentOrgId = null

export function getOrgId() {
  return currentOrgId
}

export async function findOrganization(lat, lng) {
  const { data, error } = await supabase.rpc('find_organization_for_point', {
    input_lat: lat,
    input_lng: lng,
  })
  if (error) throw error
  const org = data?.[0] ?? null
  currentOrgId = org?.organization_id ?? null
  return org
}

export async function getSchedule(lat, lng, daysAhead = 60) {
  if (!currentOrgId) return []
  const { data, error } = await supabase.rpc('get_resident_schedule', {
    input_organization_id: currentOrgId,
    input_lat: lat,
    input_lng: lng,
    input_days_ahead: daysAhead,
  })
  if (error) throw error
  return data
}

export async function getAnnouncements(lat, lng) {
  if (!currentOrgId) return []
  const { data, error } = await supabase.rpc('get_announcements', {
    input_organization_id: currentOrgId,
    input_lat: lat,
    input_lng: lng,
  })
  if (error) throw error
  return data || []
}

export async function submitReport({ lat, lng, type, description, contact, address }) {
  if (!currentOrgId) throw new Error('No provider resolved for this location')
  const { data, error } = await supabase.rpc('submit_service_request', {
    input_organization_id: currentOrgId,
    input_lat: lat,
    input_lng: lng,
    input_request_type: type,
    input_description: description,
    input_contact: contact || null,
    input_address: address || null,
  })
  if (error) throw error
  return data
}

export async function geocodeAddress(address) {
  const base = Capacitor.isNativePlatform()
    ? 'https://geocoding.geo.census.gov/geocoder'
    : window.location.origin + '/geocode'

  const url = new URL(base + '/locations/onelineaddress')
  url.searchParams.set('address', address)
  url.searchParams.set('benchmark', 'Public_AR_Current')
  url.searchParams.set('format', 'json')

  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding service unavailable')

  const json = await res.json()
  const match = json.result?.addressMatches?.[0]
  if (!match) return null

  return {
    lat: match.coordinates.y,
    lng: match.coordinates.x,
    matched: match.matchedAddress,
  }
}

export async function reverseGeocode(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lng)
  url.searchParams.set('format', 'json')
  url.searchParams.set('zoom', '18')
  url.searchParams.set('addressdetails', '1')

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KurbConnect/1.0 (jim@honeaenterprises.com)' },
    })
    if (!res.ok) return null
    const json = await res.json()
    const a = json.address
    if (!a) return null

    const street = [a.house_number, a.road].filter(Boolean).join(' ')
    const city = a.city || a.town || a.village || a.hamlet
    return [street, city, a.postcode].filter(Boolean).join(', ') || json.display_name || null
  } catch {
    return null
  }
}

// Fire-and-forget: never let logging break a lookup.
export function logLookup({ raw, geocoded, inArea, lat, lng, source = 'address' }) {
  supabase
    .rpc('log_lookup', {
      input_raw: raw,
      input_geocoded: geocoded,
      input_in_area: inArea,
      input_organization_id: currentOrgId,
      input_lat: lat ?? null,
      input_lng: lng ?? null,
      input_source: source,
    })
    .then(() => {})
    .catch(() => {})
}
export async function searchAddresses(query, limit = 8) {
  const { data, error } = await supabase.rpc('search_addresses', {
    input_query: query,
    input_limit: limit,
  })
  if (error) { console.error('search_addresses:', error); return [] }
  return data || []
}