import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import Logo from './Logo'

const columns = [
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About Us' },
      { to: '/contact', label: 'Contact' },
      { to: '/how-it-works', label: 'How It Works' },
    ],
  },
  {
    heading: 'Services',
    links: [
      { to: '/services', label: 'All Services' },
      { to: '/services', label: 'Towing' },
      { to: '/services', label: 'Battery Assistance' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { to: '/login', label: 'Login' },
      { to: '/register', label: 'Create Account' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-ash-300">
      <div className="container-page py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <Logo size="md" className="brightness-0 invert" />
          <p className="mt-4 text-sm text-ash-400 max-w-xs">
            On-demand roadside assistance for every mechanical, tyre, battery, fuel and towing emergency — dispatched to wherever you are.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-ash-400"><Phone size={14} /> 1800-123-4567</div>
            <div className="flex items-center gap-2 text-ash-400"><Mail size={14} /> support@roadresq.in</div>
            <div className="flex items-center gap-2 text-ash-400"><MapPin size={14} /> Hyderabad, Telangana, India</div>
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="font-display text-sm font-semibold text-white mb-3">{col.heading}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l, i) => (
                <li key={l.label + i}>
                  <Link to={l.to} className="hover:text-rescue-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="route-line container-page" />
      <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ash-500">
        <p>© {new Date().getFullYear()} RoadResQ. All rights reserved.</p>
        <p>Help On Every Mile</p>
      </div>
    </footer>
  )
}
