import { useState } from 'react'
import { Save } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import ProfileImageUploader from '../../components/common/ProfileImageUploader'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function AdminProfile() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)

  function handleImageChange(file, previewUrl) {
    setUser((u) => ({ ...u, profileImage: previewUrl }))
  }

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => { setUser((u) => ({ ...u, ...form })); setSaving(false); showToast('Profile updated successfully.') }, 500)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="rounded-lg border border-ash-200 bg-white p-6">
        <h3 className="font-display font-semibold text-navy-700 mb-5">Profile photo</h3>
        <ProfileImageUploader value={user?.profileImage} onChange={handleImageChange} />
      </div>
      <form onSubmit={handleSave} className="rounded-lg border border-ash-200 bg-white p-6 space-y-4">
        <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
