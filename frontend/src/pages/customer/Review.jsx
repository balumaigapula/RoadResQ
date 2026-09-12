import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import RatingStars from '../../components/common/RatingStars'
import Button from '../../components/common/Button'
import reviewService from '../../services/reviewService'
import { useToast } from '../../context/ToastContext'

export default function Review() {
  const { requestId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (rating === 0) return
    setSubmitting(true)
    try {
      await reviewService.submitReview({ requestId, rating, comment })
      setDone(true)
      showToast('Thanks for your review!')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-10">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} className="text-success-500" />
        </div>
        <h1 className="font-display text-xl font-bold text-navy-700">Review submitted</h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">Thanks for helping other drivers pick great providers.</p>
        <Link to="/customer/history"><Button fullWidth>Back to History</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Rate your service</h2>
      <p className="text-ash-500 text-sm mb-6">Request {requestId} — help other drivers choose confidently.</p>

      <div className="rounded-lg border border-ash-200 bg-white p-6 text-center">
        <p className="text-sm text-ash-500 mb-3">How was the service?</p>
        <div className="flex justify-center mb-6">
          <RatingStars value={rating} onChange={setRating} interactive size={32} />
        </div>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us more about your experience (optional)"
          className="w-full rounded-md border border-ash-300 px-3.5 py-2.5 text-sm outline-none focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15 text-left"
        />
        <Button fullWidth className="mt-5" disabled={rating === 0} loading={submitting} onClick={handleSubmit}>Submit Review</Button>
      </div>
    </div>
  )
}
