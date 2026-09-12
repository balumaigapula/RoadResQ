import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import FlowStepper from '../../components/common/FlowStepper'
import Button from '../../components/common/Button'
import { PROBLEM_CATEGORIES } from '../../data/services'
import assistanceService from '../../services/assistanceService'

export default function AssistanceProblem() {
  const navigate = useNavigate()
  const [categoryId, setCategoryId] = useState(null)
  const [problem, setProblem] = useState(null)
  const [customText, setCustomText] = useState('')

  const category = PROBLEM_CATEGORIES.find((c) => c.id === categoryId)

  function handleContinue() {
    assistanceService.updateFlow({
      problemCategory: categoryId,
      problem: problem === 'Custom Description' ? customText : problem,
    })
    navigate('/customer/assistance/providers')
  }

  return (
    <div className="max-w-2xl">
      <FlowStepper current="Problem" />
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-2xl font-bold text-navy-700">What\u2019s the problem?</h2>
        <Link to="/customer/ai-assistant" className="text-xs font-semibold text-rescue-500 hover:text-rescue-600 flex items-center gap-1">
          <Sparkles size={13} /> Not sure? Ask AI
        </Link>
      </div>
      <p className="text-ash-500 text-sm mb-6">Choose a category, then the specific issue.</p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {PROBLEM_CATEGORIES.map((c) => {
          const Icon = Icons[c.icon] || Icons.Wrench
          return (
            <button
              key={c.id}
              onClick={() => { setCategoryId(c.id); setProblem(null) }}
              className={`flex flex-col items-center gap-2 rounded-lg border p-3.5 text-xs font-medium transition-colors ${
                categoryId === c.id ? 'border-rescue-500 bg-rescue-50 text-rescue-600' : 'border-ash-200 text-ash-600 hover:border-ash-300'
              }`}
            >
              <Icon size={18} />
              {c.label}
            </button>
          )
        })}
      </div>

      {category && (
        <div className="rounded-lg border border-ash-200 bg-white p-4 space-y-2">
          {category.problems.map((p) => (
            <button
              key={p}
              onClick={() => setProblem(p)}
              className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                problem === p ? 'bg-rescue-500 text-white' : 'text-navy-700 hover:bg-ash-100'
              }`}
            >
              {p}
            </button>
          ))}
          {problem === 'Custom Description' && (
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Describe what's happening…"
              className="w-full mt-2 rounded-md border border-ash-300 px-3.5 py-2.5 text-sm outline-none focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15"
            />
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Link to="/customer/assistance/vehicle"><Button variant="outline" icon={ArrowLeft}>Back</Button></Link>
        <Button size="lg" icon={ArrowRight} iconPosition="right" disabled={!problem} onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  )
}
