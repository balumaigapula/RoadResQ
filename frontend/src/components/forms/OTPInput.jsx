import { useRef } from 'react'

export default function OTPInput({ length = 6, value, onChange, error, disabled }) {
  const inputs = useRef([])
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  function setDigit(i, char) {
    const next = digits.slice()
    next[i] = char
    onChange(next.join(''))
  }

  function handleChange(i, e) {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    setDigit(i, char)
    if (char && i < length - 1) inputs.current[i + 1]?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        setDigit(i, '')
      } else if (i > 0) {
        inputs.current[i - 1]?.focus()
        setDigit(i - 1, '')
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    onChange(pasted.padEnd(length, '').slice(0, length).replace(/ /g, ''))
    const focusIndex = Math.min(pasted.length, length - 1)
    inputs.current[focusIndex]?.focus()
  }

  return (
    <div>
      <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            value={digits[i]}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            inputMode="numeric"
            maxLength={1}
            aria-label={`Digit ${i + 1} of ${length}`}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-display font-semibold rounded-md border outline-none transition-colors
              ${error ? 'border-danger-500' : 'border-ash-300 focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15'}
              disabled:bg-ash-100 disabled:text-ash-400`}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs text-danger-600 text-center">{error}</p>}
    </div>
  )
}
