import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Phone, MessageSquare, X, Info } from 'lucide-react'
import MapView from '../../components/maps/MapView'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import assistanceService from '../../services/assistanceService'
import trackingService from '../../services/trackingService'
import { useToast } from '../../context/ToastContext'

const STATUS_LABELS = {
  REQUESTED: 'Requested',
  SEARCHING: 'Searching',
  PROVIDER_ASSIGNED: 'Provider Assigned',
  ACCEPTED: 'Accepted',
  ON_THE_WAY: 'On The Way',
  ARRIVED: 'Arrived',
  REPAIRING: 'Repairing',
  COMPLETED: 'Completed',
}

export default function Tracking() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [live, setLive] = useState(null)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    assistanceService.getRequestById(requestId).then(setRequest).catch(setError).finally(() => setLoading(false))
  }, [requestId])

  useEffect(() => {
    if (!request || request.status === 'COMPLETED') return
    const unsubscribe = trackingService.subscribe(requestId, setLive)
    return unsubscribe
  }, [request, requestId])

  async function handleAdvance() {
    const updated = await assistanceService.advanceStatus(requestId)
    setRequest(updated)
    if (updated.status === 'COMPLETED') {
      showToast('Service marked as completed.')
      navigate(`/customer/review/${requestId}`)
    }
  }

  async function handleCancel() {
    const updated = await assistanceService.cancelRequest(requestId)
    setRequest(updated)
    setCancelOpen(false)
    showToast('Request cancelled.', 'info')
  }

  if (loading) return <Loader full label="Loading tracking details…" />
  if (error) return <ErrorState description={error.message} onRetry={() => navigate('/customer/requests')} />

  const flow = assistanceService.STATUS_FLOW.slice(0, -0)
  const currentIndex = flow.indexOf(request.status)
  const userLoc = request.location || { latitude: 17.4239, longitude: 78.4738 }
  const providerLoc = { latitude: userLoc.latitude + 0.01, longitude: userLoc.longitude + 0.012 }

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-5">
        <MapView
          center={userLoc}
          height="h-80"
          markers={[
            { id: 'me', type: 'user', latitude: userLoc.latitude, longitude: userLoc.longitude, label: 'You' },
            { id: 'prov', type: 'provider', latitude: providerLoc.latitude, longitude: providerLoc.longitude, label: request.providerName || 'Provider', selected: true },
          ]}
          routeFromId="prov"
          routeToId="me"
        />

        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-4">Status timeline</h3>
          <ol className="space-y-0">
            {flow.filter(s => s !== 'CANCELLED').map((s, i) => {
              const done = i <= currentIndex
              return (
                <li key={s} className="flex gap-3 relative pb-6 last:pb-0">
                  {i < flow.length - 2 && <span className={`absolute left-[7px] top-4 bottom-0 w-px ${done ? 'bg-rescue-400' : 'bg-ash-200'}`} />}
                  <span className={`w-4 h-4 rounded-full shrink-0 mt-0.5 border-2 ${done ? 'bg-rescue-500 border-rescue-500' : 'bg-white border-ash-300'}`} />
                  <span className={`text-sm ${done ? 'text-navy-700 font-medium' : 'text-ash-400'}`}>{STATUS_LABELS[s]}</span>
                </li>
              )
            })}
          </ol>
        </div>

        {live?.isSimulated && (
          <p className="text-xs text-ash-400 flex items-center gap-1.5">
            <Info size={13} /> Live position shown is a local simulation for this demo — it will switch to real GPS once the tracking backend is connected.
          </p>
        )}
      </div>

      <div className="space-y-5">
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <p className="text-xs font-mono text-ash-400 mb-2">{request.id}</p>
          <StatusBadge status={request.status} />
          <div className="flex items-center gap-3 mt-4">
            <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center font-display font-semibold text-navy-600">
              {(request.providerName || 'P').charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-navy-700">{request.providerName || 'Awaiting provider'}</p>
              <p className="text-xs text-ash-500">{request.service}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-ash-200 text-sm">
            <div><p className="text-xs text-ash-500">ETA</p><p className="font-semibold text-navy-700">{live?.etaMinutes ?? request.etaMinutes ?? '—'} min</p></div>
            <div><p className="text-xs text-ash-500">Distance</p><p className="font-semibold text-navy-700">{live?.distanceKm ?? request.distance ?? '—'} km</p></div>
          </div>
          {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" icon={Phone} fullWidth>Call</Button>
              <Button variant="outline" size="sm" icon={MessageSquare} fullWidth>Message</Button>
            </div>
          )}
        </div>

        {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
          <div className="space-y-2">
            <Button fullWidth onClick={handleAdvance}>Simulate next status (demo)</Button>
            <Button fullWidth variant="ghost" className="!text-danger-600" icon={X} onClick={() => setCancelOpen(true)}>Cancel Request</Button>
          </div>
        )}

        {request.status === 'CANCELLED' && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-600">This request was cancelled.</div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this request?"
        description="The provider will be notified immediately."
        confirmLabel="Cancel Request"
      />
    </div>
  )
}
