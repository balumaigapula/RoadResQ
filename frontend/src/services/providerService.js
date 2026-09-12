import api from './api'
import { mockProviders } from '../data/providers'

const wait = (ms = 500) => new Promise((res) => setTimeout(res, ms))

function distanceKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180
  const lat1 = (a.latitude * Math.PI) / 180
  const lat2 = (b.latitude * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function computeMatchScore(provider, distance) {
  const distanceScore = Math.max(0, 100 - distance * 10)
  const ratingScore = (provider.rating / 5) * 100
  const availabilityScore = provider.available ? 100 : 40
  const score =
    distanceScore * 0.35 + ratingScore * 0.4 + availabilityScore * 0.25
  return Math.round(Math.min(99, score))
}

function mapProvider(p) {
  return {
    id: p.id,
    name: p.name || p.business_name,
    businessName: p.name || p.business_name,
    avatar: p.profile_image || p.avatar || null,
    services: p.services || p.service_types || [],
    rating: parseFloat(p.rating || 4.5),
    reviewsCount: p.reviewsCount || p.total_reviews || 0,
    experience: p.experience || `${p.experience_years || 5} years`,
    completedServices: p.completedServices || p.completed_services || 0,
    available: p.available ?? p.is_available ?? true,
    estimatedPrice: p.estimatedPrice || '₹350 - ₹1,200',
    location: p.location || { latitude: p.latitude || 17.44, longitude: p.longitude || 78.38 },
    distance: p.distance != null ? parseFloat(p.distance) : 2.5,
    etaMinutes: p.etaMinutes || p.eta || 8,
    matchScore: p.matchScore || p.match_score || 92,
  }
}

async function getNearbyProviders({ location, problemCategory, radius = 30 } = {}) {
  try {
    const params = {
      latitude: location?.latitude || 17.44,
      longitude: location?.longitude || 78.38,
      radius,
    }
    if (problemCategory) {
      params.service_type = problemCategory
    }
    const res = await api.get('/providers/nearby/', { params })
    const list = res.data.data || res.data || []
    if (list.length > 0) {
      return list.map(mapProvider)
    }
  } catch (err) {
    console.warn('Live nearby providers query failed, using fallback:', err.message)
  }

  await wait(300)
  return mockProviders
    .filter((p) => !problemCategory || p.services.includes(problemCategory))
    .map((p) => {
      const distance = location ? distanceKm(location, p.location) : p.distanceFallbackKm
      const roundedDistance = Math.round((distance ?? 3) * 10) / 10
      return {
        ...p,
        distance: roundedDistance,
        etaMinutes: Math.max(4, Math.round(roundedDistance * 3.2)),
        matchScore: computeMatchScore(p, roundedDistance),
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

async function getProviderById(id) {
  try {
    const res = await api.get(`/providers/${id}/`)
    return mapProvider(res.data.data || res.data)
  } catch (err) {
    const provider = mockProviders.find((p) => p.id == id)
    if (!provider) throw { message: 'Provider not found.' }
    return provider
  }
}

export const providerService = { getNearbyProviders, getProviderById, distanceKm }
export default providerService