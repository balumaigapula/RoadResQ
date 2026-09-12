import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { History as HistoryIcon } from 'lucide-react'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { Skeleton } from '../../components/common/Skeleton'
import assistanceService from '../../services/assistanceService'
import { mockRequestsSeed } from '../../data/requests'

export default function History() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assistanceService.getRequests().then((r) => {
      const completed = r.filter((x) => x.status === 'COMPLETED')
      setRequests([...completed, ...mockRequestsSeed])
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Service History</h2>
      <p className="text-ash-500 text-sm mb-6">Every completed service, in one place.</p>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No service history yet." description="Completed requests will appear here." />
      ) : (
        <div className="rounded-lg border border-ash-200 bg-white overflow-hidden">
          <table className="w-full text-sm hidden sm:table">
            <thead className="bg-ash-50 text-ash-500 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Service</th>
                <th className="text-left px-5 py-3 font-medium">Provider</th>
                <th className="text-left px-5 py-3 font-medium">Amount</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-ash-200">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3.5 text-ash-600">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3.5 font-medium text-navy-700">{r.service}</td>
                  <td className="px-5 py-3.5 text-ash-600">{r.providerName || '—'}</td>
                  <td className="px-5 py-3.5 font-medium text-navy-700">₹{r.amount}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5 text-right"><Link to={`/customer/history/${r.id}`} className="text-rescue-500 text-xs font-semibold">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sm:hidden divide-y divide-ash-200">
            {requests.map((r) => (
              <Link to={`/customer/history/${r.id}`} key={r.id} className="block p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-navy-700">{r.service}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-ash-500">{r.providerName} · {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                <p className="text-sm font-semibold text-navy-700 mt-1">₹{r.amount}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
