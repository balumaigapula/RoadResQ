import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import Logo from './Logo'

export default function Sidebar({ items, open, onClose, footer }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-navy-900/60 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-navy-800 text-ash-300 flex flex-col z-50 transition-transform duration-200 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
          <Logo size="sm" className="brightness-0 invert" />
          <button className="lg:hidden text-ash-400" onClick={onClose} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-rescue-500 text-white' : 'text-ash-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
              {item.badge ? (
                <span className="ml-auto text-[10px] bg-rescue-500 text-white rounded-full px-1.5 py-0.5">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {footer && <div className="p-4 border-t border-white/10">{footer}</div>}
      </aside>
    </>
  )
}
