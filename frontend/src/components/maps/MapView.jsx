import { useMemo, useState } from 'react'
import MapControls from './MapControls'
import UserMarker from './UserMarker'
import ProviderMarker from './ProviderMarker'
import RouteDisplay from './RouteDisplay'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

/**
 * MapView — reusable map surface used across the app (location picking,
 * provider discovery, live tracking).
 *
 * This renders a stylised, deliberately-designed static-preview map (an
 * "asphalt" grid with a route motif) instead of a blank placeholder, so the
 * product feels complete with zero backend/API dependency.
 *
 * GOOGLE MAPS INTEGRATION (future):
 *   1. `npm install @react-google-maps/api`
 *   2. Set VITE_GOOGLE_MAPS_API_KEY in .env
 *   3. Swap the <StaticPreview> below for a <GoogleMap> from that library,
 *      keeping the same props (center, markers, routeFrom/routeTo, zoom)
 *      so every screen that uses MapView needs no other changes.
 */
export default function MapView({
  center = { latitude: 17.4239, longitude: 78.4738 },
  markers = [], // [{ id, type: 'user' | 'provider', latitude, longitude, label, selected }]
  routeFromId,
  routeToId,
  height = 'h-72',
  className = '',
  onRecenter,
}) {
  const [zoom, setZoom] = useState(1)
  const hasGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY)

  // Simple equirectangular-style projection around `center`, scaled by zoom.
  // Good enough for a stylised preview; a real provider (Google/Mapbox)
  // replaces this projection entirely.
  const span = 0.09 / zoom
  const project = (lat, lng) => {
    const x = 50 + ((lng - center.longitude) / span) * 50
    const y = 50 - ((lat - center.latitude) / span) * 50
    return { x: Math.min(96, Math.max(4, x)), y: Math.min(94, Math.max(8, y)) }
  }

  const projected = useMemo(
    () => markers.map((m) => ({ ...m, ...project(m.latitude, m.longitude) })),
    [markers, zoom, center.latitude, center.longitude]
  )

  const from = projected.find((m) => m.id === routeFromId)
  const to = projected.find((m) => m.id === routeToId)

  return (
    <div className={`relative ${height} w-full overflow-hidden rounded-lg border border-ash-200 bg-navy-700 ${className}`}>
      {/* Asphalt base + road grid */}
      <div className="absolute inset-0 bg-asphalt" />
      <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[15, 32, 50, 68, 85].map((pos) => (
          <line key={`h${pos}`} x1="0" y1={pos} x2="100" y2={pos} stroke="#8494AC" strokeWidth="0.35" />
        ))}
        {[10, 28, 50, 72, 90].map((pos) => (
          <line key={`v${pos}`} x1={pos} y1="0" x2={pos} y2="100" stroke="#8494AC" strokeWidth="0.35" />
        ))}
        <line x1="0" y1="50" x2="100" y2="50" stroke="#FFB088" strokeWidth="0.6" strokeDasharray="2.5 2.5" opacity="0.5" />
      </svg>

      {(from && to) && (
        <RouteDisplay from={from} to={to} />
      )}

      {projected.map((m) => {
        const style = { left: `${m.x}%`, top: `${m.y}%` }
        return m.type === 'user' ? (
          <UserMarker key={m.id} style={style} label={m.label || 'You'} />
        ) : (
          <ProviderMarker key={m.id} style={style} label={m.label} selected={m.selected} onClick={m.onClick} />
        )
      })}

      <MapControls
        onZoomIn={() => setZoom((z) => Math.min(2.4, z + 0.3))}
        onZoomOut={() => setZoom((z) => Math.max(0.6, z - 0.3))}
        onRecenter={() => { setZoom(1); onRecenter?.() }}
      />

      {!hasGoogleMapsKey && (
        <span className="absolute left-3 top-3 text-[10px] font-medium px-2 py-1 rounded-sm bg-navy-900/70 text-ash-300 backdrop-blur-sm">
          Map preview
        </span>
      )}
    </div>
  )
}
