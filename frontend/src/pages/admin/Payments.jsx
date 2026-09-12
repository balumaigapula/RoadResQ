import { mockPayments } from '../../data/payments'
import StatusBadge from '../../components/common/StatusBadge'

export default function AdminPayments() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Payments</h2>
      <p className="text-ash-500 text-sm mb-6">All transactions processed on the platform.</p>

      <div className="rounded-lg border border-ash-200 bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-ash-50 text-ash-500 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Transaction ID</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Provider</th>
              <th className="text-left px-5 py-3 font-medium">Amount</th>
              <th className="text-left px-5 py-3 font-medium">Method</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ash-200">
            {mockPayments.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3.5 font-mono text-xs text-ash-500">{p.id}</td>
                <td className="px-5 py-3.5 font-medium text-navy-700">{p.customer}</td>
                <td className="px-5 py-3.5 text-ash-600">{p.provider}</td>
                <td className="px-5 py-3.5 font-medium text-navy-700">₹{p.amount}</td>
                <td className="px-5 py-3.5 text-ash-600">{p.method}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3.5 text-ash-600">{new Date(p.date).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
