import { Outlet, Link } from 'react-router-dom'
import Logo from '../components/common/Logo'

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-10">
        <Link to="/" className="mb-10"><Logo size="md" linkable={false} /></Link>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      <div className="hidden lg:flex relative bg-asphalt items-center justify-center overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[20, 40, 60, 80].map((p) => <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#546480" strokeWidth="0.3" />)}
          {[20, 40, 60, 80].map((p) => <line key={`v${p}`} x1={p} y1="0" x2={p} y2="100" stroke="#546480" strokeWidth="0.3" />)}
        </svg>
        <div className="relative text-center px-12 animate-rise">
          <p className="text-rescue-400 font-display text-sm font-semibold tracking-wide mb-3">HELP ON EVERY MILE</p>
          <h2 className="font-display text-3xl font-bold text-white leading-tight">
            Roadside help,<br />dispatched in minutes.
          </h2>
          <p className="text-ash-400 text-sm mt-4 max-w-sm mx-auto">
            Mechanics, towing, battery and fuel assistance — tracked live from request to repair.
          </p>
        </div>
      </div>
    </div>
  )
}
