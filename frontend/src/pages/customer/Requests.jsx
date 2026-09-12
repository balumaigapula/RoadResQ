import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import RequestCard from '../../components/cards/RequestCard'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import assistanceService from '../../services/assistanceService'

const TABS = [
  { id: 'active', label: 'Active', match: (s) => !['COMPLETED', 'CANCELLED', 'REQUESTED'].includes(s) },
  { id: 'pending', label: 'Pending', match: (s) => s === 'REQUESTED' || s === 'SEARCHING' },
  { id: 'completed', label: 'Completed', match: (s) => s === 'COMPLETED' },
  { id: 'cancelled', label: 'Cancelled', match: (s) => s === 'CANCELLED' },
]

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    assistanceService.getRequests().then((r) => { setRequests(r); setLoading(false) })
  }, [])

  const activeTab = TABS.find((t) => t.id === tab)
  const filtered = requests.filter((r) => activeTab.match(r.status))

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">My Requests</h2>
      <p className="text-ash-500 text-sm mb-6">Track and review every assistance request you\u2019ve made.</p>

      <div className="flex gap-2 mb-6 border-b border-ash-200 overflow-x-auto scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.id ? 'border-rescue-500 text-rescue-600' : 'border-transparent text-ash-500 hover:text-navy-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title={`No ${activeTab.label.toLowerCase()} requests.`} description="Requests you make will show up here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((r) => <RequestCard key={r.id} request={r} />)}
        </div>
      )}
    </div>
  )
}
