import { useState } from 'react'
import { Save } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useToast } from '../../context/ToastContext'

export default function AdminSettings() {
  const [form, setForm] = useState({ platformName: 'RoadResQ', supportEmail: 'support@roadresq.in', supportPhone: '1800-123-4567', commission: '15' })
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => { setSaving(false); showToast('Settings saved.') }, 500)
  }

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-xl font-bold text-navy-700 mb-1">Settings</h2>
      <p className="text-ash-500 text-sm mb-6">Platform-wide configuration.</p>

      <form onSubmit={handleSave} className="rounded-lg border border-ash-200 bg-white p-6 space-y-4">
        <Input label="Platform Name" value={form.platformName} onChange={(e) => setForm({ ...form, platformName: e.target.value })} />
        <Input label="Support Email" type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
        <Input label="Support Phone" value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} />
        <Input label="Platform Commission (%)" type="number" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Save} loading={saving}>Save Settings</Button>
        </div>
      </form>
    </div>
  )
}
