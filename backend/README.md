# RoadResQ — Backend

Django REST Framework + MySQL backend for the existing RoadResQ React frontend.
Built to match the frontend's routes, service files (`src/services/*.js`), and
mock data shapes exactly — no frontend changes required beyond pointing
Axios at this API and replacing the mock bodies in each service file with
real `api.get/post/...` calls (the commented-out "Future:" snippets already
in each service file show exactly what to swap in).

## 1. Setup

```bash
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env              # then fill in DB_*, SECRET_KEY, etc.

# Create the MySQL database first (MySQL only, per project requirements):
#   CREATE DATABASE roadresq CHARACTER SET utf8mb4;

python manage.py migrate
python manage.py seed_data        # optional but recommended — realistic dev data
python manage.py createsuperuser  # optional, seed_data already creates admin@roadresq.in

# HTTP + WebSocket (Channels) in one process, via Daphne:
daphne -p 8000 config.asgi:application
# or, for plain HTTP during quick iteration:
python manage.py runserver
```

Seeded accounts (see `common/management/commands/seed_data.py`):
- Admin: `admin@roadresq.in` / `Admin@12345`
- Customers: `arjun.customer@roadresq.in` and 3 others / `Customer@123`
- Providers: `ravi.provider@roadresq.in` and 4 others / `Provider@123`

API docs: `http://localhost:8000/api/docs/` (drf-spectacular / Swagger UI).
Django admin: `http://localhost:8000/admin/`.

## 2. Project structure

```
config/            settings, root urls, asgi (Channels) / wsgi
accounts/          custom User model, OTP, JWT auth, profile
vehicles/          Vehicle CRUD, ownership-scoped
services/          ServiceCategory / ProblemType reference data (no DB table — TextChoices)
providers/         ProviderProfile, ProviderLocation, nearby search + match scoring
locations/         server-side reverse geocoding (Google Maps key never reaches the frontend)
assistance/        AssistanceRequest, status machine, SOS, WebSocket tracking consumer
payments/          Payment model, backend-authoritative pricing, Razorpay stub
reviews/           Review model, auto-updates provider rating
notifications/     Notification model + `notify()` helper used by every other app
invoices/          Invoice model + reportlab PDF generation
ai_assistant/      Rule-based diagnosis (mirrors the frontend mock) + optional external AI call
dashboard/         Admin-only aggregation + CRUD endpoints
common/            response envelope, pagination, exception handling, shared permissions, seed_data command
```

Business logic lives in each app's `services.py`/`matching.py`/`pricing.py`/`otp.py`,
not in views, per the "don't put logic in views" requirement — views stay
thin: validate input, call the service layer, return the response envelope.

## 3. Frontend → API mapping

Every endpoint below matches an existing frontend service method 1:1.

| Frontend service call | Backend endpoint |
|---|---|
| `authService.register()` | `POST /api/auth/register/` |
| `authService.verifyOTP()` | `POST /api/auth/verify-otp/` |
| `authService.resendOTP()` | `POST /api/auth/resend-otp/` |
| `authService.login()` | `POST /api/auth/login/` |
| — (Axios interceptor) | `POST /api/auth/refresh/` |
| `authService.logout()` | `POST /api/auth/logout/` |
| `authService.getCurrentUser()` | `GET /api/auth/me/` |
| Profile page | `GET/PATCH /api/auth/profile/`, `POST/DELETE /api/auth/profile/image/`, `POST /api/auth/change-password/` |
| Forgot/reset password pages | `POST /api/auth/forgot-password/`, `POST /api/auth/verify-password-otp/`, `POST /api/auth/reset-password/` |
| `vehicleService.*` | `GET/POST /api/vehicles/`, `GET/PUT/PATCH/DELETE /api/vehicles/<id>/`, `POST /api/vehicles/<id>/set-primary/` |
| Services/problem reference data | `GET /api/services/categories/`, `GET /api/services/problem-types/` |
| `locationService.reverseGeocode()` | `POST /api/locations/reverse-geocode/` |
| `providerService.getNearbyProviders()` | `GET /api/providers/nearby/?latitude=&longitude=&service_type=&radius=` |
| `providerService.getProviderById()` | `GET /api/providers/<id>/` |
| Provider "go online" toggle | `POST /api/providers/status/` |
| Provider location updates | `GET/POST /api/providers/location/` |
| Provider profile page | `GET/PATCH /api/providers/me/` |
| `assistanceService.createRequest()` | `POST /api/assistance/requests/` |
| SOS modal | `POST /api/assistance/sos/` |
| `assistanceService.getRequests()` (customer) | `GET /api/customer/requests/?tab=active|pending|completed|cancelled` |
| Request detail / tracking page | `GET /api/customer/requests/<request_number>/` |
| Cancel request | `POST /api/customer/requests/<request_number>/cancel/` |
| Service History | `GET /api/customer/history/`, `GET /api/customer/history/<request_number>/` |
| Provider Requests page | `GET /api/provider/requests/`, `.../accept/`, `.../reject/` |
| Provider Active Service page | `GET /api/provider/active-service/`, `.../on-the-way/`, `.../arrived/`, `.../start/`, `.../complete/` |
| Provider History | `GET /api/provider/history/` |
| `trackingService.subscribe()` | `wss://.../ws/requests/<request_number>/tracking/?token=<access>` |
| `paymentService.*` | `POST /api/payments/create/`, `POST /api/payments/<id>/process/`, `GET /api/payments/`, `GET /api/payments/<id>/` |
| `reviewService.submitReview()` | `POST /api/reviews/` |
| `reviewService.getReviews()` | `GET /api/customer/reviews/`, `GET /api/reviews/provider/<provider_id>/` |
| `notificationService.*` | `GET /api/notifications/`, `POST /api/notifications/<id>/read/`, `POST /api/notifications/read-all/` |
| `invoiceService.getInvoiceById()` | `GET /api/invoices/by-request/<request_number>/`, `GET /api/invoices/<id>/` |
| `invoiceService.downloadInvoice()` | `GET /api/invoices/<id>/download/` (PDF) |
| `aiService.analyzeSymptoms()` | `POST /api/ai/analyze/` |
| Admin Dashboard | `GET /api/admin/dashboard/` |
| Admin Users | `GET /api/admin/users/`, `GET/PATCH /api/admin/users/<id>/` |
| Admin Providers | `GET /api/admin/providers/`, `.../approve/`, `.../reject/`, `.../suspend/` |
| Admin Requests/Payments/Reviews | `GET /api/admin/requests/`, `GET /api/admin/payments/`, `GET /api/admin/reviews/` |

## 4. Response envelope

Every endpoint returns the same shape the frontend can branch on generically:

```json
{ "success": true,  "message": "Request created successfully", "data": {} }
{ "success": false, "message": "Unable to create request",     "errors": {} }
```

This is enforced globally via `common.exceptions.roadresq_exception_handler` and
`common.response.success/error` — no view returns a bare DRF default error shape,
and no Python/Django stack trace is ever exposed to the client.

## 5. Security notes (what the frontend must never be trusted for)

- **Total price** — always recalculated server-side (`assistance/pricing.py`); a
  client-submitted total/charge field is simply not part of any accepted
  request body.
- **Distance/ETA** — computed via Haversine from real stored coordinates
  (`providers/matching.py`), never accepted from the client.
- **Ownership** — every vehicle/request/payment/review endpoint filters by
  `request.user` server-side; a customer cannot address another customer's
  vehicle or request by guessing an ID (`get_object_or_404(..., customer=request.user)`
  pattern throughout).
- **Role** — `common/permissions.py` (`IsCustomer`, `IsProvider`, `IsAdminRole`,
  `IsApprovedProvider`) checks the *database* role on every request; the
  frontend's role-based UI is a convenience, not a security boundary.
- **OTP** — 6-digit, cryptographically random (`secrets.randbelow`), stored only
  as a SHA-256 hash, expires in `OTP_EXPIRY_MINUTES`, capped at
  `OTP_MAX_ATTEMPTS`, rate-limited on resend, and never included in any API
  response.

## 6. What's structurally stubbed (and why)

These are real, working interfaces with a clearly marked extension point —
not silently faked — because they need credentials/services this environment
doesn't have:

- **SMS OTP** (`accounts/otp.py: send_otp_sms`) — provider-independent
  dispatcher; email OTP is fully functional (SMTP if configured, console
  backend otherwise) and is the primary/authoritative channel per the spec.
- **Razorpay** (`payments/gateways.py`) — `CASH`/`UPI` payments are fully
  real end-to-end; `ONLINE` payments return HTTP 501 until
  `RAZORPAY_KEY_ID`/`SECRET` are set and the SDK calls are filled in at the
  two marked spots.
- **External AI provider** (`ai_assistant/diagnosis.py`) — calls
  `AI_API_URL`/`AI_API_KEY` if configured; otherwise uses the same rule-based
  logic already in the frontend's mock `aiService.js`, so behavior is
  identical either way.
- **Channels layer** — defaults to `InMemoryChannelLayer` (single-process
  only, fine for local dev/demo). Set `REDIS_URL` for anything
  multi-process/production; the settings already branch on this.
- **Push notifications** (`FIREBASE_CREDENTIALS`) — env var reserved, not
  wired up; in-app `Notification` rows + the WebSocket tracking channel cover
  the frontend's real-time needs today.

## 7. Tests

```bash
python manage.py test
```

Covers the core flows end-to-end (registration → OTP → login, vehicle
ownership isolation, Haversine/match-score correctness, request creation with
backend-authoritative pricing, the full status state machine including
rejected/invalid transitions, SOS priority, provider assignment guards,
reviews, and notification scoping). This is a representative core suite, not
an exhaustive test for every bullet in the original spec — treat it as the
foundation to extend alongside new endpoints.

## 8. Known environment limitation for this delivery

This backend was written and syntax-checked (`python -m py_compile` / `ast.parse`
across every file, all clean) in a sandboxed environment with **no network
access**, so `pip install`, `python manage.py migrate` against a real MySQL
instance, and `python manage.py test` could not actually be executed here.
Everything is structured the standard Django way and should run as-is once
dependencies are installed against a real MySQL database — but you are the
first real test. If `pip install` or `migrate` surfaces an error, share it and
it'll be fixed immediately.
