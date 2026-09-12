import { Star, MapPin, Clock, BadgeCheck } from 'lucide-react'
import Button from '../common/Button'
import { Link } from 'react-router-dom'

export default function ProviderCard({ provider, onSelect, selected = false }) {
  return (
    <div className={`rounded-lg border bg-white p-4 transition-all ${selected ? 'border-rescue-500 ring-2 ring-rescue-500/15' : 'border-ash-200 hover:border-ash-300'}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center font-display font-semibold text-navy-600 shrink-0 overflow-hidden">
          {provider.profileImage ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" /> : provider.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <Link to={`/customer/providers/${provider.id}`} className="font-display font-semibold text-navy-700 hover:text-rescue-500 truncate">
              {provider.name}
            </Link>
            {provider.matchScore >= 85 && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success-50 text-success-600 flex items-center gap-1">
                <BadgeCheck size={11} /> Recommended
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-ash-500">
            <span className="flex items-center gap-1"><Star size={12} className="fill-warning-500 text-warning-500" /> {provider.rating} ({provider.reviewsCount})</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> {provider.distance} km</span>
            <span className="flex items-center gap-1"><Clock size={12} /> ETA {provider.etaMinutes} min</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${provider.available ? 'bg-success-50 text-success-600' : 'bg-ash-100 text-ash-500'}`}>
            {provider.available ? 'Available now' : 'Busy'}
          </span>
          <span className="text-xs text-ash-500">{provider.estimatedPrice}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-navy-600">{provider.matchScore}% Match</span>
          <Button size="sm" variant={selected ? 'primary' : 'outline'} onClick={() => onSelect?.(provider)}>
            {selected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  )
}
