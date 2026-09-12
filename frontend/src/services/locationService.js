// Wraps the Browser Geolocation API with promise-based helpers and
// consistent error shapes the UI can branch on.

const ERROR_CODES = {
  1: 'PERMISSION_DENIED',
  2: 'POSITION_UNAVAILABLE',
  3: 'TIMEOUT',
}

function isSupported() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator
}

function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isSupported()) {
      reject({ code: 'UNSUPPORTED', message: 'Geolocation is not supported on this device.' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        })
      },
      (err) => {
        reject({
          code: ERROR_CODES[err.code] || 'UNKNOWN',
          message:
            err.code === 1
              ? 'Location permission was denied. Enable it in your browser settings to continue.'
              : err.code === 2
              ? 'Your location is currently unavailable. Try again in an open area.'
              : 'Locating you is taking too long. Please try again.',
        })
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000, ...options }
    )
  })
}

// Reverse geocoding will be backed by Google Maps / backend later.
// For now, derive a readable label so the UI never shows raw coordinates only.
async function reverseGeocode({ latitude, longitude }) {
  await new Promise((r) => setTimeout(r, 400))
  return {
    formatted: `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
  }
  // Future: return (await api.post('/location/reverse-geocode/', { latitude, longitude })).data
}

export const locationService = { isSupported, getCurrentPosition, reverseGeocode }
export default locationService
