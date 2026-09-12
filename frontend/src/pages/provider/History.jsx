import { useState } from 'react'
import StatusBadge from '../../components/common/StatusBadge'
import RatingStars from '../../components/common/RatingStars'

const HISTORY = [
  { id: 'REQ-9902', customer: 'Arjun Mehta', vehicle: 'Maruti Swift', service: 'Battery Assistance', date: '2026-08-22', earnings: 850, rating: 5, status: 'COMPLETED' },
  { id: 'REQ-9887', customer: 'Priya Nair', vehicle: 'Royal Enfield', service: 'Mechanic', date: '2026-08-18', earnings: 420, rating: 4, status: 'COMPLETED' },
  { id: 'REQ-9860', customer: 'Rahul Verma', vehicle: 'Honda City', service: 'Towing', date: '2026-08-11', earnings: 1200, rating: 5, status: 'COMPLETED' },
]

export default function ProviderHistory() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Service History</h2>
      <p className="text-ash-500 text-sm mb-6">Every job you\u2019ve completed.</p>

      <div className="rounded-lg border border-ash-200 bg-white overflow-hidden">
        <table className="w-full text-sm hidden sm:table">
          <thead className="bg-ash-50 text-ash-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Vehicle</th>
              <th className="text-left px-5 py-3 font-medium">Service</th>
              <th className="text-left px-5 py-3 font-medium">Earnings</th>
              <th className="text-left px-5 py-3 font-medium">Rating</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash-200">
            {HISTORY.map((h) => (
              <tr key={h.id}>
                <td className="px-5 py-3.5 text-ash-600">{new Date(h.date).toLocaleDateString('en-IN')}</td>
                <td className="px-5 py-3.5 font-medium text-navy-700">{h.customer}</td>
                <td className="px-5 py-3.5 text-ash-600">{h.vehicle}</td>
                <td className="px-5 py-3.5 text-ash-600">{h.service}</td>
                <td className="px-5 py-3.5 font-medium text-navy-700">₹{h.earnings}</td>
                <td className="px-5 py-3.5"><RatingStars value={h.rating} size={13} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={h.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sm:hidden divide-y divide-ash-200">
          {HISTORY.map((h) => (
            <div key={h.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-navy-700">{h.customer}</p>
                <span className="font-semibold text-navy-700">₹{h.earnings}</span>
              </div>
              <p className="text-xs text-ash-500">{h.service} · {h.vehicle}</p>
              <div className="flex items-center justify-between mt-2">
                <RatingStars value={h.rating} size={12} />
                <StatusBadge status={h.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
