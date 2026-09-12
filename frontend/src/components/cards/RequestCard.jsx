import { Link } from 'react-router-dom'
import { Calendar, Car } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'

export default function RequestCard({ request }) {
  const isTrackable = !['COMPLETED', 'CANCELLED'].includes(request.status)
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono text-ash-400">{request.id}</p>
          <h4 className="font-display font-semibold text-navy-700 mt-0.5">{request.service}</h4>
        </div>
        <StatusBadge status={request.priority === 'CRITICAL' ? 'CRITICAL' : request.status} />
      </div>
      <div className="mt-3 space-y-1.5 text-sm text-ash-600">
        <p className="flex items-center gap-2"><Car size={14} className="text-ash-400" /> {request.vehicle}</p>
        <p className="flex items-center gap-2"><Calendar size={14} className="text-ash-400" /> {new Date(request.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display font-semibold text-navy-700">{request.amount ? `₹${request.amount}` : '—'}</span>
        <Link to={isTrackable ? `/customer/tracking/${request.id}` : `/customer/history/${request.id}`}>
          <Button size="sm" variant="outline">{isTrackable ? 'Track' : 'View Details'}</Button>
        </Link>
      </div>
    </div>
  )
}
