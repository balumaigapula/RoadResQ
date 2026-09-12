import api from './api'

const RULES = [
  { keywords: ['not start', "won't start", 'weak headlight', 'dim light', 'battery'], issue: 'Battery Problem', service: 'Battery Assistance', urgency: 'High' },
  { keywords: ['flat', 'puncture', 'tyre', 'tire'], issue: 'Tyre Puncture', service: 'Puncture Assistance', urgency: 'Medium' },
  { keywords: ['fuel', 'petrol', 'diesel', 'empty tank'], issue: 'Out of Fuel', service: 'Fuel Delivery', urgency: 'Medium' },
  { keywords: ['overheat', 'smoke', 'steam'], issue: 'Engine Overheating', service: 'Mechanic', urgency: 'High' },
  { keywords: ['accident', 'crash', "can't move", 'cannot move'], issue: 'Vehicle Immobile', service: 'Towing', urgency: 'Critical' },
  { keywords: ['brake'], issue: 'Brake Problem', service: 'Mechanic', urgency: 'High' },
]

async function analyzeSymptoms(description) {
  try {
    const res = await api.post('/ai/analyze/', { description })
    const d = res.data.data
    return {
      issue: d.possible_issue,
      service: d.recommended_service,
      urgency: d.urgency,
      confidence: 0.92,
      suggestedAction: d.suggested_action,
    }
  } catch (err) {
    const text = (description || '').toLowerCase()
    const match = RULES.find((r) => r.keywords.some((k) => text.includes(k)))
    if (!match) {
      return {
        issue: 'Unclear — more detail needed',
        service: 'Mechanic',
        urgency: 'Medium',
        confidence: 0.4,
        suggestedAction: 'Describe what you hear, see, or smell for a more precise diagnosis.',
      }
    }
    return {
      issue: match.issue,
      service: match.service,
      urgency: match.urgency,
      confidence: 0.86,
      suggestedAction: `Request ${match.service} — a nearby provider can assist.`,
    }
  }
}

export const aiService = { analyzeSymptoms }
export default aiService