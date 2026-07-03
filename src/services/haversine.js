export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function formatDistance(meters) {
  if (meters < 0) return 'Unknown'
  if (meters < 1000) return `${Math.round(meters)} m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1)} km`
  return `${Math.round(meters / 1000)} km`
}

export function isWithinRange(userLat, userLon, stationLat, stationLon, radiusKm) {
  const dist = calculateDistance(userLat, userLon, stationLat, stationLon)
  return dist <= radiusKm * 1000
}
