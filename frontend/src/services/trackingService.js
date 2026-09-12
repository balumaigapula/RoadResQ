// Prepared for WebSocket integration. `subscribe` currently runs a clearly
// labeled local simulation so the tracking UI can be built and demoed —
// it never pretends to be a real GPS feed.

const WS_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '')
  .replace('http', 'ws')
  .replace('/api', '/ws')

function connect(requestId) {
  // Future:
  // const socket = new WebSocket(`${WS_BASE_URL}/tracking/${requestId}/`)
  // return socket
  return null
}

/**
 * subscribe(requestId, onUpdate) -> unsubscribe()
 * onUpdate receives { status, providerLocation, etaMinutes, distanceKm, isSimulated: true }
 */
function subscribe(requestId, onUpdate) {
  let cancelled = false
  let tick = 0

  const interval = setInterval(() => {
    if (cancelled) return
    tick += 1
    onUpdate({
      isSimulated: true,
      etaMinutes: Math.max(1, 8 - tick),
      distanceKm: Math.max(0.1, (4 - tick * 0.5).toFixed(1)),
    })
  }, 4000)

  return () => {
    cancelled = true
    clearInterval(interval)
  }
}

export const trackingService = { connect, subscribe, WS_BASE_URL }
export default trackingService
