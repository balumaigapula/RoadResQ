"""
Backend-authoritative pricing. The frontend may show an *estimate*, but the
number that is ever billed comes from here — never trust a submitted total
(project requirement #35).
"""
from decimal import Decimal

from services.models import SERVICE_BASE_CHARGE

PER_KM_TRAVEL_RATE = Decimal('25')
CRITICAL_PRIORITY_SURCHARGE = Decimal('100')


def calculate_service_charge(service_category: str) -> Decimal:
    return Decimal(SERVICE_BASE_CHARGE.get(service_category, 300))


def calculate_travel_charge(distance_km) -> Decimal:
    if not distance_km:
        return Decimal('50')
    return (Decimal(str(distance_km)) * PER_KM_TRAVEL_RATE).quantize(Decimal('1'))


def calculate_charges(service_category: str, distance_km=None, priority='NORMAL', parts_cost=0, additional_charge=0):
    service_charge = calculate_service_charge(service_category)
    travel_charge = calculate_travel_charge(distance_km)
    additional = Decimal(str(additional_charge or 0))
    if priority == 'CRITICAL':
        additional += CRITICAL_PRIORITY_SURCHARGE

    parts = Decimal(str(parts_cost or 0))
    total = service_charge + travel_charge + parts + additional
    return {
        'estimated_service_charge': service_charge,
        'travel_charge': travel_charge,
        'parts_cost': parts,
        'additional_charge': additional,
        'total_amount': total,
    }
