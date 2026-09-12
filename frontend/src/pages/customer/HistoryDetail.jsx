import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Car, User, Calendar, IndianRupee } from 'lucide-react'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import assistanceService from '../../services/assistanceService'
import { mockRequestsSeed } from '../../data/requests'

export default function HistoryDetail() {
  const { serviceId } = useParams()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    assistanceService.getRequestById(serviceId)
      .then(setRecord)
      .catch(() => {
        const seeded = mockRequestsSeed.find((r) => r.id === serviceId)
        setRecord(seeded || null)
      })
      .finally(() => setLoading(false))
  }, [serviceId])

  if (loading) return <Loader full label="Loading service details…" />
  if (!record) return <p className="text-sm text-ash-500">Service record not found.</p>

  return (
    <div className="max-w-xl">
      <Link to="/customer/history" className="inline-flex items-center gap-1.5 text-sm text-ash-500 hover:text-navy-700 mb-5">
        <ArrowLeft size={15} /> Back to history
      </Link>

      <div className="rounded-lg border border-ash-200 bg-white p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-mono text-ash-400">{record.id}</p>
            <h1 className="font-display text-xl font-bold text-navy-700 mt-0.5">{record.service}</h1>
          </div>
          <StatusBadge status={record.status} />
        </div>

        <div className="space-y-3 text-sm">
          <DetailRow icon={Car} label="Vehicle" value={record.vehicle || '—'} />
          <DetailRow icon={User} label="Provider" value={record.providerName || '—'} />
          <DetailRow icon={Calendar} label="Date" value={new Date(record.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
          <DetailRow icon={IndianRupee} label="Amount" value={`₹${record.amount ?? '—'}`} />
        </div>

        <div className="mt-6 pt-6 border-t border-ash-200 flex gap-3">
          <Link to={`/customer/review/${record.id}`} className="flex-1">
            <Button fullWidth variant="outline" icon={Star}>Rate this service</Button>
          </Link>
          <Link to={`/customer/invoices/INV-2026-0842`} className="flex-1">
            <Button fullWidth>View Invoice</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-ash-400 shrink-0" />
      <span className="text-ash-500 w-24 shrink-0">{label}</span>
      <span className="font-medium text-navy-700">{value}</span>
    </div>
  )
}
