from django.db import models


class ServiceCategory(models.TextChoices):
    MECHANIC = 'MECHANIC', 'Mechanic'
    PUNCTURE = 'PUNCTURE', 'Puncture Assistance'
    BATTERY = 'BATTERY', 'Battery Assistance'
    FUEL = 'FUEL', 'Fuel Delivery'
    TOWING = 'TOWING', 'Towing'
    CAR_REPAIR = 'CAR_REPAIR', 'Car Repair'
    TWO_WHEELER_REPAIR = 'TWO_WHEELER_REPAIR', 'Two-Wheeler Repair'
    SERVICE_CENTER = 'SERVICE_CENTER', 'Service Center'


class ProblemType(models.TextChoices):
    ENGINE_PROBLEM = 'ENGINE_PROBLEM', 'Engine Problem'
    STARTING_PROBLEM = 'STARTING_PROBLEM', 'Starting Problem'
    OVERHEATING = 'OVERHEATING', 'Overheating'
    BRAKE_PROBLEM = 'BRAKE_PROBLEM', 'Brake Problem'
    CLUTCH_PROBLEM = 'CLUTCH_PROBLEM', 'Clutch Problem'
    GEAR_PROBLEM = 'GEAR_PROBLEM', 'Gear Problem'

    PUNCTURE = 'PUNCTURE', 'Puncture'
    FLAT_TYRE = 'FLAT_TYRE', 'Flat Tyre'
    TYRE_REPLACEMENT = 'TYRE_REPLACEMENT', 'Tyre Replacement'

    DEAD_BATTERY = 'DEAD_BATTERY', 'Dead Battery'
    BATTERY_REPLACEMENT = 'BATTERY_REPLACEMENT', 'Battery Replacement'
    JUMP_START = 'JUMP_START', 'Jump Start'

    OUT_OF_FUEL = 'OUT_OF_FUEL', 'Out of Fuel'
    PETROL_DELIVERY = 'PETROL_DELIVERY', 'Petrol Delivery'
    DIESEL_DELIVERY = 'DIESEL_DELIVERY', 'Diesel Delivery'

    ACCIDENT = 'ACCIDENT', 'Accident'
    VEHICLE_CANNOT_MOVE = 'VEHICLE_CANNOT_MOVE', 'Vehicle Cannot Move'
    NEED_TOWING = 'NEED_TOWING', 'Need Towing'

    OTHER = 'OTHER', 'Other Problem'


# Maps each problem type to the service category it should route to —
# mirrors PROBLEM_CATEGORIES in the frontend's data/services.js so the
# AI assistant and request-creation flow stay consistent with the UI.
PROBLEM_TO_SERVICE = {
    ProblemType.ENGINE_PROBLEM: ServiceCategory.MECHANIC,
    ProblemType.STARTING_PROBLEM: ServiceCategory.MECHANIC,
    ProblemType.OVERHEATING: ServiceCategory.MECHANIC,
    ProblemType.BRAKE_PROBLEM: ServiceCategory.MECHANIC,
    ProblemType.CLUTCH_PROBLEM: ServiceCategory.MECHANIC,
    ProblemType.GEAR_PROBLEM: ServiceCategory.MECHANIC,

    ProblemType.PUNCTURE: ServiceCategory.PUNCTURE,
    ProblemType.FLAT_TYRE: ServiceCategory.PUNCTURE,
    ProblemType.TYRE_REPLACEMENT: ServiceCategory.PUNCTURE,

    ProblemType.DEAD_BATTERY: ServiceCategory.BATTERY,
    ProblemType.BATTERY_REPLACEMENT: ServiceCategory.BATTERY,
    ProblemType.JUMP_START: ServiceCategory.BATTERY,

    ProblemType.OUT_OF_FUEL: ServiceCategory.FUEL,
    ProblemType.PETROL_DELIVERY: ServiceCategory.FUEL,
    ProblemType.DIESEL_DELIVERY: ServiceCategory.FUEL,

    ProblemType.ACCIDENT: ServiceCategory.TOWING,
    ProblemType.VEHICLE_CANNOT_MOVE: ServiceCategory.TOWING,
    ProblemType.NEED_TOWING: ServiceCategory.TOWING,

    ProblemType.OTHER: ServiceCategory.MECHANIC,
}

# Base pricing used as the starting point for backend-calculated charges
# (see assistance/pricing.py). Never trust a frontend-submitted total.
SERVICE_BASE_CHARGE = {
    ServiceCategory.MECHANIC: 400,
    ServiceCategory.PUNCTURE: 200,
    ServiceCategory.BATTERY: 350,
    ServiceCategory.FUEL: 150,
    ServiceCategory.TOWING: 900,
    ServiceCategory.CAR_REPAIR: 500,
    ServiceCategory.TWO_WHEELER_REPAIR: 250,
    ServiceCategory.SERVICE_CENTER: 0,
}
