import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Wrench, History, Wallet, Bell, User } from 'lucide-react'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

const NAV_ITEMS = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/provider/requests', label: 'Requests', icon: ClipboardList },
  { to: '/provider/active-service', label: 'Active Service', icon: Wrench },
  { to: '/provider/history', label: 'History', icon: History },
  { to: '/provider/earnings', label: 'Earnings', icon: Wallet },
  { to: '/provider/notifications', label: 'Notifications', icon: Bell },
  { to: '/provider/profile', label: 'Profile', icon: User },
]

const TITLES = {
  '/provider/dashboard': 'Dashboard',
  '/provider/requests': 'Requests',
  '/provider/active-service': 'Active Service',
  '/provider/history': 'History',
  '/provider/earnings': 'Earnings',
  '/provider/notifications': 'Notifications',
  '/provider/profile': 'Profile',
}

export default function ProviderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'RoadResQ Provider'

  return (
    <div className="min-h-screen flex bg-ash-50">
      <Sidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          notificationsPath="/provider/notifications"
          profilePath="/provider/profile"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
