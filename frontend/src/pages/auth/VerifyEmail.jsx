import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Mail, CheckCircle2, AlertCircle, Clock, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react'
import Button from '../../components/common/Button'
import authService from '../../services/authService'
import { useToast } from '../../context/ToastContext'

const RESEND_COOLDOWN = 60

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const tokenParam = searchParams.get('token')
  const statusParam = searchParams.get('status')
  const emailParam = searchParams.get('email')

  const initialEmail = location.state?.email || emailParam || ''
  const [email, setEmail] = useState(initialEmail)

  // State: 'awaiting_click' | 'verifying' | 'success' | 'expired' | 'already_used' | 'invalid' | 'error'
  const [status, setStatus] = useState(() => {
    if (statusParam) return statusParam
    if (tokenParam) return 'verifying'
    return 'awaiting_click'
  })

  const [errorMessage, setErrorMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  // Token auto-verification effect
  useEffect(() => {
    if (!tokenParam || statusParam) return

    let isMounted = true
    async function verifyToken() {
      setStatus('verifying')
      try {
        await authService.verifyEmailToken(tokenParam)
        if (isMounted) {
          setStatus('success')
          showToast('Email verified successfully! You can now log in.')
        }
      } catch (err) {
        if (!isMounted) return
        const code = err.response?.data?.errors?.code
        if (code === 'EXPIRED' || err.message?.toLowerCase().includes('expired')) {
          setStatus('expired')
        } else if (code === 'ALREADY_USED' || err.message?.toLowerCase().includes('already been used')) {
          setStatus('already_used')
        } else if (code === 'INVALID_TOKEN' || err.message?.toLowerCase().includes('invalid')) {
          setStatus('invalid')
        } else {
          setStatus('error')
          setErrorMessage(err.message || 'Unable to verify email. Please try again.')
        }
      }
    }

    verifyToken()
    return () => {
      isMounted = false
    }
  }, [tokenParam, statusParam, showToast])

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    timerRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [countdown])

  async function handleResend() {
    if (!email) {
      showToast('Please enter your email to resend verification.', 'error')
      return
    }
    setResending(true)
    try {
      const res = await authService.resendVerification({ email })
      showToast(res.message || 'Verification link sent to your email!')
      setCountdown(res.data?.cooldown_seconds || RESEND_COOLDOWN)
    } catch (err) {
      showToast(err.message || 'Failed to send verification email.', 'error')
    } finally {
      setResending(false)
    }
  }

  // 1. Verifying token state
  if (status === 'verifying') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-rescue-50 flex items-center justify-center mx-auto mb-5 animate-pulse">
          <ShieldCheck size={32} className="text-rescue-500 animate-spin" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Verifying your email...</h1>
        <p className="text-ash-500 text-sm mt-2">Please wait while we validate your verification token.</p>
      </div>
    )
  }

  // 2. Success state
  if (status === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={34} className="text-success-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Email verified successfully!</h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">
          Your RoadResQ account is now active. You can log in and access emergency roadside assistance anytime.
        </p>
        <Button size="lg" fullWidth onClick={() => navigate('/login')} className="flex items-center justify-center gap-2">
          Go to Login <ArrowRight size={18} />
        </Button>
      </div>
    )
  }

  // 3. Link Already Used state
  if (status === 'already_used') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={34} className="text-primary-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Link already used</h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">
          This verification link has already been used and your email is confirmed. You can log in now.
        </p>
        <Button size="lg" fullWidth onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    )
  }

  // 4. Expired state
  if (status === 'expired') {
    return (
      <div className="py-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-5">
          <Clock size={28} className="text-amber-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Verification link expired</h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">
          Verification links expire after 24 hours for security. Please request a fresh verification link below.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ash-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-ash-300 px-3.5 py-2.5 text-sm text-navy-700 focus:border-rescue-500 focus:outline-none"
            />
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            loading={resending}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </Button>

          <p className="text-center text-sm text-ash-500 mt-4">
            Already verified?{' '}
            <Link to="/login" className="text-rescue-500 font-semibold hover:text-rescue-600">
              Log In
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // 5. Invalid token state
  if (status === 'invalid' || status === 'error') {
    return (
      <div className="py-4">
        <div className="w-14 h-14 rounded-full bg-danger-50 flex items-center justify-center mb-5">
          <AlertCircle size={28} className="text-danger-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">
          {status === 'invalid' ? 'Invalid verification link' : 'Verification failed'}
        </h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">
          {errorMessage || 'This verification link is invalid, malformed, or has expired. Please request a new link.'}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ash-500 mb-1.5">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-ash-300 px-3.5 py-2.5 text-sm text-navy-700 focus:border-rescue-500 focus:outline-none"
            />
          </div>

          <Button
            size="lg"
            fullWidth
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            loading={resending}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
          </Button>

          <p className="text-center text-sm text-ash-500 mt-4">
            <Link to="/register" className="text-rescue-500 font-semibold hover:text-rescue-600">
              Back to Registration
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // 6. Default: Awaiting click state (user just registered)
  return (
    <div>
      <div className="w-14 h-14 rounded-full bg-rescue-50 flex items-center justify-center mb-5">
        <Mail size={28} className="text-rescue-500" />
      </div>

      <h1 className="font-display text-2xl font-bold text-navy-700">Check your email</h1>
      <p className="text-ash-500 text-sm mt-2 leading-relaxed">
        Check your email to verify your RoadResQ account.
        {email ? (
          <>
            {' '}We have sent a verification link to{' '}
            <span className="font-semibold text-navy-700">{email}</span>.
          </>
        ) : (
          ' We have sent a secure link to your email address.'
        )}
      </p>

      <div className="mt-6 rounded-lg bg-ash-50 border border-ash-200 p-4 text-xs text-ash-600 space-y-2">
        <div className="flex items-start gap-2">
          <Clock size={16} className="text-ash-500 shrink-0 mt-0.5" />
          <span>The verification link is valid for <strong>24 hours</strong> and can only be used once.</span>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck size={16} className="text-ash-500 shrink-0 mt-0.5" />
          <span>Click the <strong>Verify My Email</strong> button in the email to activate your account.</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-ash-200">
        <p className="text-xs text-ash-500 mb-3">Didn&apos;t receive the email? Check your spam folder or request a new link:</p>
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          loading={resending}
          className="flex items-center justify-center gap-2"
        >
          <RotateCcw size={15} />
          {countdown > 0 ? `Resend link in ${countdown}s` : 'Resend Verification Email'}
        </Button>
      </div>

      <p className="text-sm text-ash-500 mt-6 text-center">
        Already verified?{' '}
        <Link to="/login" className="text-rescue-500 font-semibold hover:text-rescue-600">
          Log In
        </Link>
      </p>
    </div>
  )
}
