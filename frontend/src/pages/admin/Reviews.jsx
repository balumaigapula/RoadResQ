import { mockReviews } from '../../data/reviews'
import RatingStars from '../../components/common/RatingStars'

export default function AdminReviews() {
  return (
    <div>
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Reviews</h2>
      <p className="text-ash-500 text-sm mb-6">Customer feedback across all providers.</p>

      <div className="space-y-4">
        {mockReviews.map((r) => (
          <div key={r.id} className="rounded-lg border border-ash-200 bg-white p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-navy-700">{r.customer}</p>
                <p className="text-xs text-ash-500">reviewing {r.provider}</p>
              </div>
              <RatingStars value={r.rating} size={14} />
            </div>
            <p className="text-sm text-ash-600 mt-2">{r.comment}</p>
            <p className="text-xs text-ash-400 mt-2">{new Date(r.date).toLocaleDateString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
