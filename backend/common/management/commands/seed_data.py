import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from assistance.models import AssistanceRequest, RequestPriority, RequestStatus
from notifications.models import Notification
from payments.models import Payment, PaymentMethod, PaymentStatus
from providers.models import ProviderLocation, ProviderProfile
from reviews.models import Review
from vehicles.models import Vehicle

CUSTOMER_DATA = [
    ('Arjun', 'Mehta', 'arjun.customer@roadresq.in', '+919876543210'),
    ('Sneha', 'Reddy', 'sneha.reddy@example.com', '+919876500001'),
    ('Kabir', 'Singh', 'kabir.singh@example.com', '+919876500002'),
    ('Meera', 'Iyer', 'meera.iyer@example.com', '+919876500003'),
]

PROVIDER_DATA = [
    ('Ravi', 'Kumar', 'ravi.provider@roadresq.in', '+919123456780', 'Ravi Auto Care', ['MECHANIC', 'BATTERY'], 17.4239, 78.4738),
    ('Suresh', 'Naidu', 'suresh.naidu@example.com', '+919123456781', 'Hyderabad Tyre Point', ['PUNCTURE', 'MECHANIC'], 17.4400, 78.4482),
    ('Lakshmi', 'Rao', 'lakshmi.rao@example.com', '+919123456782', 'PowerCharge Battery Experts', ['BATTERY'], 17.3850, 78.4867),
    ('Imran', 'Shaikh', 'imran.shaikh@example.com', '+919123456783', 'QuickFuel Delivery', ['FUEL'], 17.4126, 78.4071),
    ('Venkatesh', 'Rao', 'venkatesh.rao@example.com', '+919123456784', 'Sai Towing & Recovery', ['TOWING'], 17.4483, 78.3915),
]

VEHICLES = [
    ('Car', 'AP05AB1234', 'Maruti Suzuki', 'Swift VXI', 'Petrol', 2021),
    ('Two-Wheeler', 'TS07GH8834', 'Royal Enfield', 'Classic 350', 'Petrol', 2022),
    ('Car', 'TS09EA4521', 'Hyundai', 'i20 Sportz', 'Petrol', 2020),
]


class Command(BaseCommand):
    help = 'Seed the database with realistic RoadResQ development data (Indian names, ₹ pricing).'

    def handle(self, *args, **options):
        self.stdout.write('Seeding RoadResQ data...')

        admin_user, created = User.objects.get_or_create(
            email='admin@roadresq.in',
            defaults=dict(first_name='Admin', last_name='User', phone='+919000000000',
                          role=User.Role.ADMIN, is_verified=True, is_staff=True, is_superuser=True),
        )
        if created:
            admin_user.set_password('Admin@12345')
            admin_user.save()
        self.stdout.write(f'  Admin: {admin_user.email} / Admin@12345')

        customers = []
        for first, last, email, phone in CUSTOMER_DATA:
            user, created = User.objects.get_or_create(
                email=email, defaults=dict(first_name=first, last_name=last, phone=phone,
                                            role=User.Role.CUSTOMER, is_verified=True))
            if created:
                user.set_password('Customer@123')
                user.save()
            customers.append(user)
        self.stdout.write(f'  Customers: {len(customers)} (password: Customer@123)')

        providers = []
        for first, last, email, phone, business, services, lat, lng in PROVIDER_DATA:
            user, created = User.objects.get_or_create(
                email=email, defaults=dict(first_name=first, last_name=last, phone=phone,
                                            role=User.Role.PROVIDER, is_verified=True))
            if created:
                user.set_password('Provider@123')
                user.save()
            profile, _ = ProviderProfile.objects.get_or_create(
                user=user,
                defaults=dict(
                    business_name=business, service_types=services, experience_years=random.randint(2, 12),
                    phone=phone, email=email, address='Hyderabad, Telangana', latitude=Decimal(str(lat)),
                    longitude=Decimal(str(lng)), is_online=True,
                    verification_status=ProviderProfile.VerificationStatus.APPROVED,
                    rating=Decimal(str(round(random.uniform(4.0, 4.9), 2))),
                    total_reviews=random.randint(20, 300), completed_services=random.randint(50, 1500),
                    acceptance_rate=Decimal(str(round(random.uniform(80, 98), 2))),
                ),
            )
            profile.latitude = Decimal(str(lat))
            profile.longitude = Decimal(str(lng))
            profile.business_name = business
            profile.service_types = services
            profile.is_online = True
            profile.verification_status = ProviderProfile.VerificationStatus.APPROVED
            profile.save()
            ProviderLocation.objects.get_or_create(provider=profile, defaults={'latitude': lat, 'longitude': lng})
            providers.append(profile)
        self.stdout.write(f'  Providers: {len(providers)} (password: Provider@123)')

        vehicles = []
        for i, (vtype, number, brand, model, fuel, year) in enumerate(VEHICLES):
            owner = customers[i % len(customers)]
            vehicle, _ = Vehicle.objects.get_or_create(
                user=owner, vehicle_number=number,
                defaults=dict(vehicle_type=vtype, brand=brand, model=model, fuel_type=fuel, year=year, is_primary=True),
            )
            vehicles.append(vehicle)
        self.stdout.write(f'  Vehicles: {len(vehicles)}')

        services_pool = ['MECHANIC', 'BATTERY', 'PUNCTURE', 'FUEL', 'TOWING']
        created_requests = 0
        for i in range(8):
            customer = random.choice(customers)
            provider = random.choice(providers)
            vehicle = Vehicle.objects.filter(user=customer).first()
            service = random.choice(services_pool)
            status = random.choice([RequestStatus.COMPLETED, RequestStatus.COMPLETED, RequestStatus.CANCELLED, RequestStatus.ON_THE_WAY])

            req = AssistanceRequest.objects.create(
                request_number=AssistanceRequest.generate_request_number(),
                customer=customer, provider=provider, vehicle=vehicle,
                service_category=service, priority=RequestPriority.NORMAL,
                latitude=provider.latitude, longitude=provider.longitude, address='Hyderabad, Telangana',
                city='Hyderabad', state='Telangana', postal_code='500081',
                status=status,
                estimated_distance_km=Decimal(str(round(random.uniform(1, 8), 1))),
                estimated_eta_minutes=random.randint(6, 25),
                estimated_service_charge=Decimal(random.choice([200, 350, 400, 600])),
                travel_charge=Decimal(random.choice([75, 100, 150])),
                parts_cost=Decimal(random.choice([0, 0, 150, 300])),
            )
            req.recalculate_total()
            req.save()
            created_requests += 1

            if status == RequestStatus.COMPLETED:
                payment = Payment.objects.create(
                    request=req, customer=customer, provider=provider,
                    service_charge=req.estimated_service_charge, travel_charge=req.travel_charge,
                    parts_cost=req.parts_cost, additional_charge=req.additional_charge,
                    total_amount=req.total_amount, payment_method=random.choice(list(PaymentMethod.values)),
                    payment_status=PaymentStatus.SUCCESS, paid_at=timezone.now(),
                )
                Review.objects.get_or_create(
                    request=req, defaults=dict(
                        customer=customer, provider=provider, rating=random.randint(3, 5),
                        comment=random.choice([
                            'Reached quickly and fixed the issue on the spot.',
                            'Good service, slightly delayed but kept me updated.',
                            'Professional and fairly priced.',
                        ]),
                    ),
                )
            Notification.objects.get_or_create(
                recipient=customer, request=req, notification_type='REQUEST_RECEIVED',
                defaults=dict(title='Request Received', message=f'Your request {req.request_number} has been received.'),
            )

        self.stdout.write(f'  Assistance requests: {created_requests} (with payments/reviews for completed ones)')
        self.stdout.write(self.style.SUCCESS('Seed complete.'))
