import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'
import OTPInput from '../../components/forms/OTPInput'
import Button from '../../components/common/Button'
import authService from '../../services/authService'
import { useToast } from '../../context/ToastContext'

const RESEND_SECONDS = 30
const MAX_ATTEMPTS = 5

export default function VerifyOTP() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState('idle') // idle | verifying | success | error | expired | locked
  const [errorMessage, setErrorMessage] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const timerRef = useRef(null)

  useEffect(() => {
    if (countdown <= 0) return
    timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [countdown])

  async function handleVerify() {
    if (otp.length !== 6) return
    if (attempts >= MAX_ATTEMPTS) {
      setStatus('locked')
      return
    }
    setStatus('verifying')
    setErrorMessage('')
    try {
      await authService.verifyOTP({ email, otp })
      setStatus('success')
      showToast('Account verified. Please log in.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      if (nextAttempts >= MAX_ATTEMPTS) {
        setStatus('locked')
      } else if (err.code === 'BACKEND_NOT_CONNECTED') {
        setStatus('error')
        setErrorMessage(err.message)
      } else {
        setStatus('error')
        setErrorMessage(err.message || 'Invalid OTP. Please try again.')
      }
    }
  }

  async function handleResend() {
    setCountdown(RESEND_SECONDS)
    setOtp('')
    setStatus('idle')
    setAttempts(0)
    try {
      const res = await authService.resendOTP({ email })
      showToast(res.message)
    } catch (err) {
      showToast(err.message || 'Could not resend code.', 'error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} className="text-success-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Account verified</h1>
        <p className="text-ash-500 text-sm mt-2">Redirecting you to login…</p>
      </div>
    )
  }

  return (
    <div>
      <div className="w-14 h-14 rounded-full bg-rescue-50 flex items-center justify-center mb-5">
        <ShieldCheck size={24} className="text-rescue-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-navy-700">Verify your account</h1>
      <p className="text-ash-500 text-sm mt-1.5">
        Enter the 6-digit code sent to {email ? <span className="font-medium text-navy-600">{email}</span> : 'your email'}.
      </p>

      <div className="mt-8">
        <OTPInput
          value={otp}
          onChange={setOtp}
          disabled={status === 'verifying' || status === 'locked'}
          error={
            status === 'locked'
              ? 'Too many attempts. Please request a new code.'
              : status === 'error'
              ? errorMessage
              : undefined
          }
        />
      </div>

      <Button
        fullWidth
        size="lg"
        className="mt-6"
        onClick={handleVerify}
        loading={status === 'verifying'}
        disabled={otp.length !== 6 || status === 'locked'}
      >
        Verify
      </Button>

      <div className="mt-5 text-center text-sm">
        {countdown > 0 ? (
          <p className="text-ash-400">Resend code in 00:{String(countdown).padStart(2, '0')}</p>
        ) : (
          <button onClick={handleResend} className="text-rescue-500 font-semibold hover:text-rescue-600">
            Resend OTP
          </button>
        )}
      </div>

      <p className="text-xs text-ash-400 mt-8 bg-ash-50 rounded-md p-3">
        OTP delivery and verification connect to the RoadResQ backend — this screen is fully wired to <code className="font-mono">authService.verifyOTP()</code> and <code className="font-mono">authService.resendOTP()</code>, and will work end-to-end once that\u2019s live.
      </p>

      <p className="text-sm text-ash-500 mt-6 text-center">
        Wrong email? <Link to="/register" className="text-rescue-500 font-semibold hover:text-rescue-600">Go back</Link>
      </p>
    </div>
  )
}
