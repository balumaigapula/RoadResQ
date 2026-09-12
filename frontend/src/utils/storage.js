/**
 * Centralized localStorage access.
 * Nothing else in the app should call `window.localStorage` directly —
 * this keeps key names consistent and makes it trivial to swap the
 * storage layer later (e.g. for secure cookie storage of tokens).
 */

const PREFIX = 'roadresq:'

const keys = {
  authToken: `${PREFIX}auth_token`,
  refreshToken: `${PREFIX}refresh_token`,
  authUser: `${PREFIX}auth_user`,
  role: `${PREFIX}role`,
  vehicles: `${PREFIX}vehicles`,
  selectedVehicle: `${PREFIX}selected_vehicle`,
  assistanceFlow: `${PREFIX}assistance_flow`,
  requests: `${PREFIX}requests`,
  notifications: `${PREFIX}notifications`,
  reviews: `${PREFIX}reviews`,
  preferences: `${PREFIX}preferences`,
  providerOnline: `${PREFIX}provider_online`,
}

function get(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.error('storage.get failed', key, err)
    return fallback
  }
}

function set(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.error('storage.set failed', key, err)
    return false
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error('storage.remove failed', key, err)
    return false
  }
}

function clearAll() {
  Object.values(keys).forEach(remove)
}

export const storage = { get, set, remove, clearAll, keys }
export default storage
