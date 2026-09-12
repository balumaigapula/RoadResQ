import api from './api'
import storage from '../utils/storage'
import { mockUsers } from '../data/users'

function mapUser(u) {
  if (!u) return null
  const fullName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.fullName || 'User'
  const role = (u.role || 'customer').toLowerCase()
  return {
    ...u,
    id: u.id,
    fullName,
    email: u.email,
    phone: u.phone || '',
    role,
    avatar: u.profile_image || u.avatar || null,
    profileImage: u.profile_image || u.avatar || null,
    isVerified: Boolean(u.is_verified),
  }
}

async function login({ email, password }) {
  storage.remove(storage.keys.authToken)
  try {
    const res = await api.post('/auth/login/', { email, password })
    const { access, refresh, user: rawUser } = res.data.data
    const user = mapUser(rawUser)
    storage.set(storage.keys.authToken, access)
    storage.set(storage.keys.refreshToken, refresh)
    storage.set(storage.keys.authUser, user)
    storage.set(storage.keys.role, user.role)
    return { user, token: access }
  } catch (err) {
    if (!err.response || err.message?.includes('Network Error')) {
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
      if (user && password.length >= 4) {
        const token = `mock-token-${user.id}`
        storage.set(storage.keys.authToken, token)
        storage.set(storage.keys.authUser, user)
        storage.set(storage.keys.role, user.role)
        return { user, token }
      }
    }
    throw err
  }
}

async function register(payload) {
  try {
    const parts = (payload.fullName || '').trim().split(' ')
    const first_name = parts[0] || 'User'
    const last_name = parts.slice(1).join(' ') || ''
    const role = (payload.role || 'customer').toUpperCase()
    const body = {
      first_name,
      last_name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      confirm_password: payload.confirmPassword || payload.confirm_password || payload.password,
      role,
    }
    const res = await api.post('/auth/register/', body)
    storage.set('roadresq:pending_registration', payload)
    return res.data
  } catch (err) {
    if (!err.response || err.message?.includes('Network Error')) {
      if (mockUsers.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
        throw { message: 'An account with this email already exists.' }
      }
      storage.set('roadresq:pending_registration', payload)
      return { success: true, email: payload.email }
    }
    throw err
  }
}

async function verifyOTP({ email, otp }) {
  if (!/^\d{6}$/.test(otp)) {
    throw { message: 'Enter the full 6-digit code.' }
  }
  try {
    const res = await api.post('/auth/verify-otp/', { email, otp })
    return res.data
  } catch (err) {
    if (!err.response || err.message?.includes('Network Error')) {
      throw {
        message: 'OTP verification requires the RoadResQ backend, which is currently unreachable.',
        code: 'BACKEND_NOT_CONNECTED',
      }
    }
    throw err
  }
}

async function resendOTP({ email }) {
  try {
    const res = await api.post('/auth/resend-otp/', { email })
    return res.data
  } catch (err) {
    if (!err.response) {
      return { success: true, message: `A new code will be sent to ${email}.` }
    }
    throw err
  }
}

async function forgotPassword({ email }) {
  try {
    const res = await api.post('/auth/forgot-password/', { email })
    return res.data
  } catch (err) {
    if (!err.response) {
      return { success: true, email }
    }
    throw err
  }
}

async function resetPassword({ email, otp, password, confirmPassword }) {
  try {
    const res = await api.post('/auth/reset-password/', {
      email,
      otp,
      password,
      confirm_password: confirmPassword || password,
    })
    return res.data
  } catch (err) {
    if (!err.response) {
      throw {
        message: 'Password reset requires the RoadResQ backend connection.',
        code: 'BACKEND_NOT_CONNECTED',
      }
    }
    throw err
  }
}

async function updateProfile(patch) {
  try {
    const body = {}
    if (patch.fullName) {
      const parts = patch.fullName.trim().split(' ')
      body.first_name = parts[0]
      body.last_name = parts.slice(1).join(' ')
    }
    if (patch.phone) body.phone = patch.phone
    const res = await api.patch('/auth/profile/', body)
    const updated = mapUser(res.data.data)
    storage.set(storage.keys.authUser, updated)
    return updated
  } catch (err) {
    const current = getCurrentUser() || {}
    const updated = { ...current, ...patch }
    storage.set(storage.keys.authUser, updated)
    return updated
  }
}

async function uploadProfileImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await api.post('/auth/profile/image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const updated = mapUser(res.data.data)
  storage.set(storage.keys.authUser, updated)
  return updated
}

async function logout() {
  try {
    const refresh = storage.get(storage.keys.refreshToken)
    if (refresh) {
      await api.post('/auth/logout/', { refresh })
    }
  } catch (e) {
    // Ignore logout errors
  } finally {
    storage.clearAll()
  }
}

function getCurrentUser() {
  return storage.get(storage.keys.authUser)
}

function isAuthenticated() {
  return Boolean(storage.get(storage.keys.authToken))
}

async function verifyEmailToken(token) {
  if (!token) {
    throw { message: 'Invalid or missing verification token.' }
  }
  const res = await api.get(`/auth/verify-email/${encodeURIComponent(token)}/`)
  return res.data
}

async function resendVerification({ email }) {
  if (!email) {
    throw { message: 'Please provide an email address.' }
  }
  const res = await api.post('/auth/resend-verification/', { email })
  return res.data
}

export const authService = {
  login,
  register,
  verifyOTP,
  resendOTP,
  verifyEmailToken,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
  uploadProfileImage,
  logout,
  getCurrentUser,
  isAuthenticated,
  mapUser,
}
export default authService