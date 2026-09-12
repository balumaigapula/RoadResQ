import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading…', full = false, size = 22 }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-ash-500 ${full ? 'min-h-[50vh]' : 'py-10'}`}>
      <Loader2 size={size} className="animate-spin text-rescue-500" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
