import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Send, Wrench } from 'lucide-react'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import aiService from '../../services/aiService'
import assistanceService from '../../services/assistanceService'

const URGENCY_TONE = {
  Critical: 'bg-danger-50 text-danger-600',
  High: 'bg-warning-50 text-warning-600',
  Medium: 'bg-info-50 text-info-600',
  Low: 'bg-success-50 text-success-600',
}

const EXAMPLES = [
  'My car is not starting and headlights are weak.',
  'There is smoke coming from under the hood.',
  'My tyre suddenly went flat on the highway.',
]

export default function AIAssistant() {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const navigate = useNavigate()

  async function handleAnalyze(text) {
    const value = text ?? description
    if (!value.trim()) return
    setDescription(value)
    setLoading(true)
    setResult(null)
    try {
      const res = await aiService.analyzeSymptoms(value)
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  function handleRequestAssistance() {
    assistanceService.updateFlow({ problem: result.issue, aiSuggested: true })
    navigate('/customer/assistance/location')
  }

  return (
    <div className="max-w-2xl">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rescue-600 bg-rescue-50 px-2.5 py-1 rounded-full mb-4">
        <Sparkles size={12} /> AI Breakdown Assistant
      </span>
      <h2 className="font-display text-2xl font-bold text-navy-700 mb-1">Describe what\u2019s happening</h2>
      <p className="text-ash-500 text-sm mb-6">The assistant suggests a likely issue and the right service to request.</p>

      <div className="rounded-lg border border-ash-200 bg-white p-5">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. My car is not starting and headlights are weak."
          className="w-full rounded-md border border-ash-300 px-3.5 py-2.5 text-sm outline-none focus:border-rescue-500 focus:ring-2 focus:ring-rescue-500/15"
        />
        <div className="flex justify-end mt-3">
          <Button icon={Send} onClick={() => handleAnalyze()} loading={loading} disabled={!description.trim()}>Analyze</Button>
        </div>

        {!result && !loading && (
          <div className="mt-5 pt-5 border-t border-ash-200">
            <p className="text-xs font-medium text-ash-500 mb-2">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => handleAnalyze(ex)} className="text-xs px-3 py-1.5 rounded-full bg-ash-100 text-ash-600 hover:bg-ash-200">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="mt-5"><Loader label="Analyzing symptoms…" /></div>}

        {result && !loading && (
          <div className="mt-5 pt-5 border-t border-ash-200">
            <div className="rounded-md border border-rescue-200 bg-rescue-50/50 p-4 space-y-2 text-sm">
              <p><span className="text-ash-500">Possible Issue: </span><span className="font-semibold text-navy-700">{result.issue}</span></p>
              <p><span className="text-ash-500">Recommended Service: </span><span className="font-semibold text-navy-700">{result.service}</span></p>
              <p className="flex items-center gap-2"><span className="text-ash-500">Urgency:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_TONE[result.urgency] || URGENCY_TONE.Medium}`}>{result.urgency}</span>
              </p>
              <p><span className="text-ash-500">Suggested Action: </span>{result.suggestedAction}</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" fullWidth onClick={() => { setResult(null); setDescription('') }}>Try Basic Troubleshooting</Button>
              <Button fullWidth icon={Wrench} onClick={handleRequestAssistance}>Request Assistance</Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-ash-400 mt-4">
        Diagnosis is generated locally for this demo via rule-based matching in <code className="font-mono">aiService.js</code>. No AI API key is present in the frontend — this will call a backend AI endpoint once connected.
      </p>
    </div>
  )
}
