import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const Input = forwardRef(function Input(
  { label, error, hint, type = 'text', icon: Icon, className = '', id, ...props },
  ref
) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (show ? 'text' : 'password') : type
  const inputId = id || props.name

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={`w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-navy-800 placeholder:text-ash-400 transition-colors
            ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/20' : 'border-ash-300 focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15'}
            outline-none ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ash-400 hover:text-navy-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p id={`${inputId}-error`} className="mt-1.5 text-xs text-danger-600">{error}</p>}
      {!error && hint && <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-ash-500">{hint}</p>}
    </div>
  )
})

export default Input
