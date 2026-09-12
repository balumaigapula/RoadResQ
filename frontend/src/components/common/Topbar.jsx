import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick, title, notificationsPath, profilePath }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-ash-200 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-navy-700" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <h1 className="font-display font-semibold text-navy-700 text-base sm:text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => navigate(notificationsPath)}
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-navy-600 hover:bg-ash-100"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rescue-500" />
        </button>

        <div className="relative">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-ash-100">
            <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-display font-semibold text-sm overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                (user?.fullName || 'U').charAt(0)
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-navy-700">{user?.fullName?.split(' ')[0] || 'Account'}</span>
            <ChevronDown size={14} className="hidden sm:block text-ash-400" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-panel border border-ash-200 py-1.5 animate-rise">
              <button
                onClick={() => { setOpen(false); navigate(profilePath) }}
                className="w-full text-left px-4 py-2 text-sm text-navy-700 hover:bg-ash-100"
              >
                My Profile
              </button>
              <button
                onClick={() => { setOpen(false); logout(); navigate('/login') }}
                className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 flex items-center gap-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
