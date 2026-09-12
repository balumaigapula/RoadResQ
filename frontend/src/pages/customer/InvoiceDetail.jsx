import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, Eye } from 'lucide-react'
import Logo from '../../components/common/Logo'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import Loader from '../../components/common/Loader'
import invoiceService from '../../services/invoiceService'
import { mockInvoices } from '../../data/invoices'
import { useToast } from '../../context/ToastContext'

export default function InvoiceDetail() {
  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const seeded = mockInvoices.find((i) => i.id === invoiceId) || mockInvoices[0]
    setInvoice(seeded)
    setLoading(false)
  }, [invoiceId])

  async function handleDownload() {
    const res = await invoiceService.downloadInvoice(invoiceId)
    showToast(res.message, 'info')
  }

  if (loading) return <Loader full label="Loading invoice…" />

  const { charges } = invoice

  return (
    <div className="max-w-xl">
      <Link to="/customer/history" className="inline-flex items-center gap-1.5 text-sm text-ash-500 hover:text-navy-700 mb-5">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="rounded-lg border border-ash-200 bg-white p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <Logo size="md" linkable={false} />
          <StatusBadge status={invoice.paymentStatus} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-ash-200">
          <div><p className="text-ash-500 text-xs">Invoice Number</p><p className="font-medium text-navy-700">{invoice.id}</p></div>
          <div><p className="text-ash-500 text-xs">Request ID</p><p className="font-medium text-navy-700">{invoice.requestId}</p></div>
          <div><p className="text-ash-500 text-xs">Customer</p><p className="font-medium text-navy-700">{invoice.customer}</p></div>
          <div><p className="text-ash-500 text-xs">Provider</p><p className="font-medium text-navy-700">{invoice.provider}</p></div>
          <div><p className="text-ash-500 text-xs">Vehicle</p><p className="font-medium text-navy-700">{invoice.vehicle}</p></div>
          <div><p className="text-ash-500 text-xs">Date</p><p className="font-medium text-navy-700">{new Date(invoice.date).toLocaleDateString('en-IN')}</p></div>
        </div>

        <h3 className="text-sm font-semibold text-navy-700 mb-3">{invoice.service}</h3>
        <div className="space-y-2 text-sm">
          <ChargeRow label="Service Charge" value={charges.serviceCharge} />
          <ChargeRow label="Travel Charge" value={charges.travelCharge} />
          <ChargeRow label="Parts Cost" value={charges.partsCost} />
          <ChargeRow label="Additional Charges" value={charges.additional} />
        </div>
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-ash-200">
          <span className="font-display font-semibold text-navy-700">Total</span>
          <span className="font-display text-lg font-bold text-navy-700">₹{invoice.total}</span>
        </div>

        <div className="flex gap-3 mt-8">
          <Button variant="outline" fullWidth icon={Eye}>View</Button>
          <Button fullWidth icon={Download} onClick={handleDownload}>Download</Button>
        </div>
      </div>
    </div>
  )
}

function ChargeRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ash-500">{label}</span>
      <span className="text-navy-700">₹{value}</span>
    </div>
  )
}
