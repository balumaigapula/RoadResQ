"""
Real distance and match-score calculation for nearby provider search —
no random or hardcoded values (per project requirement #18/#19).
"""
import math
from decimal import Decimal


def haversine_km(lat1, lon1, lat2, lon2) -> float:
    """Great-circle distance between two lat/lng points, in kilometres."""
    lat1, lon1, lat2, lon2 = map(lambda v: math.radians(float(v)), [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    R = 6371.0
    return R * c


def estimate_eta_minutes(distance_km: float) -> int:
    # ~28 km/h effective urban average speed + fixed dispatch overhead.
    return max(4, round((distance_km / 28) * 60) + 3)


def compute_match_score(distance_km: float, rating: Decimal, is_available: bool, acceptance_rate: Decimal) -> int:
    """
    Weighted score out of 100 combining distance, rating, availability and
    historical acceptance rate — mirrors (and formalizes) the logic already
    used in the frontend's providerService.js mock, now computed server-side
    from real data instead of guessed.
    """
    distance_score = max(0.0, 100 - float(distance_km) * 10)
    rating_score = (float(rating) / 5) * 100 if rating else 60.0
    availability_score = 100.0 if is_available else 35.0
    acceptance_score = float(acceptance_rate)

    score = (
        distance_score * 0.30
        + rating_score * 0.35
        + availability_score * 0.20
        + acceptance_score * 0.15
    )
    return int(round(min(99, max(1, score))))
