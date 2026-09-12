import { Wrench } from 'lucide-react'

export default function ProviderMarker({ style, label, selected = false, onClick }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group"
    >
      {label && (
        <span className={`mb-1 px-2 py-0.5 rounded-sm text-[10px] font-medium whitespace-nowrap shadow-card ${selected ? 'bg-rescue-500 text-white' : 'bg-white text-navy-700 border border-ash-200'}`}>
          {label}
        </span>
      )}
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-card transition-transform group-hover:scale-110 ${
          selected ? 'bg-rescue-500' : 'bg-navy-700'
        }`}
      >
        <Wrench size={13} className="text-white" />
      </span>
    </button>
  )
}
