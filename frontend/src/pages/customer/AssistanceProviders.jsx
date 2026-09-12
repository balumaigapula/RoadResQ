import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import FlowStepper from '../../components/common/FlowStepper'
import Button from '../../components/common/Button'
import ProviderCard from '../../components/cards/ProviderCard'
import MapView from '../../components/maps/MapView'
import { SkeletonCard } from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import providerService from '../../services/providerService'
import assistanceService from '../../services/assistanceService'
import { Search } from 'lucide-react'

const FILTERS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'rating', label: 'Highest Rated' },
  { id: 'available', label: 'Available Now' },
]

export default function AssistanceProviders() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('recommended')
  const flow = assistanceService.getFlow()

  useEffect(() => {
    providerService.getNearbyProviders({ location: flow.location, problemCategory: flow.problemCategory }).then((list) => {
      setProviders(list)
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sorted = [...providers].sort((a, b) => {
    if (filter === 'nearest') return a.distance - b.distance
    if (filter === 'rating') return b.rating - a.rating
    if (filter === 'available') return (b.available ? 1 : 0) - (a.available ? 1 : 0)
    return b.matchScore - a.matchScore
  })

  const mapMarkers = [
    ...(flow.location ? [{ id: 'me', type: 'user', latitude: flow.location.latitude, longitude: flow.location.longitude, label: 'You' }] : []),
    ...sorted.slice(0, 6).map((p) => ({
      id: p.id,
      type: 'provider',
      latitude: p.location.latitude,
      longitude: p.location.longitude,
      label: p.name.split(' ')[0],
      selected: selected?.id === p.id,
      onClick: () => setSelected(p),
    })),
  ]

  function handleContinue() {
    assistanceService.updateFlow({ provider: selected })
    navigate('/customer/assistance/confirm')
  }

  return (
    <div>
      <FlowStepper current="Providers" />
      <h2 className="font-display text-2xl font-bold text-navy-700 mb-1">Nearby providers</h2>
      <p className="text-ash-500 text-sm mb-6">Ranked by our smart match — distance, rating, availability and ETA.</p>

      <MapView
        center={flow.location || undefined}
        markers={mapMarkers}
        height="h-64"
        className="mb-5"
      />

      <div className="flex items-center gap-2 mb-5 overflow-x-auto scrollbar-thin pb-1">
        <SlidersHorizontal size={15} className="text-ash-400 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.id ? 'bg-navy-700 text-white' : 'bg-ash-100 text-ash-600 hover:bg-ash-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={Search} title="No nearby providers found." description="Try a different problem category or check back shortly." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {sorted.map((p) => (
            <ProviderCard key={p.id} provider={p} selected={selected?.id === p.id} onSelect={setSelected} />
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Link to="/customer/assistance/problem"><Button variant="outline" icon={ArrowLeft}>Back</Button></Link>
        <Button size="lg" disabled={!selected} onClick={handleContinue}>Continue with {selected?.name || 'provider'}</Button>
      </div>
    </div>
  )
}
