import { Link } from 'react-router-dom'
import logo from '../../assets/images/logo.png'

const SIZES = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
  xl: 'h-16',
}

export default function Logo({ size = 'md', to = '/', className = '', linkable = true }) {
  const img = <img src={logo} alt="RoadResQ — Help on every mile" className={`${SIZES[size]} w-auto object-contain ${className}`} />
  if (!linkable) return img
  return (
    <Link to={to} className="inline-flex items-center focus-visible:outline-none">
      {img}
    </Link>
  )
}
