import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-rescue-500 text-white hover:bg-rescue-600 active:bg-rescue-700 shadow-card disabled:bg-rescue-300',
  secondary: 'bg-navy-700 text-white hover:bg-navy-600 active:bg-navy-800 disabled:bg-navy-300',
  outline: 'border border-ash-300 text-navy-700 hover:bg-ash-100 active:bg-ash-200 disabled:text-ash-300 disabled:border-ash-200',
  ghost: 'text-navy-600 hover:bg-ash-100 active:bg-ash-200 disabled:text-ash-300',
  danger: 'bg-danger-500 text-white hover:bg-danger-600 disabled:bg-danger-300',
  emergency:
    'bg-rescue-500 text-white shadow-[0_0_0_0_rgba(255,91,31,0.5)] hover:bg-rescue-600 disabled:bg-rescue-300',
}

const SIZES = {
  sm: 'text-sm px-3.5 py-2 rounded-sm gap-1.5',
  md: 'text-sm px-5 py-2.5 rounded-md gap-2',
  lg: 'text-base px-7 py-3.5 rounded-md gap-2.5',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center font-display font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={size === 'lg' ? 20 : 16} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'lg' ? 20 : 16} />}
    </button>
  )
}
