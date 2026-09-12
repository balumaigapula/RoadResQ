import { useState } from 'react'
import { Phone, Mail, MapPin, Send } from 'lucide-react'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useToast } from '../../context/ToastContext'

export default function Contact() {
  const { showToast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setForm({ name: '', email: '', message: '' })
      showToast('Message sent. Our team will get back to you shortly.')
    }, 700)
  }

  return (
    <div className="container-page py-16 sm:py-20 grid lg:grid-cols-2 gap-14">
      <div>
        <p className="text-rescue-500 font-display text-sm font-semibold mb-2">Contact</p>
        <h1 className="font-display text-4xl font-bold text-navy-700">Get in touch</h1>
        <p className="text-ash-500 mt-3 max-w-sm">Questions about coverage, partnerships, or a request that didn\u2019t go as expected — we\u2019re here.</p>

        <div className="mt-10 space-y-5">
          <div className="flex items-center gap-3 text-navy-700">
            <span className="w-10 h-10 rounded-full bg-rescue-50 text-rescue-500 flex items-center justify-center"><Phone size={16} /></span>
            <div>
              <p className="text-sm font-semibold">1800-123-4567</p>
              <p className="text-xs text-ash-500">24/7 emergency line</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-navy-700">
            <span className="w-10 h-10 rounded-full bg-rescue-50 text-rescue-500 flex items-center justify-center"><Mail size={16} /></span>
            <div>
              <p className="text-sm font-semibold">support@roadresq.in</p>
              <p className="text-xs text-ash-500">General inquiries</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-navy-700">
            <span className="w-10 h-10 rounded-full bg-rescue-50 text-rescue-500 flex items-center justify-center"><MapPin size={16} /></span>
            <div>
              <p className="text-sm font-semibold">Hyderabad, Telangana</p>
              <p className="text-xs text-ash-500">Headquarters</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ash-200 rounded-lg p-6 sm:p-8 h-fit">
        <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-md border border-ash-300 px-3.5 py-2.5 text-sm outline-none focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15"
          />
        </div>
        <Button type="submit" fullWidth icon={Send} loading={submitting}>Send Message</Button>
      </form>
    </div>
  )
}
