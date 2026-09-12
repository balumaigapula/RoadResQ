import { useRef, useState } from 'react'
import { Camera, Trash2, User } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

/**
 * Handles selection + local preview only. The actual upload is left to the
 * caller via onChange(file) so pages can decide when to persist it — the
 * File is what a future multipart/form-data request to the backend expects:
 *
 *   const formData = new FormData()
 *   formData.append('profile_image', file)
 *   await api.post('/profile/image/', formData, {
 *     headers: { 'Content-Type': 'multipart/form-data' },
 *   })
 */
export default function ProfileImageUploader({ value, onChange }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(value || null)
  const { showToast } = useToast()

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) {
      showToast('Please choose a JPG, PNG or WEBP image.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'error')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange?.(file, url)
  }

  function handleRemove() {
    setPreview(null)
    onChange?.(null, null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white shadow-card">
        {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : <User size={28} className="text-navy-400" />}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rescue-500 hover:text-rescue-600"
          >
            <Camera size={15} /> {preview ? 'Replace photo' : 'Upload photo'}
          </button>
          {preview && (
            <button type="button" onClick={handleRemove} className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger-500 hover:text-danger-600">
              <Trash2 size={15} /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-ash-400">JPG, PNG or WEBP. Max 5MB.</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </div>
    </div>
  )
}
