import axios from 'axios'
import storage from '../utils/storage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = storage.get(storage.keys.authToken)
  const isAuthRequest = config.url?.includes('/auth/login/') || config.url?.includes('/auth/register/')
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Central place to normalize backend errors and refresh expired tokens
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const errorValueToMessage = (value) => {
  if (Array.isArray(value)) return value.map(errorValueToMessage).filter(Boolean).join(', ')
  if (value && typeof value === 'object') {
    return value.message || value.detail || Object.values(value).map(errorValueToMessage).filter(Boolean).join(', ')
  }
  return value == null ? '' : String(value)
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login/') &&
      !originalRequest.url?.includes('/auth/refresh/')
    ) {
      const refreshToken = storage.get(storage.keys.refreshToken)
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return api(originalRequest)
            })
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh/`, { refresh: refreshToken })
          const newAccess = data.data?.access || data.access
          storage.set(storage.keys.authToken, newAccess)
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
          processQueue(null, newAccess)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        } catch (refreshErr) {
          processQueue(refreshErr, null)
          storage.clearAll()
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          return Promise.reject(refreshErr)
        } finally {
          isRefreshing = false
        }
      }
    }

    const errorsObj = error?.response?.data?.errors
    const rawErrorCode = errorsObj && typeof errorsObj === 'object' ? errorsObj.code : null
    const errorCode = Array.isArray(rawErrorCode) ? rawErrorCode[0] : rawErrorCode
    const detailed = errorsObj && typeof errorsObj === 'object'
      ? Object.entries(errorsObj)
        .filter(([key]) => key !== 'code')
        .map(([, value]) => errorValueToMessage(value))
        .filter(Boolean)
        .join('. ')
      : errorValueToMessage(errorsObj)

    const message =
      (errorCode === 'token_not_valid' ? 'Your session has expired. Please log in again.' : detailed) ||
      error?.response?.data?.message ||
      error?.response?.data?.detail ||
      error?.message ||
      'Something went wrong. Please try again.'
    return Promise.reject({ ...error, message })
  }
)

export default api