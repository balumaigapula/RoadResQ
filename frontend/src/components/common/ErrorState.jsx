import { AlertTriangle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-lg border border-danger-500/20 bg-danger-50">
      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-danger-500" />
      </div>
      <h3 className="font-display font-semibold text-navy-700">{title}</h3>
      {description && <p className="text-sm text-ash-600 mt-1.5 max-w-sm">{description}</p>}
      {onRetry && (
        <div className="mt-5">
          <Button variant="danger" onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  )
}
