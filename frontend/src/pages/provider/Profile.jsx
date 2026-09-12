import { useState } from 'react'
import { Save } from 'lucide-react'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import ProfileImageUploader from '../../components/common/ProfileImageUploader'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ProviderProfile() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    businessName: 'Ravi Auto Care',
    services: 'mechanic,battery',
    experience: '7',
    serviceArea: 'Hyderabad — 15km radius',
  })
  const [saving, setSaving] = useState(false)

  function handleImageChange(file, previewUrl) {
    setUser((u) => ({ ...u, profileImage: previewUrl }))
  }

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setUser((u) => ({ ...u, fullName: form.fullName, phone: form.phone, email: form.email }))
      setSaving(false)
      showToast('Profile updated successfully.')
    }, 500)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-ash-200 bg-white p-6">
        <h3 className="font-display font-semibold text-navy-700 mb-5">Profile photo</h3>
        <ProfileImageUploader value={user?.profileImage} onChange={handleImageChange} />
      </div>

      <form onSubmit={handleSave} className="rounded-lg border border-ash-200 bg-white p-6 space-y-4">
        <h3 className="font-display font-semibold text-navy-700 mb-1">Business details</h3>
        <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <Input label="Experience (years)" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        <Input label="Service Area" value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} />
        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
