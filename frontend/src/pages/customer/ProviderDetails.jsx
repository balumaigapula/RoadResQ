import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Star, MapPin, Clock, Briefcase, CheckCircle2, ArrowLeft } from 'lucide-react'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import providerService from '../../services/providerService'
import assistanceService from '../../services/assistanceService'

export default function ProviderDetails() {
  const { providerId } = useParams()
  const navigate = useNavigate()
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    providerService.getProviderById(providerId)
      .then(setProvider)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [providerId])

  function handleRequest() {
    assistanceService.updateFlow({ provider })
    navigate('/customer/assistance/confirm')
  }

  if (loading) return <Loader full label="Loading provider…" />
  if (error) return <ErrorState description={error.message} onRetry={() => navigate(0)} />

  return (
    <div className="max-w-2xl">
      <Link to="/customer/assistance/providers" className="inline-flex items-center gap-1.5 text-sm text-ash-500 hover:text-navy-700 mb-5">
        <ArrowLeft size={15} /> Back to providers
      </Link>

      <div className="rounded-lg border border-ash-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center font-display font-bold text-xl text-navy-600 shrink-0 overflow-hidden">
            {provider.profileImage ? <img src={provider.profileImage} alt="" className="w-full h-full object-cover" /> : provider.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-navy-700">{provider.name}</h1>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-ash-500">
              <Star size={14} className="fill-warning-500 text-warning-500" /> {provider.rating} ({provider.reviewsCount} reviews)
            </div>
            <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${provider.available ? 'bg-success-50 text-success-600' : 'bg-ash-100 text-ash-500'}`}>
              {provider.available ? 'Available now' : 'Currently busy'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-ash-200">
          <Stat icon={MapPin} label="Distance" value={`${provider.distance} km`} />
          <Stat icon={Clock} label="ETA" value={`${provider.etaMinutes} min`} />
          <Stat icon={Briefcase} label="Experience" value={provider.experience} />
          <Stat icon={CheckCircle2} label="Completed" value={provider.completedServices} />
        </div>

        <div className="mt-6 pt-6 border-t border-ash-200">
          <h3 className="text-sm font-semibold text-navy-700 mb-2">Services offered</h3>
          <div className="flex flex-wrap gap-2">
            {provider.services.map((s) => (
              <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-ash-100 text-ash-600 capitalize">{s.replace('-', ' ')}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-ash-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-ash-500">Estimated price</p>
            <p className="font-display font-semibold text-navy-700">{provider.estimatedPrice}</p>
          </div>
          <Button size="lg" onClick={handleRequest}>Request Assistance</Button>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div>
      <Icon size={16} className="text-ash-400 mb-1.5" />
      <p className="text-xs text-ash-500">{label}</p>
      <p className="text-sm font-semibold text-navy-700">{value}</p>
    </div>
  )
}
