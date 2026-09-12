import * as Icons from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ServiceCard({ service, to = '/customer/assistance/problem' }) {
  const Icon = Icons[service.icon] || Icons.Wrench
  return (
    <div className="group rounded-lg border border-ash-200 bg-white p-6 hover:border-rescue-300 hover:shadow-card transition-all">
      <div className="w-11 h-11 rounded-md bg-rescue-50 flex items-center justify-center text-rescue-500 mb-4 group-hover:bg-rescue-500 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <h3 className="font-display font-semibold text-navy-700">{service.name}</h3>
      <p className="text-sm text-ash-500 mt-1.5 leading-relaxed">{service.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-medium text-ash-500">Response: {service.eta}</span>
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-semibold text-rescue-500 hover:text-rescue-600">
          Request <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
