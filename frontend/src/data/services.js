export const SERVICES = [
  { id: 'mechanic', name: 'Mechanic', description: 'On-site repair for engine, brake, clutch and gear issues.', eta: '15–25 min', icon: 'Wrench' },
  { id: 'puncture', name: 'Puncture Assistance', description: 'Flat tyre repair or replacement, right where you are.', eta: '10–20 min', icon: 'CircleDot' },
  { id: 'battery', name: 'Battery Assistance', description: 'Jump-start or battery replacement for a dead battery.', eta: '10–18 min', icon: 'BatteryCharging' },
  { id: 'fuel', name: 'Fuel Delivery', description: 'Petrol or diesel delivered directly to your vehicle.', eta: '12–20 min', icon: 'Fuel' },
  { id: 'towing', name: 'Towing', description: 'Safe towing to the nearest service center or your choice.', eta: '20–35 min', icon: 'Truck' },
  { id: 'car-repair', name: 'Car Repair', description: 'Comprehensive diagnostics and repair for four-wheelers.', eta: '25–40 min', icon: 'Car' },
  { id: 'two-wheeler', name: 'Two-Wheeler Repair', description: 'Specialist assistance for bikes and scooters.', eta: '12–20 min', icon: 'Bike' },
  { id: 'service-center', name: 'Service Center', description: 'Book a slot at a verified partner service center.', eta: 'Same day', icon: 'Building2' },
]

export const PROBLEM_CATEGORIES = [
  {
    id: 'mechanical',
    label: 'Mechanical',
    icon: 'Cog',
    problems: ['Engine Problem', 'Starting Problem', 'Overheating', 'Brake Problem', 'Clutch Problem', 'Gear Problem'],
  },
  {
    id: 'tyre',
    label: 'Tyre',
    icon: 'CircleDot',
    problems: ['Puncture', 'Flat Tyre', 'Tyre Replacement'],
  },
  {
    id: 'battery',
    label: 'Battery',
    icon: 'BatteryCharging',
    problems: ['Dead Battery', 'Battery Replacement', 'Jump Start'],
  },
  {
    id: 'fuel',
    label: 'Fuel',
    icon: 'Fuel',
    problems: ['Out of Fuel', 'Petrol Delivery', 'Diesel Delivery'],
  },
  {
    id: 'accident',
    label: 'Accident',
    icon: 'TriangleAlert',
    problems: ['Accident', 'Vehicle Cannot Move', 'Need Towing'],
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'MoreHorizontal',
    problems: ['Other Problem', 'Custom Description', 'Upload Image'],
  },
]

export const EMERGENCY_TYPES = [
  { id: 'accident', label: 'Accident' },
  { id: 'breakdown', label: 'Vehicle Breakdown' },
  { id: 'immobile', label: 'Vehicle Cannot Move' },
  { id: 'medical', label: 'Medical Emergency' },
  { id: 'other', label: 'Other' },
]
