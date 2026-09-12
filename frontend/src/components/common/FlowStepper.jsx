const STEPS = ['Location', 'Vehicle', 'Problem', 'Providers', 'Confirm']

export default function FlowStepper({ current }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-1.5 mb-8 overflow-x-auto scrollbar-thin pb-1">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5 shrink-0">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            i < idx ? 'bg-success-50 text-success-600' : i === idx ? 'bg-rescue-500 text-white' : 'bg-ash-100 text-ash-400'
          }`}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center bg-white/25">{i + 1}</span>
            {s}
          </div>
          {i < STEPS.length - 1 && <span className="w-4 h-px bg-ash-300" />}
        </div>
      ))}
    </div>
  )
}
