export default function UserMarker({ style, label = 'You' }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center" style={style}>
      <span className="mb-1 px-2 py-0.5 rounded-sm bg-navy-800 text-white text-[10px] font-medium whitespace-nowrap shadow-card">{label}</span>
      <span className="relative flex w-4 h-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-info-500 opacity-40 animate-beacon" />
        <span className="relative inline-flex rounded-full w-4 h-4 bg-info-500 border-2 border-white shadow-card" />
      </span>
    </div>
  )
}
