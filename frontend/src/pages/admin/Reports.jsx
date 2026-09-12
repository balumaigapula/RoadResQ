const REPORT_TYPES = [
  { title: 'Request Reports', desc: 'Volume, completion rate and cancellations over any date range.' },
  { title: 'Revenue Reports', desc: 'Gross revenue, provider payouts and platform commission.' },
  { title: 'Provider Performance', desc: 'Acceptance rate, average rating and completed jobs per provider.' },
  { title: 'Service Category Reports', desc: 'Demand breakdown across mechanical, tyre, battery, fuel and towing.' },
  { title: 'Customer Activity', desc: 'Retention, repeat requests and average spend per customer.' },
]

export default function AdminReports() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Reports</h2>
      <p className="text-ash-500 text-sm mb-6">Generate and export platform-wide reports.</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {REPORT_TYPES.map((r) => (
          <div key={r.title} className="rounded-lg border border-ash-200 bg-white p-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-semibold text-navy-700">{r.title}</h3>
              <p className="text-sm text-ash-500 mt-1">{r.desc}</p>
            </div>
            <button className="shrink-0 text-xs font-semibold text-rescue-500 hover:text-rescue-600 border border-rescue-200 rounded-md px-3 py-1.5">Generate</button>
          </div>
        ))}
      </div>
    </div>
  )
}
