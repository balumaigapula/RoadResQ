import { useState } from 'react'
import { Save, Lock, Plus, Trash2 } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import ProfileImageUploader from '../../components/common/ProfileImageUploader'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Profile() {
  const { user, setUser } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' })
  const [addresses, setAddresses] = useState(['Home — Banjara Hills, Hyderabad'])
  const [emergencyContacts, setEmergencyContacts] = useState(['Priya Mehta — +91 90000 11122'])
  const [saving, setSaving] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)

  function handleImageChange(file, previewUrl) {
    // Future: upload via FormData to /profile/image/ (see ProfileImageUploader)
    setUser((u) => ({ ...u, profileImage: previewUrl }))
  }

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setUser((u) => ({ ...u, ...form }))
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
        <h3 className="font-display font-semibold text-navy-700 mb-1">Personal details</h3>
        <Input label="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <div className="flex justify-between items-center pt-2">
          <button type="button" onClick={() => setPasswordOpen((o) => !o)} className="text-sm font-semibold text-rescue-500 hover:text-rescue-600 flex items-center gap-1.5">
            <Lock size={14} /> Change password
          </button>
          <Button type="submit" icon={Save} loading={saving}>Save Changes</Button>
        </div>
        {passwordOpen && (
          <div className="pt-4 border-t border-ash-200 space-y-3">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
          </div>
        )}
      </form>

      <ListSection
        title="Emergency contacts"
        items={emergencyContacts}
        onAdd={() => setEmergencyContacts((c) => [...c, 'New Contact — +91 00000 00000'])}
        onRemove={(i) => setEmergencyContacts((c) => c.filter((_, idx) => idx !== i))}
      />
      <ListSection
        title="Saved addresses"
        items={addresses}
        onAdd={() => setAddresses((a) => [...a, 'New Address'])}
        onRemove={(i) => setAddresses((a) => a.filter((_, idx) => idx !== i))}
      />
    </div>
  )
}

function ListSection({ title, items, onAdd, onRemove }) {
  return (
    <div className="rounded-lg border border-ash-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-navy-700">{title}</h3>
        <button onClick={onAdd} className="text-sm font-semibold text-rescue-500 hover:text-rescue-600 flex items-center gap-1"><Plus size={14} /> Add</button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm rounded-md bg-ash-50 px-3.5 py-2.5">
            <span className="text-navy-700">{item}</span>
            <button onClick={() => onRemove(i)} className="text-ash-400 hover:text-danger-600"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
