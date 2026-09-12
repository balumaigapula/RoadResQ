import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import NotificationItem from '../../components/notifications/NotificationItem'
import EmptyState from '../../components/common/EmptyState'
import notificationService from '../../services/notificationService'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => { notificationService.getNotifications().then(setNotifications) }, [])

  async function handleRead(id) {
    setNotifications(await notificationService.markAsRead(id))
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-bold text-navy-700 mb-6">Notifications</h2>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications." />
      ) : (
        <div className="space-y-3">{notifications.map((n) => <NotificationItem key={n.id} notification={n} onRead={handleRead} />)}</div>
      )}
    </div>
  )
}
