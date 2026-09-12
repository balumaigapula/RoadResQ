import { useForm } from 'react-hook-form'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'

const VEHICLE_TYPES = [
  { value: 'Car', label: 'Car' },
  { value: 'Two-Wheeler', label: 'Two-Wheeler' },
]
const FUEL_TYPES = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' },
  { value: 'Electric', label: 'Electric' },
]

export default function VehicleForm({ defaultValues, onSubmit, submitLabel = 'Save Vehicle', loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Vehicle Type" options={VEHICLE_TYPES} {...register('type', { required: 'Required' })} error={errors.type?.message} />
        <Select label="Fuel Type" options={FUEL_TYPES} {...register('fuelType', { required: 'Required' })} error={errors.fuelType?.message} />
      </div>
      <Input label="Vehicle Number" placeholder="TS 09 EA 4521" {...register('number', { required: 'Vehicle number is required' })} error={errors.number?.message} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Brand" placeholder="Maruti Suzuki" {...register('brand', { required: 'Required' })} error={errors.brand?.message} />
        <Input label="Model" placeholder="Swift VXI" {...register('model', { required: 'Required' })} error={errors.model?.message} />
      </div>
      <Input label="Year" type="number" placeholder="2022" {...register('year', { required: 'Required' })} error={errors.year?.message} />
      <Button type="submit" fullWidth loading={loading}>{submitLabel}</Button>
    </form>
  )
}
