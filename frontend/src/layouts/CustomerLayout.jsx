import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Siren, Car, ClipboardList, History, CreditCard, Bell, User, Sparkles } from 'lucide-react'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

const NAV_ITEMS = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/customer/assistance/location', label: 'Emergency Assistance', icon: Siren },
  { to: '/customer/vehicles', label: 'My Vehicles', icon: Car },
  { to: '/customer/requests', label: 'My Requests', icon: ClipboardList },
  { to: '/customer/ai-assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/customer/history', label: 'Service History', icon: History },
  { to: '/customer/payments', label: 'Payments', icon: CreditCard },
  { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  { to: '/customer/profile', label: 'Profile', icon: User },
]

const TITLES = {
  '/customer/dashboard': 'Dashboard',
  '/customer/vehicles': 'My Vehicles',
  '/customer/requests': 'My Requests',
  '/customer/ai-assistant': 'AI Breakdown Assistant',
  '/customer/history': 'Service History',
  '/customer/payments': 'Payments',
  '/customer/notifications': 'Notifications',
  '/customer/profile': 'Profile',
}

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'RoadResQ'

  return (
    <div className="min-h-screen flex bg-ash-50">
      <Sidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          notificationsPath="/customer/notifications"
          profilePath="/customer/profile"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
