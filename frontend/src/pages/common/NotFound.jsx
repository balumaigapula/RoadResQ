import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import Logo from '../../components/common/Logo'
import Button from '../../components/common/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-ash-50">
      <Logo size="lg" className="mb-8" />
      <p className="font-display text-6xl font-bold text-navy-700">404</p>
      <h1 className="font-display text-xl font-semibold text-navy-700 mt-2">Looks like you\u2019ve gone off-road</h1>
      <p className="text-ash-500 text-sm mt-2 max-w-sm">The page you\u2019re looking for doesn\u2019t exist or has moved.</p>
      <Link to="/" className="mt-6"><Button icon={Home}>Back to Home</Button></Link>
    </div>
  )
}
