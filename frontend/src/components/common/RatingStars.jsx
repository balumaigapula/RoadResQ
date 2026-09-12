import { Star } from 'lucide-react'
import { useState } from 'react'

export default function RatingStars({ value = 0, onChange, size = 16, interactive = false }) {
  const [hover, setHover] = useState(0)
  const display = interactive && hover ? hover : value

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange?.(i)}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={i <= display ? 'fill-warning-500 text-warning-500' : 'fill-transparent text-ash-300'}
          />
        </button>
      ))}
    </div>
  )
}
