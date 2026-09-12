import { useEffect, useState } from 'react'
import { Plus, Car } from 'lucide-react'
import Button from '../../components/common/Button'
import VehicleCard from '../../components/cards/VehicleCard'
import VehicleModal from '../../components/modals/VehicleModal'
import DeleteDialog from '../../components/modals/DeleteDialog'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import vehicleService from '../../services/vehicleService'
import { useToast } from '../../context/ToastContext'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  function load() {
    setLoading(true)
    vehicleService.getVehicles().then((v) => { setVehicles(v); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(data) {
    setSaving(true)
    try {
      if (editing) {
        await vehicleService.updateVehicle(editing.id, data)
        showToast('Vehicle updated successfully.')
      } else {
        await vehicleService.addVehicle(data)
        showToast('Vehicle added successfully.')
      }
      setModalOpen(false)
      setEditing(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    await vehicleService.deleteVehicle(deleting.id)
    showToast('Vehicle removed.')
    setDeleting(null)
    load()
  }

  async function handleSetPrimary(v) {
    await vehicleService.setPrimary(v.id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-700">My Vehicles</h2>
          <p className="text-ash-500 text-sm mt-0.5">Manage the vehicles linked to your account.</p>
        </div>
        <Button icon={Plus} onClick={() => { setEditing(null); setModalOpen(true) }}>Add Vehicle</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : vehicles.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles added yet." description="Add your first vehicle to start requesting roadside help." action={<Button icon={Plus} onClick={() => setModalOpen(true)}>Add Vehicle</Button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={(v) => { setEditing(v); setModalOpen(true) }}
              onDelete={setDeleting}
              onSetPrimary={handleSetPrimary}
            />
          ))}
        </div>
      )}

      <VehicleModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={handleSubmit}
        defaultValues={editing}
        loading={saving}
      />
      <DeleteDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={handleDelete} itemLabel={deleting ? `${deleting.brand} ${deleting.model}` : 'this vehicle'} />
    </div>
  )
}
