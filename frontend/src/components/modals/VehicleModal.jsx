import Modal from '../common/Modal'
import VehicleForm from '../forms/VehicleForm'

export default function VehicleModal({ open, onClose, onSubmit, defaultValues, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={defaultValues ? 'Edit Vehicle' : 'Add Vehicle'}>
      <VehicleForm
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel={defaultValues ? 'Save Changes' : 'Add Vehicle'}
        loading={loading}
      />
    </Modal>
  )
}
