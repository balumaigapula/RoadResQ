import api from './api'
import storage from '../utils/storage'

const wait = (ms = 400) => new Promise((res) => setTimeout(res, ms))

async function submitReview({ requestId, providerId, rating, comment }) {
  try {
    const res = await api.post('/reviews/', {
      request_number: requestId,
      rating,
      comment,
    })
    const r = res.data.data
    const review = {
      id: r.id,
      requestId: r.request_number || requestId,
      providerId: r.provider_id || providerId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at || new Date().toISOString(),
    }
    const reviews = storage.get(storage.keys.reviews, [])
    storage.set(storage.keys.reviews, [review, ...reviews])
    return review
  } catch (err) {
    await wait()
    const reviews = storage.get(storage.keys.reviews, [])
    const review = {
      id: `rev_${Date.now()}`,
      requestId,
      providerId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    }
    storage.set(storage.keys.reviews, [review, ...reviews])
    return review
  }
}

async function getReviews() {
  try {
    const res = await api.get('/customer/reviews/')
    return res.data.data || res.data || []
  } catch (err) {
    return storage.get(storage.keys.reviews, [])
  }
}

export const reviewService = { submitReview, getReviews }
export default reviewService