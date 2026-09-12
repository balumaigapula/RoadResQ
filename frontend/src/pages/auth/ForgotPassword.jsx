import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import authService from '../../services/authService'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authService.forgotPassword({ email })
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-700">Forgot your password?</h1>
      <p className="text-ash-500 text-sm mt-1.5">Enter your email and we\u2019ll send a code to reset it.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-danger-600 bg-danger-50 rounded-md px-3.5 py-2.5">{error}</p>}
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" fullWidth size="lg" loading={loading}>Send Reset Code</Button>
      </form>

      <p className="text-sm text-ash-500 mt-6 text-center">
        Remembered it? <Link to="/login" className="text-rescue-500 font-semibold hover:text-rescue-600">Back to Login</Link>
      </p>
    </div>
  )
}
