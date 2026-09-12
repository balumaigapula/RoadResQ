import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import PaymentCard from '../../components/cards/PaymentCard'
import EmptyState from '../../components/common/EmptyState'
import { mockPayments } from '../../data/payments'

export default function Payments() {
  const [payments, setPayments] = useState([])

  useEffect(() => {
    setPayments(mockPayments)
  }, [])

  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Payments</h2>
      <p className="text-ash-500 text-sm mb-6">Your transaction history across all requests.</p>

      <div className="rounded-lg border border-ash-200 bg-white p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-ash-500">Total paid</p>
          <p className="font-display text-2xl font-bold text-navy-700">₹{total.toLocaleString('en-IN')}</p>
        </div>
        <CreditCard size={28} className="text-rescue-500" />
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet." description="Payments for completed services will appear here." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {payments.map((p) => <PaymentCard key={p.id} payment={p} />)}
        </div>
      )}
    </div>
  )
}
