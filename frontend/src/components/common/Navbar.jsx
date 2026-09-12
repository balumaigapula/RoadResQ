import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Siren } from 'lucide-react'
import Logo from './Logo'
import Button from './Button'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const dashboardPath = role ? `/${role}/dashboard` : '/login'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ash-200">
      <div className="container-page flex items-center justify-between h-16">
        <Logo size="md" />

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 text-sm font-medium rounded-sm transition-colors ${
                  isActive ? 'text-rescue-600' : 'text-navy-600 hover:text-rescue-500'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <Button size="sm" onClick={() => navigate(dashboardPath)}>Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" icon={Siren} onClick={() => navigate('/register')}>Get Help Now</Button>
            </>
          )}
        </div>

        <button className="lg:hidden text-navy-700" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-ash-200 bg-white px-5 py-4 space-y-1 animate-rise">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-sm text-sm font-medium ${isActive ? 'bg-rescue-50 text-rescue-600' : 'text-navy-600'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button onClick={() => { setOpen(false); navigate(dashboardPath) }}>Dashboard</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setOpen(false); navigate('/login') }}>Login</Button>
                <Button icon={Siren} onClick={() => { setOpen(false); navigate('/register') }}>Get Help Now</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
