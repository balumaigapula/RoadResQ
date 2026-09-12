import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import FlowStepper from '../../components/common/FlowStepper'
import LocationPicker from '../../components/maps/LocationPicker'
import Button from '../../components/common/Button'
import useGeolocation from '../../hooks/useGeolocation'
import assistanceService from '../../services/assistanceService'

export default function AssistanceLocation() {
  const navigate = useNavigate()
  const geo = useGeolocation()

  useEffect(() => {
    geo.locate().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleContinue() {
    assistanceService.updateFlow({ location: geo.position, address: geo.address })
    navigate('/customer/assistance/vehicle')
  }

  return (
    <div className="max-w-2xl">
      <FlowStepper current="Location" />
      <h2 className="font-display text-2xl font-bold text-navy-700 mb-1">Where are you?</h2>
      <p className="text-ash-500 text-sm mb-6">We\u2019ll match you with providers closest to this location.</p>

      <LocationPicker status={geo.status} position={geo.position} address={geo.address} error={geo.error} onLocate={geo.locate} />

      <div className="mt-6 flex justify-end">
        <Button size="lg" icon={ArrowRight} iconPosition="right" disabled={geo.status !== 'granted'} onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
