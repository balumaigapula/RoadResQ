import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form)
      showToast(`Welcome back, ${user.fullName.split(' ')[0]}.`)
      navigate(location.state?.from || `/${user.role}/dashboard`)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-700">Welcome back</h1>
      <p className="text-ash-500 text-sm mt-1.5">Log in to request or manage roadside assistance.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && <p className="text-sm text-danger-600 bg-danger-50 rounded-md px-3.5 py-2.5">{error}</p>}
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ash-600">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-ash-300 text-rescue-500 focus:ring-rescue-500/30" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-rescue-500 font-medium hover:text-rescue-600">Forgot password?</Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>Log In</Button>
      </form>

      <p className="text-sm text-ash-500 mt-6 text-center">
        Don\u2019t have an account? <Link to="/register" className="text-rescue-500 font-semibold hover:text-rescue-600">Register</Link>
      </p>

      <p className="text-xs text-ash-400 mt-8 bg-ash-50 rounded-md p-3">
        Demo accounts: arjun.customer@roadresq.in · ravi.provider@roadresq.in · admin@roadresq.in — any password (4+ characters).
      </p>
    </div>
  )
}
