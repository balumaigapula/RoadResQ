import api from './api'
import storage from '../utils/storage'
import { mockNotifications } from '../data/notifications'

function mapNotification(n) {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.notification_type || n.type || 'REQUEST_RECEIVED',
    read: Boolean(n.is_read ?? n.read),
    createdAt: n.created_at || n.createdAt || new Date().toISOString(),
    requestId: n.request_number || n.requestId || null,
  }
}

function seedIfEmpty() {
  const existing = storage.get(storage.keys.notifications)
  if (!existing) storage.set(storage.keys.notifications, mockNotifications)
}

async function getNotifications() {
  try {
    const res = await api.get('/notifications/')
    const list = res.data.data || res.data || []
    const mapped = list.map(mapNotification)
    storage.set(storage.keys.notifications, mapped)
    return mapped
  } catch (err) {
    seedIfEmpty()
    return storage.get(storage.keys.notifications, [])
  }
}

async function markAsRead(id) {
  try {
    await api.post(`/notifications/${id}/read/`)
  } catch (err) {
    // Continue
  }
  const list = storage.get(storage.keys.notifications, [])
  const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n))
  storage.set(storage.keys.notifications, updated)
  return updated
}

async function markAllAsRead() {
  try {
    await api.post('/notifications/read-all/')
  } catch (err) {
    // Continue
  }
  const list = storage.get(storage.keys.notifications, [])
  const updated = list.map((n) => ({ ...n, read: true }))
  storage.set(storage.keys.notifications, updated)
  return updated
}

export const notificationService = { getNotifications, markAsRead, markAllAsRead }
export default notificationService