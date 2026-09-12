import { IndianRupee, TrendingUp, CheckCircle2 } from 'lucide-react'

const DAILY = [
  { label: 'Mon', value: 1200 }, { label: 'Tue', value: 1800 }, { label: 'Wed', value: 900 },
  { label: 'Thu', value: 2150 }, { label: 'Fri', value: 1650 }, { label: 'Sat', value: 2400 }, { label: 'Sun', value: 1100 },
]
const MONTHLY = [
  { label: 'Apr', value: 28000 }, { label: 'May', value: 31500 }, { label: 'Jun', value: 26800 },
  { label: 'Jul', value: 35200 }, { label: 'Aug', value: 38420 },
]

export default function Earnings() {
  const maxDaily = Math.max(...DAILY.map((d) => d.value))
  const maxMonthly = Math.max(...MONTHLY.map((d) => d.value))

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Earnings</h2>
      <p className="text-ash-500 text-sm mb-6">Track your income across services.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Today" value="₹2,150" />
        <StatCard icon={TrendingUp} label="This Week" value="₹11,200" />
        <StatCard icon={TrendingUp} label="This Month" value="₹38,420" />
        <StatCard icon={CheckCircle2} label="Total Earned" value="₹1,84,900" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-5">Daily earnings (this week)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {DAILY.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-rescue-500 rounded-t-sm transition-all" style={{ height: `${(d.value / maxDaily) * 100}%` }} />
                <span className="text-[10px] text-ash-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <h3 className="font-display font-semibold text-navy-700 mb-5">Monthly earnings</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {MONTHLY.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-navy-600 rounded-t-sm transition-all" style={{ height: `${(d.value / maxMonthly) * 100}%` }} />
                <span className="text-[10px] text-ash-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-5">
      <Icon size={18} className="text-rescue-500 mb-3" />
      <p className="font-display text-xl font-bold text-navy-700">{value}</p>
      <p className="text-xs text-ash-500 mt-1">{label}</p>
    </div>
  )
}
