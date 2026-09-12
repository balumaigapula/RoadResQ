import { Plus, Minus, LocateFixed } from 'lucide-react'

export default function MapControls({ onZoomIn, onZoomOut, onRecenter, className = '' }) {
  return (
    <div className={`absolute right-3 bottom-3 flex flex-col gap-2 ${className}`}>
      <div className="bg-white rounded-md shadow-card overflow-hidden border border-ash-200">
        <button onClick={onZoomIn} aria-label="Zoom in" className="w-9 h-9 flex items-center justify-center text-navy-600 hover:bg-ash-100 border-b border-ash-200">
          <Plus size={16} />
        </button>
        <button onClick={onZoomOut} aria-label="Zoom out" className="w-9 h-9 flex items-center justify-center text-navy-600 hover:bg-ash-100">
          <Minus size={16} />
        </button>
      </div>
      <button
        onClick={onRecenter}
        aria-label="Re-center map"
        className="w-9 h-9 rounded-md shadow-card border border-ash-200 bg-white flex items-center justify-center text-rescue-500 hover:bg-ash-100"
      >
        <LocateFixed size={17} />
      </button>
    </div>
  )
}
