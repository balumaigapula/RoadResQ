import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, ClipboardList, CreditCard, Star, FileBarChart, Bell, Settings, User } from 'lucide-react'
import Sidebar from '../components/common/Sidebar'
import Topbar from '../components/common/Topbar'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/providers', label: 'Providers', icon: Wrench },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/reports', label: 'Reports', icon: FileBarChart },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'Profile', icon: User },
]

const TITLES = {
  '/admin/dashboard': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/providers': 'Providers',
  '/admin/requests': 'Requests',
  '/admin/payments': 'Payments',
  '/admin/reviews': 'Reviews',
  '/admin/reports': 'Reports',
  '/admin/notifications': 'Notifications',
  '/admin/settings': 'Settings',
  '/admin/profile': 'Profile',
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'RoadResQ Admin'

  return (
    <div className="min-h-screen flex bg-ash-50">
      <Sidebar items={NAV_ITEMS} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          notificationsPath="/admin/notifications"
          profilePath="/admin/profile"
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
