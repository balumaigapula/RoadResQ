import api from './api'
import storage from '../utils/storage'
import { mockVehicles } from '../data/vehicles'

function toFrontend(v) {
  if (!v) return null
  return {
    id: v.id,
    vehicleType: v.vehicle_type || v.vehicleType || 'Car',
    vehicleNumber: v.vehicle_number || v.vehicleNumber || '',
    brand: v.brand || '',
    model: v.model || '',
    fuelType: v.fuel_type || v.fuelType || 'Petrol',
    year: v.year || '',
    image: v.image || null,
    isPrimary: Boolean(v.is_primary ?? v.isPrimary),
  }
}

function toBackend(v) {
  return {
    vehicle_type: v.vehicleType || v.vehicle_type || 'Car',
    vehicle_number: v.vehicleNumber || v.vehicle_number || '',
    brand: v.brand || '',
    model: v.model || '',
    fuel_type: v.fuelType || v.fuel_type || 'Petrol',
    year: parseInt(v.year, 10) || new Date().getFullYear(),
    is_primary: Boolean(v.isPrimary ?? v.is_primary),
  }
}

function seedIfEmpty() {
  const existing = storage.get(storage.keys.vehicles)
  if (!existing) storage.set(storage.keys.vehicles, mockVehicles)
}

async function getVehicles() {
  try {
    const res = await api.get('/vehicles/')
    const list = res.data.data || res.data || []
    const mapped = list.map(toFrontend)
    storage.set(storage.keys.vehicles, mapped)
    return mapped
  } catch (err) {
    seedIfEmpty()
    return storage.get(storage.keys.vehicles, [])
  }
}

async function addVehicle(vehicle) {
  try {
    const payload = toBackend(vehicle)
    const res = await api.post('/vehicles/', payload)
    const created = toFrontend(res.data.data || res.data)
    const list = storage.get(storage.keys.vehicles, [])
    storage.set(storage.keys.vehicles, [...list, created])
    return created
  } catch (err) {
    seedIfEmpty()
    const list = storage.get(storage.keys.vehicles, [])
    const newVehicle = {
      id: `veh_${Date.now()}`,
      isPrimary: list.length === 0,
      ...vehicle,
    }
    storage.set(storage.keys.vehicles, [...list, newVehicle])
    return newVehicle
  }
}

async function updateVehicle(id, patch) {
  try {
    const payload = toBackend(patch)
    const res = await api.patch(`/vehicles/${id}/`, payload)
    const updated = toFrontend(res.data.data || res.data)
    const list = storage.get(storage.keys.vehicles, [])
    storage.set(storage.keys.vehicles, list.map((v) => (v.id === id ? updated : v)))
    return updated
  } catch (err) {
    const list = storage.get(storage.keys.vehicles, [])
    const updated = list.map((v) => (v.id === id ? { ...v, ...patch } : v))
    storage.set(storage.keys.vehicles, updated)
    return updated.find((v) => v.id === id)
  }
}

async function deleteVehicle(id) {
  try {
    await api.delete(`/vehicles/${id}/`)
  } catch (err) {
    // Continue local cleanup
  }
  const list = storage.get(storage.keys.vehicles, [])
  storage.set(storage.keys.vehicles, list.filter((v) => v.id !== id))
  return { success: true }
}

async function setPrimary(id) {
  try {
    await api.patch(`/vehicles/${id}/`, { is_primary: true })
  } catch (err) {
    // Continue
  }
  const list = storage.get(storage.keys.vehicles, [])
  const updated = list.map((v) => ({ ...v, isPrimary: v.id === id }))
  storage.set(storage.keys.vehicles, updated)
  return updated
}

async function selectVehicle(id) {
  const list = storage.get(storage.keys.vehicles, [])
  const vehicle = list.find((v) => v.id === id)
  storage.set(storage.keys.selectedVehicle, vehicle || null)
  return vehicle
}

function getSelectedVehicle() {
  return storage.get(storage.keys.selectedVehicle)
}

export const vehicleService = {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setPrimary,
  selectVehicle,
  getSelectedVehicle,
}
export default vehicleService