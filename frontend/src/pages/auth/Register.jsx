import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Wrench, UserCircle } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import authService from '../../services/authService'
import { useToast } from '../../context/ToastContext'

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'customer' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Full name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid phone number.'
    if (form.password.length < 6) e.password = 'At least 6 characters.'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await authService.register(form)
      const data = res?.data || {}
      if (data.access) {
        const storage = (await import('../../utils/storage')).default
        storage.set(storage.keys.authToken, data.access)
        storage.set(storage.keys.refreshToken, data.refresh)
        const mappedUser = authService.mapUser(data.user)
        storage.set(storage.keys.authUser, mappedUser)
        storage.set(storage.keys.role, mappedUser.role)
      }
      showToast('Account created! Welcome to RoadResQ 🎉')
      const role = (data?.user?.role || form.role || 'customer').toLowerCase()
      navigate(role === 'provider' ? '/provider/dashboard' : '/customer/dashboard')
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-700">Create your account</h1>
      <p className="text-ash-500 text-sm mt-1.5">Get roadside help in minutes, wherever you are.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {errors.form && <p className="text-sm text-danger-600 bg-danger-50 rounded-md px-3.5 py-2.5">{errors.form}</p>}

        <div>
          <span className="block text-sm font-medium text-navy-700 mb-2">I am a</span>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: 'customer', l: 'Customer', icon: UserCircle }, { v: 'provider', l: 'Service Provider', icon: Wrench }].map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => update('role', r.v)}
                className={`flex items-center gap-2 justify-center rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                  form.role === r.v ? 'border-rescue-500 bg-rescue-50 text-rescue-600' : 'border-ash-300 text-ash-600 hover:border-ash-400'
                }`}
              >
                <r.icon size={16} /> {r.l}
              </button>
            ))}
          </div>
        </div>

        <Input label="Full Name" icon={User} placeholder="Arjun Mehta" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} error={errors.fullName} />
        <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <Input label="Phone" icon={Phone} placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} />
        <Input label="Password" type="password" icon={Lock} placeholder="At least 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} error={errors.password} />
        <Input label="Confirm Password" type="password" icon={Lock} placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} error={errors.confirmPassword} />

        <Button type="submit" fullWidth size="lg" loading={loading}>Create Account</Button>
      </form>

      <p className="text-sm text-ash-500 mt-6 text-center">
        Already have an account? <Link to="/login" className="text-rescue-500 font-semibold hover:text-rescue-600">Log In</Link>
      </p>
    </div>
  )
}
