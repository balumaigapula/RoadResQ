import { Car, Bike, Star, Pencil, Trash2 } from 'lucide-react'
import Button from '../common/Button'

export default function VehicleCard({ vehicle, onEdit, onDelete, onSetPrimary, onSelect, selectable = false }) {
  const Icon = vehicle.type === 'Two-Wheeler' ? Bike : Car
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-4 flex items-center gap-4">
      <div className="w-14 h-14 rounded-md bg-navy-50 flex items-center justify-center text-navy-600 shrink-0">
        <Icon size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-display font-semibold text-navy-700 truncate">{vehicle.brand} {vehicle.model}</h4>
          {vehicle.isPrimary && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rescue-50 text-rescue-600 flex items-center gap-1 shrink-0">
              <Star size={10} className="fill-current" /> Primary
            </span>
          )}
        </div>
        <p className="text-sm text-ash-500 font-mono mt-0.5">{vehicle.number}</p>
        <p className="text-xs text-ash-400 mt-0.5">{vehicle.fuelType} · {vehicle.year}</p>
      </div>
      <div className="flex flex-col gap-1.5 items-end shrink-0">
        {selectable ? (
          <Button size="sm" onClick={() => onSelect?.(vehicle)}>Select</Button>
        ) : (
          <div className="flex gap-1.5">
            {!vehicle.isPrimary && (
              <button onClick={() => onSetPrimary?.(vehicle)} title="Set as primary" className="p-2 rounded-sm text-ash-400 hover:text-rescue-500 hover:bg-rescue-50">
                <Star size={15} />
              </button>
            )}
            <button onClick={() => onEdit?.(vehicle)} title="Edit" className="p-2 rounded-sm text-ash-400 hover:text-navy-600 hover:bg-ash-100">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete?.(vehicle)} title="Delete" className="p-2 rounded-sm text-ash-400 hover:text-danger-600 hover:bg-danger-50">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
