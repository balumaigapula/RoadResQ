import StatusBadge from '../common/StatusBadge'
import { CreditCard } from 'lucide-react'

export default function PaymentCard({ payment }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-md bg-navy-50 flex items-center justify-center text-navy-600 shrink-0">
        <CreditCard size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-ash-400">{payment.id}</p>
        <p className="font-display font-semibold text-navy-700 truncate">{payment.provider}</p>
        <p className="text-xs text-ash-500 mt-0.5">{payment.method} · {new Date(payment.date).toLocaleDateString('en-IN')}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-display font-semibold text-navy-700">₹{payment.amount}</p>
        <StatusBadge status={payment.status} className="mt-1" />
      </div>
    </div>
  )
}
