// OSRM routing utility - free, no API key required
const OSRM_BASE = 'https://router.project-osrm.org/route/v1'

/**
 * Calculate a route between multiple waypoints using OSRM
 * @param {Array<{lat: number, lng: number}>} waypoints
 * @param {string} profile - 'driving' | 'walking' | 'cycling'
 * @returns {Promise<{coordinates: Array<[number,number]>, distance: number, duration: number, distanceText: string, durationText: string}>}
 */
export async function calculateRoute(waypoints, profile = 'driving') {
  if (!waypoints || waypoints.length < 2) {
    throw new Error('Mindestens 2 Wegpunkte erforderlich')
  }

  const coords = waypoints.map(p => `${p.lng},${p.lat}`).join(';')
  // OSRM public API only supports driving; we override duration for other modes
  const url = `${OSRM_BASE}/driving/${coords}?overview=full&geometries=geojson&steps=false`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Route konnte nicht berechnet werden')
  }

  const data = await response.json()

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('Keine Route gefunden')
  }

  const route = data.routes[0]
  const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng])

  const distance = route.distance // meters
  // Compute duration based on mode (walking: 5 km/h, cycling: 15 km/h)
  let duration
  if (profile === 'walking') {
    duration = distance / (5000 / 3600)
  } else if (profile === 'cycling') {
    duration = distance / (15000 / 3600)
  } else {
    duration = route.duration // driving: use OSRM value
  }

  return {
    coordinates,
    distance,
    duration,
    distanceText: formatDistance(distance),
    durationText: formatDuration(duration),
  }
}

/**
 * Generate a Google Maps directions URL for the given places
 */
export function generateGoogleMapsUrl(places) {
  const valid = places.filter(p => p.lat && p.lng)
  if (valid.length === 0) return null
  if (valid.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${valid[0].lat},${valid[0].lng}`
  }
  // Use /dir/stop1/stop2/.../stopN format — all stops as path segments
  const stops = valid.map(p => `${p.lat},${p.lng}`).join('/')
  return `https://www.google.com/maps/dir/${stops}`
}

/**
 * Simple nearest-neighbor route optimization
 */
export function optimizeRoute(places) {
  const valid = places.filter(p => p.lat && p.lng)
  if (valid.length <= 2) return places

  const visited = new Set()
  const result = []
  let current = valid[0]
  visited.add(current.id)
  result.push(current)

  while (result.length < valid.length) {
    let nearest = null
    let minDist = Infinity
    for (const place of valid) {
      if (visited.has(place.id)) continue
      const d = Math.sqrt(
        Math.pow(place.lat - current.lat, 2) + Math.pow(place.lng - current.lng, 2)
      )
      if (d < minDist) { minDist = d; nearest = place }
    }
    if (nearest) { visited.add(nearest.id); result.push(nearest); current = nearest }
  }
  return result
}

function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) {
    return `${h} Std. ${m} Min.`
  }
  return `${m} Min.`
}
