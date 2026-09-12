import { useState } from 'react'
import { Navigation, Phone, MessageSquare } from 'lucide-react'
import MapView from '../../components/maps/MapView'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import { Wrench } from 'lucide-react'

const STATUS_FLOW = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'REPAIRING', 'COMPLETED']

export default function ActiveService() {
  const [active, setActive] = useState({
    id: 'REQ-9931',
    customer: 'Sneha Reddy',
    vehicle: 'Hyundai i20',
    problem: 'Dead Battery',
    status: 'ACCEPTED',
    location: { latitude: 17.4239, longitude: 78.4738 },
  })

  if (!active) {
    return <EmptyState icon={Wrench} title="No active service." description="Accept a request to start working on it." />
  }

  const idx = STATUS_FLOW.indexOf(active.status)
  const isLast = idx === STATUS_FLOW.length - 1
  const providerLoc = { latitude: active.location.latitude + 0.008, longitude: active.location.longitude - 0.01 }

  function handleAdvance() {
    setActive((a) => ({ ...a, status: STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)] }))
  }

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-5">
        <MapView
          center={active.location}
          height="h-80"
          markers={[
            { id: 'cust', type: 'user', latitude: active.location.latitude, longitude: active.location.longitude, label: active.customer },
            { id: 'me', type: 'provider', latitude: providerLoc.latitude, longitude: providerLoc.longitude, label: 'You', selected: true },
          ]}
          routeFromId="me"
          routeToId="cust"
        />
        <div className="rounded-lg border border-ash-200 bg-white p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-ash-400">{active.id}</p>
            <p className="font-display font-semibold text-navy-700">{active.problem}</p>
          </div>
          <Button variant="outline" size="sm" icon={Navigation}>Navigate</Button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <StatusBadge status={active.status} />
          <div className="mt-4">
            <p className="text-xs text-ash-500">Customer</p>
            <p className="font-semibold text-navy-700">{active.customer}</p>
          </div>
          <div className="mt-3">
            <p className="text-xs text-ash-500">Vehicle</p>
            <p className="font-semibold text-navy-700">{active.vehicle}</p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" icon={Phone} fullWidth>Call</Button>
            <Button variant="outline" size="sm" icon={MessageSquare} fullWidth>Message</Button>
          </div>
        </div>

        {!isLast ? (
          <Button fullWidth onClick={handleAdvance}>
            Mark as {STATUS_FLOW[idx + 1].replace(/_/g, ' ')}
          </Button>
        ) : (
          <div className="rounded-lg border border-success-200 bg-success-50 p-4 text-sm text-success-600 text-center font-medium">
            Service completed
          </div>
        )}
      </div>
    </div>
  )
}
