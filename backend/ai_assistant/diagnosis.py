"""
Rule-based fallback diagnosis (mirrors the frontend's aiService.js so
behaviour is identical whether or not AI_API_KEY is configured), plus an
optional call-out to an external AI provider when a key IS configured.
Never expose AI_API_KEY to the frontend — this endpoint is the only thing
that ever sees it.
"""
import requests
from django.conf import settings

RULES = [
    (['not start', "won't start", 'weak headlight', 'dim light', 'battery'],
     'Battery Problem', 'BATTERY', 'HIGH'),
    (['flat', 'puncture', 'tyre', 'tire'], 'Tyre Puncture', 'PUNCTURE', 'MEDIUM'),
    (['fuel', 'petrol', 'diesel', 'empty tank'], 'Out of Fuel', 'FUEL', 'MEDIUM'),
    (['overheat', 'smoke', 'steam'], 'Engine Overheating', 'MECHANIC', 'HIGH'),
    (['accident', 'crash', "can't move", 'cannot move'], 'Vehicle Immobile', 'TOWING', 'CRITICAL'),
    (['brake'], 'Brake Problem', 'MECHANIC', 'HIGH'),
]

SERVICE_LABELS = {
    'BATTERY': 'Battery Assistance', 'PUNCTURE': 'Puncture Assistance', 'FUEL': 'Fuel Delivery',
    'MECHANIC': 'Mechanic', 'TOWING': 'Towing',
}


def rule_based_diagnosis(description: str) -> dict:
    text = description.lower()
    for keywords, issue, service, urgency in RULES:
        if any(k in text for k in keywords):
            return {
                'possible_issue': issue,
                'recommended_service': service,
                'urgency': urgency,
                'suggested_action': f'Request {SERVICE_LABELS[service]} — a nearby provider can assist.',
            }
    return {
        'possible_issue': 'Unclear — more detail needed',
        'recommended_service': 'MECHANIC',
        'urgency': 'MEDIUM',
        'suggested_action': 'Describe what you hear, see, or smell (e.g. warning lights, noises) for a more precise diagnosis.',
    }


def external_ai_diagnosis(description: str):
    """Calls an external AI provider only if AI_API_URL/AI_API_KEY are set.
    Returns None on any failure so the caller falls back to rule-based logic."""
    if not (settings.AI_API_KEY and settings.AI_API_URL):
        return None
    try:
        resp = requests.post(
            settings.AI_API_URL,
            headers={'Authorization': f'Bearer {settings.AI_API_KEY}'},
            json={'description': description},
            timeout=8,
        )
        resp.raise_for_status()
        data = resp.json()
        required = {'possible_issue', 'recommended_service', 'urgency', 'suggested_action'}
        if required.issubset(data):
            return data
        return None
    except requests.RequestException:
        return None


def diagnose(description: str) -> dict:
    return external_ai_diagnosis(description) or rule_based_diagnosis(description)
