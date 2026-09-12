import api from './api'
import storage from '../utils/storage'
import { PROBLEM_CATEGORIES } from '../data/services'

const wait = (ms = 500) => new Promise((res) => setTimeout(res, ms))

const STATUS_FLOW = [
  'REQUESTED',
  'SEARCHING',
  'PROVIDER_ASSIGNED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'REPAIRING',
  'COMPLETED',
]

function getProblemCategories() {
  return PROBLEM_CATEGORIES
}

function getFlow() {
  return storage.get(storage.keys.assistanceFlow, {})
}

function updateFlow(patch) {
  const flow = getFlow()
  const updated = { ...flow, ...patch }
  storage.set(storage.keys.assistanceFlow, updated)
  return updated
}

function clearFlow() {
  storage.remove(storage.keys.assistanceFlow)
}

function mapRequest(r) {
  if (!r) return null
  return {
    id: r.request_number || r.id,
    requestNumber: r.request_number || r.id,
    status: r.status,
    statusFlow: STATUS_FLOW,
    priority: r.priority || 'NORMAL',
    service: r.service || r.service_category,
    problem: r.problem_description || r.problem || r.problem_type,
    vehicle: r.vehicle || 'Not specified',
    providerName: r.providerName || r.provider?.business_name || null,
    providerId: r.providerId || r.provider?.id || null,
    amount: r.total_amount != null ? parseFloat(r.total_amount) : (r.amount != null ? parseFloat(r.amount) : 350),
    distance: r.distance != null ? parseFloat(r.distance) : 3.0,
    etaMinutes: r.etaMinutes || 8,
    createdAt: r.createdAt || r.created_at || new Date().toISOString(),
    latitude: r.latitude ? parseFloat(r.latitude) : 17.44,
    longitude: r.longitude ? parseFloat(r.longitude) : 78.38,
    address: r.address || '',
  }
}

async function createRequest(payload) {
  try {
    const flow = getFlow()
    const serviceCategory = flow.provider?.services?.[0] || 'MECHANIC'
    const body = {
      service_category: serviceCategory,
      problem_type: 'ENGINE_PROBLEM',
      problem_description: payload.problem || 'Assistance requested',
      latitude: flow.location?.latitude || 17.4447,
      longitude: flow.location?.longitude || 78.3842,
      address: flow.location?.address || 'Banjara Hills, Hyderabad',
      provider_id: payload.providerId || flow.provider?.id || null,
      priority: payload.priority || 'NORMAL',
    }
    if (flow.vehicle?.id && typeof flow.vehicle.id === 'number') {
      body.vehicle_id = flow.vehicle.id
    }

    const res = await api.post('/assistance/requests/', body)
    const request = mapRequest(res.data.data)
    const requests = storage.get(storage.keys.requests, [])
    storage.set(storage.keys.requests, [request, ...requests])
    clearFlow()
    return request
  } catch (err) {
    console.warn('Backend createRequest failed, saving locally:', err)
    const requests = storage.get(storage.keys.requests, [])
    const request = {
      id: `RR-${Date.now().toString().slice(-8)}`,
      status: 'REQUESTED',
      statusFlow: STATUS_FLOW,
      createdAt: new Date().toISOString(),
      priority: payload.priority || 'NORMAL',
      ...payload,
    }
    storage.set(storage.keys.requests, [request, ...requests])
    clearFlow()
    return request
  }
}

async function createSOSRequest(payload) {
  try {
    const body = {
      emergency_type: payload.emergencyType || 'Breakdown',
      latitude: payload.latitude || 17.4447,
      longitude: payload.longitude || 78.3842,
      address: payload.address || 'Emergency GPS Location',
      description: payload.description || 'SOS Emergency Request',
      vehicle_id: payload.vehicleId || null,
    }
    const res = await api.post('/assistance/sos/', body)
    const request = mapRequest(res.data.data)
    const requests = storage.get(storage.keys.requests, [])
    storage.set(storage.keys.requests, [request, ...requests])
    return request
  } catch (err) {
    const requests = storage.get(storage.keys.requests, [])
    const request = {
      id: `SOS-${Date.now().toString().slice(-8)}`,
      status: 'REQUESTED',
      statusFlow: STATUS_FLOW,
      createdAt: new Date().toISOString(),
      priority: 'CRITICAL',
      isSOS: true,
      ...payload,
    }
    storage.set(storage.keys.requests, [request, ...requests])
    return request
  }
}

async function getRequests() {
  try {
    const res = await api.get('/customer/requests/')
    const list = res.data.data || res.data || []
    const mapped = list.map(mapRequest)
    storage.set(storage.keys.requests, mapped)
    return mapped
  } catch (err) {
    return storage.get(storage.keys.requests, [])
  }
}

async function getRequestById(id) {
  try {
    const res = await api.get(`/assistance/requests/${id}/`)
    return mapRequest(res.data.data || res.data)
  } catch (err) {
    const requests = storage.get(storage.keys.requests, [])
    const found = requests.find((r) => r.id === id)
    if (!found) throw { message: 'Request not found.' }
    return found
  }
}

async function advanceStatus(id) {
  const requests = storage.get(storage.keys.requests, [])
  const req = requests.find((r) => r.id === id)
  const idx = STATUS_FLOW.indexOf(req?.status || 'REQUESTED')
  const next = STATUS_FLOW[Math.min(idx + 1, STATUS_FLOW.length - 1)]

  try {
    if (next === 'ACCEPTED') await api.post(`/provider/requests/${id}/accept/`)
    else if (next === 'ON_THE_WAY') await api.post(`/provider/requests/${id}/on-the-way/`)
    else if (next === 'ARRIVED') await api.post(`/provider/requests/${id}/arrived/`)
    else if (next === 'REPAIRING') await api.post(`/provider/requests/${id}/start/`)
    else if (next === 'COMPLETED') await api.post(`/provider/requests/${id}/complete/`)
  } catch (e) {
    // Continue local advance
  }

  const updated = requests.map((r) => (r.id === id ? { ...r, status: next } : r))
  storage.set(storage.keys.requests, updated)
  return updated.find((r) => r.id === id)
}

async function cancelRequest(id) {
  try {
    await api.post(`/customer/requests/${id}/cancel/`)
  } catch (err) {
    // Local fallback
  }
  const requests = storage.get(storage.keys.requests, [])
  const updated = requests.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
  storage.set(storage.keys.requests, updated)
  return updated.find((r) => r.id === id)
}

export const assistanceService = {
  STATUS_FLOW,
  getProblemCategories,
  getFlow,
  updateFlow,
  clearFlow,
  createRequest,
  createSOSRequest,
  getRequests,
  getRequestById,
  advanceStatus,
  cancelRequest,
  mapRequest,
}
export default assistanceService