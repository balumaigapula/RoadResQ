import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, TrendingUp, CheckCircle2, IndianRupee, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useGeolocation from '../../hooks/useGeolocation'
import useLocalStorage from '../../hooks/useLocalStorage'
import storage from '../../utils/storage'
import Button from '../../components/common/Button'

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [online, setOnline] = useLocalStorage(storage.keys.providerOnline, false)
  const geo = useGeolocation()

  useEffect(() => {
    if (online && geo.status === 'idle') geo.locate().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online])

  function toggleOnline() {
    const next = !online
    setOnline(next)
    if (next) geo.locate().catch(() => {})
  }

  const stats = [
    { label: "Today's Requests", value: 6, icon: TrendingUp },
    { label: 'Completed', value: 4, icon: CheckCircle2 },
    { label: "Today's Earnings", value: '₹2,150', icon: IndianRupee },
    { label: 'Rating', value: '4.8', icon: Star },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-asphalt p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-navy-600 flex items-center justify-center font-display font-bold text-white text-lg overflow-hidden">
            {user?.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : user?.fullName?.charAt(0)}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{user?.fullName}</h2>
            <p className="text-ash-400 text-sm mt-0.5 flex items-center gap-1.5">
              <MapPin size={13} /> {geo.address?.formatted || (online ? 'Locating…' : 'Location off')}
            </p>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-3 rounded-full pl-4 pr-1 py-1 transition-colors ${online ? 'bg-success-500' : 'bg-white/15'}`}
        >
          <span className={`text-sm font-semibold ${online ? 'text-white' : 'text-ash-300'}`}>{online ? 'Online' : 'Offline'}</span>
          <span className={`w-9 h-9 rounded-full bg-white flex items-center justify-center transition-transform ${online ? 'translate-x-0' : ''}`}>
            <span className={`w-3 h-3 rounded-full ${online ? 'bg-success-500' : 'bg-ash-400'}`} />
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-ash-200 bg-white p-5">
            <s.icon size={18} className="text-rescue-500 mb-3" />
            <p className="font-display text-xl font-bold text-navy-700">{s.value}</p>
            <p className="text-xs text-ash-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-700">Incoming requests</h3>
            <Link to="/provider/requests" className="text-xs font-semibold text-rescue-500">View all</Link>
          </div>
          {online ? (
            <p className="text-sm text-ash-500">Listening for nearby requests… new ones will appear on the Requests page.</p>
          ) : (
            <p className="text-sm text-ash-500">Go online to start receiving requests.</p>
          )}
        </div>
        <div className="rounded-lg border border-ash-200 bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-navy-700">Monthly earnings</h3>
            <Link to="/provider/earnings" className="text-xs font-semibold text-rescue-500">Details</Link>
          </div>
          <p className="font-display text-2xl font-bold text-navy-700">₹38,420</p>
          <p className="text-xs text-ash-500 mt-1">Acceptance rate: 92%</p>
        </div>
      </div>
    </div>
  )
}
