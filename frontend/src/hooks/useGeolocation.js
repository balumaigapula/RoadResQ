import { useCallback, useState } from 'react'
import locationService from '../services/locationService'

/**
 * Encapsulates the permission/loading/error/success state machine every
 * location-aware screen needs (SOS, the dedicated location page, provider
 * "go online", tracking, etc.) so it isn't reimplemented per page.
 */
export function useGeolocation() {
  const [status, setStatus] = useState('idle') // idle | loading | granted | denied | unavailable | error
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState(null)
  const [error, setError] = useState(null)

  const locate = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      const pos = await locationService.getCurrentPosition()
      setPosition(pos)
      setStatus('granted')
      try {
        const geo = await locationService.reverseGeocode(pos)
        setAddress(geo)
      } catch {
        // Non-fatal — coordinates are still usable without a label.
      }
      return pos
    } catch (err) {
      setError(err)
      setStatus(err.code === 'PERMISSION_DENIED' ? 'denied' : err.code === 'UNSUPPORTED' ? 'unavailable' : 'error')
      throw err
    }
  }, [])

  return { status, position, address, error, locate }
}

export default useGeolocation
