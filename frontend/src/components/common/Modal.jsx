import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${widths[size]} bg-white rounded-t-xl sm:rounded-lg shadow-panel max-h-[90vh] overflow-y-auto animate-rise`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ash-200 sticky top-0 bg-white">
          <h3 className="font-display text-lg font-semibold text-navy-700">{title}</h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-ash-400 hover:text-navy-700 p-1 rounded-sm hover:bg-ash-100">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-ash-200 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
