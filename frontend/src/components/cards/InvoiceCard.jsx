import { Link } from 'react-router-dom'
import { FileText } from 'lucide-react'
import Button from '../common/Button'

export default function InvoiceCard({ invoice }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-md bg-rescue-50 flex items-center justify-center text-rescue-500 shrink-0">
        <FileText size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-navy-700">{invoice.id}</p>
        <p className="text-xs text-ash-500 mt-0.5">{invoice.service} · {new Date(invoice.date).toLocaleDateString('en-IN')}</p>
      </div>
      <div className="text-right shrink-0 flex items-center gap-3">
        <span className="font-display font-semibold text-navy-700">₹{invoice.total}</span>
        <Link to={`/customer/invoices/${invoice.id}`}><Button size="sm" variant="outline">View</Button></Link>
      </div>
    </div>
  )
}
