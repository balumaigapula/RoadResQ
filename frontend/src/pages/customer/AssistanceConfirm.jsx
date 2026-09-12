import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import FlowStepper from '../../components/common/FlowStepper'
import Button from '../../components/common/Button'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import assistanceService from '../../services/assistanceService'
import { useToast } from '../../context/ToastContext'

export default function AssistanceConfirm() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const flow = assistanceService.getFlow()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!flow.provider) {
    return (
      <div className="max-w-xl">
        <p className="text-sm text-ash-500 mb-4">Your request details were cleared or are incomplete.</p>
        <Link to="/customer/assistance/location"><Button>Start a new request</Button></Link>
      </div>
    )
  }

  const serviceCharge = 350
  const travelCharge = Math.round((flow.provider.distance || 3) * 25)
  const total = serviceCharge + travelCharge

  async function handleConfirm() {
    setSubmitting(true)
    try {
      const request = await assistanceService.createRequest({
        service: flow.provider.services?.[0] ? flow.problem || 'Roadside Assistance' : 'Roadside Assistance',
        vehicle: flow.vehicle ? `${flow.vehicle.brand} ${flow.vehicle.model} · ${flow.vehicle.number}` : 'Not specified',
        providerName: flow.provider.name,
        providerId: flow.provider.id,
        problem: flow.problem,
        distance: flow.provider.distance,
        etaMinutes: flow.provider.etaMinutes,
        amount: total,
        priority: 'NORMAL',
      })
      showToast('Request created successfully.')
      navigate(`/customer/tracking/${request.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <FlowStepper current="Confirm" />
      <h2 className="font-display text-2xl font-bold text-navy-700 mb-1">Confirm your request</h2>
      <p className="text-ash-500 text-sm mb-6">Review the details before we notify the provider.</p>

      <div className="rounded-lg border border-ash-200 bg-white divide-y divide-ash-200">
        <Row label="Vehicle" value={flow.vehicle ? `${flow.vehicle.brand} ${flow.vehicle.model} (${flow.vehicle.number})` : '—'} />
        <Row label="Problem" value={flow.problem || '—'} />
        <Row label="Location" value={flow.address?.formatted || 'Current location'} />
        <Row label="Provider" value={flow.provider.name} />
        <Row label="Distance" value={`${flow.provider.distance} km`} />
        <Row label="ETA" value={`${flow.provider.etaMinutes} min`} />
        <Row label="Service Charge" value={`₹${serviceCharge}`} />
        <Row label="Travel Charge" value={`₹${travelCharge}`} />
        <Row label="Estimated Total" value={`₹${total}`} strong />
      </div>

      <div className="mt-6 flex justify-between">
        <Link to="/customer/assistance/providers"><Button variant="outline" icon={ArrowLeft}>Go Back</Button></Link>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/customer/dashboard')}>Cancel</Button>
          <Button size="lg" icon={CheckCircle2} onClick={() => setConfirmOpen(true)}>Confirm Request</Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Send this request?"
        description={`${flow.provider.name} will be notified immediately. Estimated total: ₹${total}.`}
        confirmLabel="Confirm Request"
        variant="primary"
        loading={submitting}
      />
    </div>
  )
}

function Row({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 text-sm">
      <span className="text-ash-500">{label}</span>
      <span className={strong ? 'font-display font-semibold text-navy-700' : 'font-medium text-navy-700'}>{value}</span>
    </div>
  )
}
