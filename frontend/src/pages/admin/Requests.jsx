import { useState } from 'react'
import StatusBadge from '../../components/common/StatusBadge'

const REQUESTS = [
  { id: 'RR-10029384', customer: 'Arjun Mehta', provider: 'PowerCharge Battery Experts', service: 'Battery Assistance', location: 'Banjara Hills', status: 'COMPLETED', date: '2026-08-22', amount: 850 },
  { id: 'RR-10029401', customer: 'Sneha Reddy', provider: 'Ravi Auto Care', service: 'Mechanic', location: 'Gachibowli', status: 'ON_THE_WAY', date: '2026-09-05', amount: 620 },
  { id: 'RR-10029410', customer: 'Kabir Singh', provider: '—', service: 'Puncture Assistance', location: 'Kukatpally', status: 'SEARCHING', date: '2026-09-05', amount: null },
  { id: 'RR-10029205', customer: 'Meera Iyer', provider: 'Sai Towing & Recovery', service: 'Towing', location: 'Madhapur', status: 'CANCELLED', date: '2026-08-30', amount: null },
]

const STATUS_FILTERS = ['all', 'SEARCHING', 'ON_THE_WAY', 'COMPLETED', 'CANCELLED']

export default function AdminRequests() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? REQUESTS : REQUESTS.filter((r) => r.status === filter)

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Requests</h2>
      <p className="text-ash-500 text-sm mb-6">All assistance requests across the platform.</p>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-thin">
        {STATUS_FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-navy-700 text-white' : 'bg-ash-100 text-ash-600'}`}>
            {f.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-ash-200 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-ash-50 text-ash-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Request ID</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Provider</th>
              <th className="text-left px-5 py-3 font-medium">Service</th>
              <th className="text-left px-5 py-3 font-medium">Location</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash-200">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-3.5 font-mono text-xs text-ash-500">{r.id}</td>
                <td className="px-5 py-3.5 font-medium text-navy-700">{r.customer}</td>
                <td className="px-5 py-3.5 text-ash-600">{r.provider}</td>
                <td className="px-5 py-3.5 text-ash-600">{r.service}</td>
                <td className="px-5 py-3.5 text-ash-600">{r.location}</td>
                <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3.5 font-medium text-navy-700">{r.amount ? `₹${r.amount}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
