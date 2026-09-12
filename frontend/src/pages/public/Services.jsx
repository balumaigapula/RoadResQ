import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { SERVICES } from '../../data/services'

export default function Services() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-xl mb-12">
        <p className="text-rescue-500 font-display text-sm font-semibold mb-2">Services</p>
        <h1 className="font-display text-4xl font-bold text-navy-700">Everything RoadResQ can handle</h1>
        <p className="text-ash-500 mt-3">Pick the closest match to your situation — we\u2019ll route the right specialist and give you an estimated response time before you confirm.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s) => {
          const Icon = Icons[s.icon] || Icons.Wrench
          return (
            <div key={s.id} className="rounded-lg border border-ash-200 p-6 hover:border-rescue-300 hover:shadow-card transition-all flex flex-col">
              <div className="w-11 h-11 rounded-md bg-rescue-50 flex items-center justify-center text-rescue-500 mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-navy-700">{s.name}</h3>
              <p className="text-sm text-ash-500 mt-1.5 leading-relaxed flex-1">{s.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-medium text-ash-500">Response: {s.eta}</span>
                <Link to="/register" className="inline-flex items-center gap-1 text-sm font-semibold text-rescue-500 hover:text-rescue-600">
                  Request <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
