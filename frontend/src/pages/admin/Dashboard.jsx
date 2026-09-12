import { Users, Wrench, ClipboardList, CheckCircle2, XCircle, IndianRupee, Star } from 'lucide-react'

const CARDS = [
  { label: 'Total Customers', value: '12,480', icon: Users, tone: 'text-info-600 bg-info-50' },
  { label: 'Total Providers', value: '2,410', icon: Wrench, tone: 'text-navy-600 bg-navy-50' },
  { label: 'Active Requests', value: '86', icon: ClipboardList, tone: 'text-warning-600 bg-warning-50' },
  { label: 'Completed Requests', value: '48,920', icon: CheckCircle2, tone: 'text-success-600 bg-success-50' },
  { label: 'Cancelled Requests', value: '1,204', icon: XCircle, tone: 'text-danger-600 bg-danger-50' },
  { label: 'Revenue', value: '₹42.8L', icon: IndianRupee, tone: 'text-rescue-600 bg-rescue-50' },
  { label: 'Average Rating', value: '4.7', icon: Star, tone: 'text-warning-600 bg-warning-50' },
]

const REQUESTS_TREND = [40, 55, 48, 62, 70, 58, 75]
const REVENUE_TREND = [12, 18, 15, 22, 27, 24, 30]
const CATEGORY_SPLIT = [
  { label: 'Mechanic', value: 32, color: 'bg-navy-600' },
  { label: 'Battery', value: 22, color: 'bg-rescue-500' },
  { label: 'Tyre', value: 18, color: 'bg-info-500' },
  { label: 'Towing', value: 14, color: 'bg-warning-500' },
  { label: 'Fuel', value: 14, color: 'bg-success-500' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((c) => (
          <div key={c.label} className="rounded-lg border border-ash-200 bg-white p-5">
            <span className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${c.tone}`}><c.icon size={17} /></span>
            <p className="font-display text-xl font-bold text-navy-700">{c.value}</p>
            <p className="text-xs text-ash-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Requests over time" data={REQUESTS_TREND} color="bg-navy-600" />
        <ChartCard title="Revenue (₹ thousands)" data={REVENUE_TREND} color="bg-rescue-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-5">Service categories</h3>
          <div className="space-y-3">
            {CATEGORY_SPLIT.map((c) => (
              <div key={c.label}>
                <div className="flex justify-between text-xs mb-1"><span className="text-navy-700 font-medium">{c.label}</span><span className="text-ash-500">{c.value}%</span></div>
                <div className="h-2 rounded-full bg-ash-100 overflow-hidden"><div className={`h-full ${c.color}`} style={{ width: `${c.value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-5">Peak hours</h3>
          <div className="flex items-end justify-between gap-1.5 h-32">
            {[20, 35, 25, 60, 90, 75, 55, 40, 65, 80, 45, 30].map((v, i) => (
              <div key={i} className="flex-1 bg-navy-100 rounded-t-sm relative group">
                <div className="w-full bg-navy-600 rounded-t-sm absolute bottom-0" style={{ height: `${v}%` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-ash-400 mt-2"><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span></div>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, data, color }) {
  const max = Math.max(...data)
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-5">
      <h3 className="font-display font-semibold text-navy-700 mb-5">{title}</h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className={`w-full ${color} rounded-t-sm`} style={{ height: `${(v / max) * 100}%` }} />
            <span className="text-[10px] text-ash-400">D{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
