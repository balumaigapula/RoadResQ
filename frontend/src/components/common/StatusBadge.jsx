const STATUS_MAP = {
  REQUESTED: { label: 'Requested', tone: 'info' },
  SEARCHING: { label: 'Searching', tone: 'info' },
  PROVIDER_ASSIGNED: { label: 'Provider Assigned', tone: 'info' },
  ACCEPTED: { label: 'Accepted', tone: 'info' },
  ON_THE_WAY: { label: 'On The Way', tone: 'warning' },
  ARRIVED: { label: 'Arrived', tone: 'warning' },
  REPAIRING: { label: 'Repairing', tone: 'warning' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  PENDING: { label: 'Pending', tone: 'warning' },
  ACTIVE: { label: 'Active', tone: 'info' },
  PAID: { label: 'Paid', tone: 'success' },
  UNPAID: { label: 'Unpaid', tone: 'danger' },
  APPROVED: { label: 'Approved', tone: 'success' },
  REJECTED: { label: 'Rejected', tone: 'danger' },
  SUSPENDED: { label: 'Suspended', tone: 'danger' },
  CRITICAL: { label: 'Critical', tone: 'danger' },
  HIGH: { label: 'High', tone: 'warning' },
  NORMAL: { label: 'Normal', tone: 'neutral' },
}

const TONES = {
  success: 'bg-success-50 text-success-600',
  warning: 'bg-warning-50 text-warning-600',
  danger: 'bg-danger-50 text-danger-600',
  info: 'bg-info-50 text-info-600',
  neutral: 'bg-ash-100 text-ash-600',
}

export default function StatusBadge({ status, className = '' }) {
  const entry = STATUS_MAP[status] || { label: status, tone: 'neutral' }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-semibold ${TONES[entry.tone]} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {entry.label}
    </span>
  )
}
