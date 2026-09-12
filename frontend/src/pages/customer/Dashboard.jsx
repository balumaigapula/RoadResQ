import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Siren, MapPin, Car, Clock, ChevronRight, Wrench, CircleDot, BatteryCharging, Fuel } from 'lucide-react'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import useGeolocation from '../../hooks/useGeolocation'
import vehicleService from '../../services/vehicleService'
import assistanceService from '../../services/assistanceService'
import { EMERGENCY_TYPES } from '../../data/services'

const QUICK_SERVICES = [
  { id: 'mechanic', label: 'Mechanic', icon: Wrench },
  { id: 'puncture', label: 'Puncture', icon: CircleDot },
  { id: 'battery', label: 'Battery', icon: BatteryCharging },
  { id: 'fuel', label: 'Fuel', icon: Fuel },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [requests, setRequests] = useState([])
  const [sosOpen, setSosOpen] = useState(false)

  useEffect(() => {
    vehicleService.getVehicles().then(setVehicles)
    assistanceService.getRequests().then(setRequests)
  }, [])

  const activeRequest = requests.find((r) => !['COMPLETED', 'CANCELLED'].includes(r.status))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-700">Hi, {user?.fullName?.split(' ')[0] || 'there'}</h2>
          <p className="text-ash-500 text-sm mt-1">What\u2019s going on with your vehicle today?</p>
        </div>
        <Button size="lg" variant="emergency" icon={Siren} onClick={() => setSosOpen(true)}>SOS Emergency</Button>
      </div>

      {/* Primary CTA */}
      <div className="rounded-xl bg-asphalt p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-rescue-400 text-xs font-semibold mb-2">GET HELP NOW</p>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white max-w-sm">Broken down? Start a request and we\u2019ll find someone nearby.</h3>
        </div>
        <Link to="/customer/assistance/location" className="shrink-0">
          <Button size="lg">Get Help Now</Button>
        </Link>
      </div>

      {activeRequest && (
        <Link to={`/customer/tracking/${activeRequest.id}`} className="block rounded-lg border border-rescue-300 bg-rescue-50/50 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rescue-500 animate-beacon shrink-0" />
            <div>
              <p className="text-sm font-semibold text-navy-700">Active request — {activeRequest.service}</p>
              <p className="text-xs text-ash-500">{activeRequest.id} · Status: {activeRequest.status.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-ash-400 shrink-0" />
        </Link>
      )}

      {/* Quick services */}
      <div>
        <h3 className="font-display font-semibold text-navy-700 mb-4">Quick request</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_SERVICES.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate('/customer/assistance/location')}
              className="rounded-lg border border-ash-200 bg-white p-5 flex flex-col items-center gap-3 hover:border-rescue-300 hover:shadow-card transition-all"
            >
              <span className="w-11 h-11 rounded-md bg-rescue-50 text-rescue-500 flex items-center justify-center"><s.icon size={20} /></span>
              <span className="text-sm font-medium text-navy-700">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Vehicles */}
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-700">Your Vehicles</h3>
            <Link to="/customer/vehicles" className="text-xs font-semibold text-rescue-500 hover:text-rescue-600">Manage</Link>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 && <p className="text-sm text-ash-500">No vehicles added yet.</p>}
            {vehicles.slice(0, 3).map((v) => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <span className="w-9 h-9 rounded-md bg-navy-50 text-navy-600 flex items-center justify-center shrink-0"><Car size={16} /></span>
                <div className="min-w-0">
                  <p className="font-medium text-navy-700 truncate">{v.brand} {v.model}</p>
                  <p className="text-xs text-ash-400 font-mono">{v.number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent services */}
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-700">Recent Services</h3>
            <Link to="/customer/history" className="text-xs font-semibold text-rescue-500 hover:text-rescue-600">View all</Link>
          </div>
          <div className="space-y-3">
            {requests.length === 0 && <p className="text-sm text-ash-500">No service history yet.</p>}
            {requests.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center gap-3 text-sm">
                <span className="w-9 h-9 rounded-md bg-ash-100 text-ash-500 flex items-center justify-center shrink-0"><Clock size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy-700 truncate">{r.service}</p>
                  <p className="text-xs text-ash-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  )
}

function SOSModal({ open, onClose }) {
  const [step, setStep] = useState('location') // location -> type -> confirm -> sent
  const [emergencyType, setEmergencyType] = useState(null)
  const geo = useGeolocation()
  const { showToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setStep('location')
      setEmergencyType(null)
      geo.locate().then(() => setStep('type')).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function handleConfirm() {
    const request = await assistanceService.createRequest({
      service: 'Emergency Assistance',
      vehicle: 'Not specified',
      priority: 'CRITICAL',
      emergencyType: emergencyType.label,
      location: geo.position,
    })
    setStep('sent')
    showToast('Emergency request sent. Help is on the way.')
    setTimeout(() => {
      onClose()
      navigate(`/customer/tracking/${request.id}`)
    }, 1400)
  }

  return (
    <Modal open={open} onClose={onClose} title="SOS Emergency" size="sm">
      {step === 'location' && (
        <div className="text-center py-6">
          <Siren size={30} className="text-rescue-500 mx-auto mb-4 animate-beacon" />
          <p className="text-sm text-ash-500">Getting your current location…</p>
        </div>
      )}

      {step === 'type' && (
        <div>
          <p className="text-sm text-ash-500 mb-4">
            {geo.status === 'granted' ? `Location found: ${geo.address?.formatted || 'nearby'}` : 'Continuing without exact location.'}
          </p>
          <p className="text-sm font-medium text-navy-700 mb-3">What\u2019s the emergency?</p>
          <div className="space-y-2">
            {EMERGENCY_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setEmergencyType(t); setStep('confirm') }}
                className="w-full text-left px-4 py-3 rounded-md border border-ash-200 hover:border-rescue-400 hover:bg-rescue-50/50 text-sm font-medium text-navy-700"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'confirm' && emergencyType && (
        <div>
          <p className="text-sm text-navy-700 mb-1">Send Emergency Assistance?</p>
          <p className="text-sm text-ash-500 mb-6">Emergency type: <span className="font-medium text-navy-700">{emergencyType.label}</span>. This will be flagged as CRITICAL priority and dispatched immediately.</p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setStep('type')}>Back</Button>
            <Button variant="emergency" fullWidth icon={Siren} onClick={handleConfirm}>Confirm SOS</Button>
          </div>
        </div>
      )}

      {step === 'sent' && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-4">
            <Siren size={24} className="text-success-500" />
          </div>
          <p className="font-display font-semibold text-navy-700">Emergency request sent</p>
          <p className="text-sm text-ash-500 mt-1">Redirecting to live tracking…</p>
        </div>
      )}
    </Modal>
  )
}
