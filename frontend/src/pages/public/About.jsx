import { ShieldCheck, Users, MapPin, Clock } from 'lucide-react'

const VALUES = [
  { icon: Clock, title: 'Speed with honesty', desc: 'We show real ETAs and real status, not optimistic guesses.' },
  { icon: ShieldCheck, title: 'Verified network', desc: 'Every provider is checked before they can accept requests.' },
  { icon: Users, title: 'Built for drivers', desc: 'Two-wheelers to sedans to SUVs, priced and handled appropriately.' },
  { icon: MapPin, title: 'Local-first', desc: 'City-by-city rollout so coverage is deep, not just wide.' },
]

export default function About() {
  return (
    <div>
      <div className="bg-asphalt">
        <div className="container-page py-20 sm:py-24 max-w-2xl">
          <p className="text-rescue-400 font-display text-sm font-semibold mb-3">About RoadResQ</p>
          <h1 className="font-display text-4xl font-bold text-white">Roadside assistance built for how India actually drives</h1>
          <p className="text-ash-300 mt-5 leading-relaxed">
            RoadResQ started with a simple frustration: breakdown help that\u2019s slow to reach, harder to track, and priced without warning. We set out to fix all three — fast matching, live tracking, and upfront pricing, for every kind of vehicle on the road.
          </p>
        </div>
      </div>

      <div className="container-page py-16 sm:py-20">
        <h2 className="font-display text-2xl font-bold text-navy-700 mb-10">What we stand for</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {VALUES.map((v) => (
            <div key={v.title}>
              <v.icon size={22} className="text-rescue-500 mb-4" />
              <h3 className="font-display font-semibold text-navy-700">{v.title}</h3>
              <p className="text-sm text-ash-500 mt-1.5 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
