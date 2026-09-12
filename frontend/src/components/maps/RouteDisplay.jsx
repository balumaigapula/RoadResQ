export default function RouteDisplay({ from, to, viewBox = '0 0 100 100' }) {
  if (!from || !to) return null
  return (
    <svg viewBox={viewBox} className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <line
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke="#FF5B1F"
        strokeWidth="0.8"
        strokeDasharray="2.2 2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  )
}
