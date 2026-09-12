import { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { Lock, CheckCircle2 } from 'lucide-react'
import OTPInput from '../../components/forms/OTPInput'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import authService from '../../services/authService'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) { setError('Enter the full 6-digit code.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await authService.resetPassword({ email, otp, password })
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={30} className="text-success-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy-700">Password updated</h1>
        <p className="text-ash-500 text-sm mt-2 mb-6">You can now log in with your new password.</p>
        <Link to="/login"><Button fullWidth>Go to Login</Button></Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-700">Reset your password</h1>
      <p className="text-ash-500 text-sm mt-1.5">Enter the code sent to {email || 'your email'} and choose a new password.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <p className="text-sm text-danger-600 bg-danger-50 rounded-md px-3.5 py-2.5">{error}</p>}
        <OTPInput value={otp} onChange={setOtp} />
        <Input label="New Password" type="password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm New Password" type="password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <Button type="submit" fullWidth size="lg" loading={loading}>Update Password</Button>
      </form>

      <p className="text-xs text-ash-400 mt-6 bg-ash-50 rounded-md p-3">
        Password reset completes once the RoadResQ backend is connected — this screen is fully wired to <code className="font-mono">authService.resetPassword()</code>.
      </p>
    </div>
  )
}
