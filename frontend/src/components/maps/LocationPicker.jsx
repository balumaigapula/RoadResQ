import { LocateFixed, MapPin } from 'lucide-react'
import MapView from './MapView'
import Button from '../common/Button'
import Loader from '../common/Loader'

export default function LocationPicker({ status, position, address, onLocate, error }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-white overflow-hidden">
      {status === 'granted' && position ? (
        <MapView
          center={position}
          markers={[{ id: 'me', type: 'user', latitude: position.latitude, longitude: position.longitude, label: 'Your location' }]}
          height="h-80"
          onRecenter={onLocate}
        />
      ) : (
        <div className="h-80 flex items-center justify-center bg-ash-50">
          {status === 'loading' ? (
            <Loader label="Finding your location…" />
          ) : (
            <div className="text-center px-6">
              <div className="w-14 h-14 mx-auto rounded-full bg-rescue-50 flex items-center justify-center mb-4">
                <MapPin size={24} className="text-rescue-500" />
              </div>
              <p className="text-sm text-ash-600 max-w-xs mx-auto">
                {status === 'denied'
                  ? 'Location permission was denied. Enable it in your browser settings, then try again.'
                  : status === 'unavailable'
                  ? 'Geolocation isn\u2019t supported on this device or browser.'
                  : status === 'error'
                  ? error?.message || 'We couldn\u2019t get your location. Please try again.'
                  : 'Share your location so nearby providers can reach you quickly.'}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="p-4 border-t border-ash-200 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="text-sm">
          {position ? (
            <>
              <p className="font-medium text-navy-700">{address?.formatted || 'Location found'}</p>
              <p className="text-ash-500 text-xs mt-0.5 font-mono">
                {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}
              </p>
            </>
          ) : (
            <p className="text-ash-500">No location selected yet.</p>
          )}
        </div>
        <Button icon={LocateFixed} onClick={onLocate} loading={status === 'loading'}>
          {position ? 'Update location' : 'Use my current location'}
        </Button>
      </div>
    </div>
  )
}
