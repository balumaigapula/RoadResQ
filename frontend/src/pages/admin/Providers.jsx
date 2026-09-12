import { useState } from 'react'
import { Star, MapPin } from 'lucide-react'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'

const PROVIDERS = [
  { id: 'prov_101', name: 'Ravi Auto Care', service: 'Mechanic, Battery', location: 'Hyderabad', rating: 4.8, status: 'APPROVED' },
  { id: 'prov_102', name: 'QuickFix Garage', service: 'Tyre, Mechanic', location: 'Secunderabad', rating: 4.2, status: 'PENDING' },
  { id: 'prov_103', name: 'Deccan Towing Co.', service: 'Towing', location: 'Hyderabad', rating: 4.6, status: 'APPROVED' },
  { id: 'prov_104', name: 'FastFuel Services', service: 'Fuel Delivery', location: 'Gachibowli', rating: 3.9, status: 'SUSPENDED' },
]

export default function AdminProviders() {
  const [providers, setProviders] = useState(PROVIDERS)

  function updateStatus(id, status) {
    setProviders((list) => list.map((p) => p.id === id ? { ...p, status } : p))
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Providers</h2>
      <p className="text-ash-500 text-sm mb-6">Approve, suspend, or review service providers.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {providers.map((p) => (
          <div key={p.id} className="rounded-lg border border-ash-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display font-semibold text-navy-700">{p.name}</h3>
                <p className="text-xs text-ash-500 mt-0.5">{p.service}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-ash-500 mb-4">
              <span className="flex items-center gap-1"><Star size={12} className="fill-warning-500 text-warning-500" /> {p.rating}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {p.location}</span>
            </div>
            <div className="flex gap-2">
              {p.status === 'PENDING' && (
                <>
                  <Button size="sm" variant="outline" fullWidth onClick={() => updateStatus(p.id, 'REJECTED')}>Reject</Button>
                  <Button size="sm" fullWidth onClick={() => updateStatus(p.id, 'APPROVED')}>Approve</Button>
                </>
              )}
              {p.status === 'APPROVED' && (
                <Button size="sm" variant="outline" fullWidth className="!text-danger-600 !border-danger-200" onClick={() => updateStatus(p.id, 'SUSPENDED')}>Suspend</Button>
              )}
              {p.status === 'SUSPENDED' && (
                <Button size="sm" fullWidth onClick={() => updateStatus(p.id, 'APPROVED')}>Reinstate</Button>
              )}
              <Button size="sm" variant="ghost" fullWidth>View</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
