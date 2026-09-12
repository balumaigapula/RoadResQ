import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Plus } from 'lucide-react'
import FlowStepper from '../../components/common/FlowStepper'
import VehicleCard from '../../components/cards/VehicleCard'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import VehicleModal from '../../components/modals/VehicleModal'
import vehicleService from '../../services/vehicleService'
import assistanceService from '../../services/assistanceService'
import { Car } from 'lucide-react'

export default function AssistanceVehicle() {
  const navigate = useNavigate()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    vehicleService.getVehicles().then((v) => {
      setVehicles(v)
      const primary = v.find((x) => x.isPrimary) || v[0]
      if (primary) setSelectedId(primary.id)
      setLoading(false)
    })
  }, [])

  async function handleAddVehicle(data) {
    setSaving(true)
    try {
      const newVehicle = await vehicleService.addVehicle(data)
      setVehicles((v) => [...v, newVehicle])
      setSelectedId(newVehicle.id)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleContinue() {
    const vehicle = vehicles.find((v) => v.id === selectedId)
    await vehicleService.selectVehicle(selectedId)
    assistanceService.updateFlow({ vehicle })
    navigate('/customer/assistance/problem')
  }

  if (loading) return <Loader label="Loading your vehicles…" />

  return (
    <div className="max-w-2xl">
      <FlowStepper current="Vehicle" />
      <h2 className="font-display text-2xl font-bold text-navy-700 mb-1">Which vehicle needs help?</h2>
      <p className="text-ash-500 text-sm mb-6">Select a saved vehicle, or add a new one.</p>

      {vehicles.length === 0 ? (
        <EmptyState
          icon={Car}
          title="No vehicles added yet."
          description="Add a vehicle to continue with your request."
          action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Add Vehicle</Button>}
        />
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} onClick={() => setSelectedId(v.id)} className={`rounded-lg cursor-pointer transition-all ${selectedId === v.id ? 'ring-2 ring-rescue-500' : ''}`}>
              <VehicleCard vehicle={v} />
            </div>
          ))}
          <button onClick={() => setModalOpen(true)} className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-ash-300 py-4 text-sm font-medium text-ash-500 hover:border-rescue-400 hover:text-rescue-500">
            <Plus size={16} /> Add another vehicle
          </button>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Link to="/customer/assistance/location"><Button variant="outline" icon={ArrowLeft}>Back</Button></Link>
        <Button size="lg" icon={ArrowRight} iconPosition="right" disabled={!selectedId} onClick={handleContinue}>Continue</Button>
      </div>

      <VehicleModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAddVehicle} loading={saving} />
    </div>
  )
}
