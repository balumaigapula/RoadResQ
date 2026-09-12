import ConfirmDialog from '../common/ConfirmDialog'

export default function DeleteDialog({ open, onClose, onConfirm, itemLabel = 'this item', loading }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={`Delete ${itemLabel}?`}
      description="This can't be undone."
      confirmLabel="Delete"
      variant="danger"
      loading={loading}
    />
  )
}
