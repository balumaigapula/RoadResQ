import { useState } from 'react'
import { MapPin, Clock, IndianRupee, Car } from 'lucide-react'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { ClipboardList } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const INITIAL_REQUESTS = [
  { id: 'REQ-9931', customer: 'Sneha Reddy', vehicle: 'Hyundai i20', problem: 'Dead Battery', distance: 1.8, eta: 6, earnings: 480, priority: 'CRITICAL' },
  { id: 'REQ-9928', customer: 'Kabir Singh', vehicle: 'Royal Enfield Classic', problem: 'Puncture', distance: 3.2, eta: 10, earnings: 320, priority: 'NORMAL' },
  { id: 'REQ-9915', customer: 'Meera Iyer', vehicle: 'Honda City', problem: 'Engine Overheating', distance: 4.5, eta: 14, earnings: 650, priority: 'HIGH' },
]

export default function ProviderRequests() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const { showToast } = useToast()

  function handleAccept(id) {
    setRequests((r) => r.filter((x) => x.id !== id))
    showToast('Request accepted. Head to Active Service to begin.')
  }
  function handleReject(id) {
    setRequests((r) => r.filter((x) => x.id !== id))
    showToast('Request declined.', 'info')
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Incoming Requests</h2>
      <p className="text-ash-500 text-sm mb-6">Accept a request to begin the active service flow.</p>

      {requests.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No requests right now." description="New requests will appear here while you're online." />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r.id} className={`rounded-lg border bg-white p-5 ${r.priority === 'CRITICAL' ? 'border-danger-300' : 'border-ash-200'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-xs font-mono text-ash-400">{r.id}</p>
                  <h3 className="font-display font-semibold text-navy-700 mt-0.5">{r.customer}</h3>
                </div>
                {r.priority !== 'NORMAL' && <StatusBadge status={r.priority} />}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                <InfoItem icon={Car} label="Vehicle" value={r.vehicle} />
                <InfoItem icon={MapPin} label="Distance" value={`${r.distance} km`} />
                <InfoItem icon={Clock} label="ETA" value={`${r.eta} min`} />
                <InfoItem icon={IndianRupee} label="Est. Earnings" value={`₹${r.earnings}`} />
              </div>
              <p className="text-sm text-ash-600 mb-4"><span className="font-medium text-navy-700">Problem:</span> {r.problem}</p>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => handleReject(r.id)}>Reject</Button>
                <Button fullWidth onClick={() => handleAccept(r.id)}>Accept</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-ash-500 flex items-center gap-1"><Icon size={12} /> {label}</p>
      <p className="font-medium text-navy-700 mt-0.5">{value}</p>
    </div>
  )
}
