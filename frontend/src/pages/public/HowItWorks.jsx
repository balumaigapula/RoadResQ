import { MapPin, Car, MessageSquareText, Search, UserCheck, Send, Radio, Wrench, IndianRupee, Star } from 'lucide-react'

const STEPS = [
  { icon: MapPin, title: 'Share Location', desc: 'Grant location access so we know exactly where to send help.' },
  { icon: Car, title: 'Select Vehicle', desc: 'Choose from your saved vehicles or add a new one.' },
  { icon: MessageSquareText, title: 'Describe Problem', desc: 'Pick a category, or let the AI assistant narrow it down for you.' },
  { icon: Search, title: 'Find Nearby Providers', desc: 'We surface verified providers ranked by distance, rating and ETA.' },
  { icon: UserCheck, title: 'Choose Provider', desc: 'Compare match scores and pick who you\u2019d like to help.' },
  { icon: Send, title: 'Request Assistance', desc: 'Confirm the request with full pricing shown upfront.' },
  { icon: Radio, title: 'Track Provider', desc: 'Watch them approach live on the map with a running ETA.' },
  { icon: Wrench, title: 'Complete Service', desc: 'The provider works on your vehicle at your location.' },
  { icon: IndianRupee, title: 'Pay', desc: 'Settle by cash, UPI or online — with an itemised charge breakdown.' },
  { icon: Star, title: 'Review', desc: 'Rate the provider to help other drivers on the road.' },
]

export default function HowItWorks() {
  return (
    <div className="container-page py-16 sm:py-20">
      <div className="max-w-xl mb-14">
        <p className="text-rescue-500 font-display text-sm font-semibold mb-2">How It Works</p>
        <h1 className="font-display text-4xl font-bold text-navy-700">From stranded to sorted, in ten steps</h1>
      </div>

      <div className="relative">
        <div className="hidden sm:block absolute left-6 top-6 bottom-6 w-px route-line" style={{ writingMode: 'vertical-lr' }} />
        <ol className="space-y-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 sm:gap-6 relative">
              <div className="w-12 h-12 rounded-full bg-navy-700 text-white flex items-center justify-center shrink-0 relative z-10">
                <step.icon size={20} />
              </div>
              <div className="pt-1.5">
                <p className="text-xs font-semibold text-ash-400 mb-0.5">Step {i + 1}</p>
                <h3 className="font-display font-semibold text-lg text-navy-700">{step.title}</h3>
                <p className="text-sm text-ash-500 mt-1 max-w-md leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
