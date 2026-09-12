import * as Icons from 'lucide-react'

const TYPE_ICON = {
  REQUEST_RECEIVED: 'Inbox',
  PROVIDER_FOUND: 'UserCheck',
  PROVIDER_ACCEPTED: 'CheckCircle2',
  PROVIDER_ON_THE_WAY: 'Navigation',
  PROVIDER_ARRIVED: 'MapPin',
  SERVICE_COMPLETED: 'CircleCheckBig',
  PAYMENT_SUCCESSFUL: 'IndianRupee',
}

export default function NotificationItem({ notification, onRead }) {
  const Icon = Icons[TYPE_ICON[notification.type]] || Icons.Bell
  return (
    <button
      onClick={() => !notification.read && onRead?.(notification.id)}
      className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors ${
        notification.read ? 'bg-white border-ash-200' : 'bg-rescue-50/40 border-rescue-200'
      }`}
    >
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-ash-100 text-ash-500' : 'bg-rescue-500 text-white'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-navy-700">{notification.title}</p>
        <p className="text-sm text-ash-500 mt-0.5">{notification.message}</p>
        <p className="text-xs text-ash-400 mt-1">{new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </div>
      {!notification.read && <span className="w-2 h-2 rounded-full bg-rescue-500 mt-1.5 shrink-0" />}
    </button>
  )
}
