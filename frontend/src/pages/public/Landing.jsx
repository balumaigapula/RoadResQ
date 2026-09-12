import { Link } from 'react-router-dom'
import {
  ArrowRight, MapPin, Sparkles, Radio, ShieldCheck, Users, Star,
  ChevronDown, Wrench, CircleDot, BatteryCharging, Fuel, Truck, Car,
} from 'lucide-react'
import { useState } from 'react'
import Button from '../../components/common/Button'
import { SERVICES } from '../../data/services'

const HOW_IT_WORKS = [
  { title: 'Share your location', desc: 'One tap and we know exactly where you are.' },
  { title: 'Tell us what happened', desc: 'Pick a category or describe it — the AI assistant can help narrow it down.' },
  { title: 'Get matched instantly', desc: 'We rank nearby providers by distance, rating and availability.' },
  { title: 'Track them live', desc: 'Watch your provider approach on the map, with a running ETA.' },
]

const WHY = [
  { icon: Radio, title: 'Live, honest tracking', desc: 'Real status updates from request to repair — no vague "on the way" for hours.' },
  { icon: ShieldCheck, title: 'Verified providers', desc: 'Every mechanic and towing partner is background-checked before they join the network.' },
  { icon: Sparkles, title: 'AI-assisted diagnosis', desc: 'Describe the symptoms and get a likely cause and the right service to request.' },
  { icon: Users, title: 'Built for India\u2019s roads', desc: 'Two-wheelers, cars, highways and city lanes — priced and dispatched accordingly.' },
]

const REVIEWS = [
  { name: 'Sneha Reddy', vehicle: 'Hyundai i20', quote: 'Battery died at 11pm on the outer ring road. Provider was there in 14 minutes.', rating: 5 },
  { name: 'Kabir Singh', vehicle: 'Royal Enfield', quote: 'The tracking map made it easy to know exactly how far away help was.', rating: 5 },
  { name: 'Meera Iyer', vehicle: 'Honda City', quote: 'Punctured tyre on a highway. Straightforward booking, fair pricing, done in 20 minutes.', rating: 4 },
]

const FAQ = [
  { q: 'How fast does help arrive?', a: 'Most requests are matched with a nearby provider within 2–3 minutes, with typical arrival in 10–25 minutes depending on your location and traffic.' },
  { q: 'What if I don\u2019t know what\u2019s wrong with my vehicle?', a: 'Use the AI Breakdown Assistant — describe what you\u2019re seeing or hearing, and it will suggest a likely cause and the right service to request.' },
  { q: 'Can I track the provider in real time?', a: 'Yes. Once a provider accepts, you get a live map view with their position, ETA and distance, updated continuously.' },
  { q: 'How do I pay?', a: 'Cash, UPI or online payment — you choose at the end of the service, after reviewing an itemised charge breakdown.' },
]

export default function Landing() {
  return (
    <div>
      <Hero />
      <EmergencyStrip />
      <ServicesSection />
      <HowItWorksSection />
      <AISection />
      <TrackingSection />
      <WhySection />
      <ProviderNetworkSection />
      <ReviewsSection />
      <FAQSection />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-asphalt">
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[15, 35, 55, 75, 95].map((p) => <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#546480" strokeWidth="0.25" />)}
      </svg>
      <div className="container-page relative py-20 sm:py-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <p className="text-rescue-400 font-display text-sm font-semibold mb-4">RoadResQ</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-white leading-[1.08] max-w-2xl">
            Help on every mile
          </h1>
          <p className="mt-6 text-ash-300 text-base sm:text-lg max-w-lg leading-relaxed">
            Stuck with a flat tyre, a dead battery, or a car that won\u2019t start? Share your location and we\u2019ll get a verified provider moving toward you — tracked live, start to finish.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/register">
              <Button size="lg" icon={ArrowRight} iconPosition="right">Get Help Now</Button>
            </Link>
            <Link to="/services">
              <Button size="lg" variant="outline" className="!text-white !border-white/25 hover:!bg-white/10">Explore Services</Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-8 text-ash-400 text-sm">
            <div><span className="text-white font-display text-2xl font-bold">18 min</span><br />avg. arrival</div>
            <div className="w-px h-10 bg-white/15" />
            <div><span className="text-white font-display text-2xl font-bold">4.7★</span><br />provider rating</div>
            <div className="w-px h-10 bg-white/15" />
            <div><span className="text-white font-display text-2xl font-bold">40+</span><br />cities</div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="rounded-xl bg-navy-800/80 border border-white/10 p-5 shadow-panel backdrop-blur-sm max-w-sm ml-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-ash-400">LIVE REQUEST</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-rescue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rescue-400 animate-beacon" /> ON THE WAY
              </span>
            </div>
            <div className="h-40 rounded-md bg-navy-900 relative overflow-hidden mb-4">
              <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="10" y1="80" x2="80" y2="20" stroke="#FF5B1F" strokeWidth="1" strokeDasharray="3 2.5" />
              </svg>
              <span className="absolute left-[10%] top-[80%] w-3 h-3 rounded-full bg-info-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" />
              <span className="absolute left-[80%] top-[20%] w-3 h-3 rounded-full bg-rescue-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-white font-medium">Ravi Auto Care</p>
                <p className="text-ash-400 text-xs">Battery Assistance</p>
              </div>
              <div className="text-right">
                <p className="text-white font-display font-semibold">8 min</p>
                <p className="text-ash-400 text-xs">2.3 km away</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmergencyStrip() {
  return (
    <div className="bg-rescue-500">
      <div className="container-page py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-white text-sm">
        <p className="font-medium">In an active emergency? Skip straight to SOS dispatch.</p>
        <Link to="/register" className="font-semibold underline underline-offset-2 shrink-0">Send SOS →</Link>
      </div>
    </div>
  )
}

function ServicesSection() {
  const icons = { mechanic: Wrench, puncture: CircleDot, battery: BatteryCharging, fuel: Fuel, towing: Truck, 'car-repair': Car }
  return (
    <section id="services" className="container-page py-20 sm:py-24">
      <div className="max-w-xl mb-12">
        <h2 className="font-display text-3xl font-bold text-navy-700">Every kind of roadside problem, one app</h2>
        <p className="text-ash-500 mt-3">From a flat tyre to a full breakdown, pick a category and we\u2019ll route the right specialist to you.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SERVICES.slice(0, 8).map((s) => {
          const Icon = icons[s.id] || Wrench
          return (
            <div key={s.id} className="rounded-lg border border-ash-200 p-6 hover:border-rescue-300 hover:shadow-card transition-all">
              <div className="w-11 h-11 rounded-md bg-rescue-50 flex items-center justify-center text-rescue-500 mb-4">
                <Icon size={20} />
              </div>
              <h3 className="font-display font-semibold text-navy-700">{s.name}</h3>
              <p className="text-sm text-ash-500 mt-1.5">{s.description}</p>
              <p className="text-xs text-ash-400 mt-3">Response: {s.eta}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-8">
        <Link to="/services" className="inline-flex items-center gap-1.5 text-rescue-500 font-semibold text-sm hover:text-rescue-600">
          View all services <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="bg-navy-800">
      <div className="container-page py-20 sm:py-24">
        <div className="max-w-xl mb-14">
          <h2 className="font-display text-3xl font-bold text-white">How RoadResQ works</h2>
          <p className="text-ash-400 mt-3">Four steps from stranded to sorted.</p>
        </div>
        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          <div className="hidden lg:block absolute top-6 left-[12%] right-[12%] route-line text-rescue-500/50" />
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="w-12 h-12 rounded-full bg-navy-900 border border-white/10 flex items-center justify-center font-display font-bold text-rescue-400 mb-5">
                {i + 1}
              </div>
              <h3 className="font-display font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-ash-400 mt-1.5 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
        <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-rescue-400 font-semibold text-sm hover:text-rescue-300 mt-12">
          See the full flow <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  )
}

function AISection() {
  return (
    <section className="container-page py-20 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rescue-600 bg-rescue-50 px-2.5 py-1 rounded-full">
          <Sparkles size={12} /> AI Assistance
        </span>
        <h2 className="font-display text-3xl font-bold text-navy-700 mt-4">Not sure what\u2019s wrong? Just describe it</h2>
        <p className="text-ash-500 mt-3 leading-relaxed max-w-md">
          Tell the AI assistant what you\u2019re seeing or hearing — weak headlights, a grinding noise, a warning light — and it suggests the likely issue and the right service to book.
        </p>
        <Link to="/register" className="inline-flex items-center gap-1.5 text-rescue-500 font-semibold text-sm hover:text-rescue-600 mt-6">
          Try the AI assistant <ArrowRight size={15} />
        </Link>
      </div>
      <div className="rounded-xl border border-ash-200 shadow-card p-5 bg-white">
        <div className="bg-ash-50 rounded-md p-3.5 text-sm text-navy-700 mb-3">
          "My car is not starting and headlights are weak."
        </div>
        <div className="border border-rescue-200 bg-rescue-50/50 rounded-md p-4 space-y-2 text-sm">
          <p><span className="text-ash-500">Possible Issue: </span><span className="font-semibold text-navy-700">Battery Problem</span></p>
          <p><span className="text-ash-500">Recommended Service: </span><span className="font-semibold text-navy-700">Battery Assistance</span></p>
          <p><span className="text-ash-500">Urgency: </span><span className="font-semibold text-warning-600">High</span></p>
        </div>
      </div>
    </section>
  )
}

function TrackingSection() {
  return (
    <section className="bg-ash-50">
      <div className="container-page py-20 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 rounded-xl border border-ash-200 shadow-card bg-white p-5">
          <div className="h-56 rounded-md bg-navy-800 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
              {[25, 50, 75].map((p) => <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="#546480" strokeWidth="0.3" />)}
            </svg>
            <div className="absolute left-[18%] top-[70%] w-3 h-3 rounded-full bg-info-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute left-[70%] top-[25%] w-3 h-3 rounded-full bg-rescue-500 border-2 border-white -translate-x-1/2 -translate-y-1/2" />
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="18" y1="70" x2="70" y2="25" stroke="#FF5B1F" strokeWidth="0.8" strokeDasharray="2.5 2" />
            </svg>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-navy-700 font-medium">Provider en route</span>
            <span className="text-ash-500">ETA 6 min · 1.8 km</span>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="font-display text-3xl font-bold text-navy-700">Watch help arrive, in real time</h2>
          <p className="text-ash-500 mt-3 leading-relaxed max-w-md">
            No guessing games. Once a provider accepts, you see their position, distance and ETA update continuously on the map — the same view they see of you.
          </p>
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  return (
    <section className="container-page py-20 sm:py-24">
      <div className="max-w-xl mb-14">
        <h2 className="font-display text-3xl font-bold text-navy-700">Why people trust RoadResQ</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {WHY.map((w) => (
          <div key={w.title}>
            <w.icon size={22} className="text-rescue-500 mb-4" />
            <h3 className="font-display font-semibold text-navy-700">{w.title}</h3>
            <p className="text-sm text-ash-500 mt-1.5 leading-relaxed">{w.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProviderNetworkSection() {
  return (
    <section className="bg-navy-700">
      <div className="container-page py-16 grid sm:grid-cols-3 gap-8 text-center">
        <div>
          <p className="font-display text-4xl font-bold text-white">2,400+</p>
          <p className="text-ash-400 text-sm mt-1">Verified providers</p>
        </div>
        <div>
          <p className="font-display text-4xl font-bold text-white">40+</p>
          <p className="text-ash-400 text-sm mt-1">Cities covered</p>
        </div>
        <div>
          <p className="font-display text-4xl font-bold text-white">98%</p>
          <p className="text-ash-400 text-sm mt-1">Requests matched under 3 min</p>
        </div>
      </div>
    </section>
  )
}

function ReviewsSection() {
  return (
    <section className="container-page py-20 sm:py-24">
      <div className="max-w-xl mb-12">
        <h2 className="font-display text-3xl font-bold text-navy-700">From people who\u2019ve used it</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-6">
        {REVIEWS.map((r) => (
          <div key={r.name} className="rounded-lg border border-ash-200 p-6">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < r.rating ? 'fill-warning-500 text-warning-500' : 'text-ash-200'} />
              ))}
            </div>
            <p className="text-sm text-navy-700 leading-relaxed">"{r.quote}"</p>
            <p className="text-xs text-ash-500 mt-4">{r.name} · {r.vehicle}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)
  return (
    <section className="bg-ash-50">
      <div className="container-page py-20 sm:py-24 max-w-2xl">
        <h2 className="font-display text-3xl font-bold text-navy-700 mb-10">Frequently asked</h2>
        <div className="divide-y divide-ash-200 border-t border-b border-ash-200">
          {FAQ.map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between py-5 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="font-display font-semibold text-navy-700">{item.q}</span>
                <ChevronDown size={18} className={`text-ash-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && <p className="text-sm text-ash-500 pb-5 leading-relaxed max-w-lg">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
