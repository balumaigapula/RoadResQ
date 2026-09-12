import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import NotificationItem from '../../components/notifications/NotificationItem'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import { Skeleton } from '../../components/common/Skeleton'
import notificationService from '../../services/notificationService'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    notificationService.getNotifications().then((n) => { setNotifications(n); setLoading(false) })
  }, [])

  async function handleRead(id) {
    const updated = await notificationService.markAsRead(id)
    setNotifications(updated)
  }

  async function handleReadAll() {
    const updated = await notificationService.markAllAsRead()
    setNotifications(updated)
  }

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold text-navy-700">Notifications</h2>
          <p className="text-ash-500 text-sm mt-0.5">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <Button size="sm" variant="outline" icon={CheckCheck} onClick={handleReadAll}>Mark all as read</Button>}
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'unread'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize ${filter === f ? 'bg-navy-700 text-white' : 'bg-ash-100 text-ash-600'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up." description="New notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => <NotificationItem key={n.id} notification={n} onRead={handleRead} />)}
        </div>
      )}
    </div>
  )
}
