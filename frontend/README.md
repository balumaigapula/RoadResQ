# RoadResQ — Frontend

"Help On Every Mile" — a roadside assistance web app. **Frontend only**: React + Vite +
Tailwind CSS, built against mock data and a service-layer that mirrors the future
Django REST Framework + MySQL API.

## Getting started

```bash
npm install
cp .env.example .env   # fill in values when the backend / Google Maps key exist
npm run dev
```

Open the printed local URL. The app works fully offline against mock/local data —
no backend is required to explore every screen.

**Demo login** (any password, 4+ characters):
- Customer: `arjun.customer@roadresq.in`
- Provider: `ravi.provider@roadresq.in`
- Admin: `admin@roadresq.in`

## Project structure

```
src/
  components/      Reusable UI: common/, cards/, forms/, maps/, modals/, notifications/
  layouts/         PublicLayout, AuthLayout, CustomerLayout, ProviderLayout, AdminLayout
  pages/           public/, auth/, customer/, provider/, admin/, common/
  services/        api.js + one file per domain (auth, vehicle, provider, assistance,
                   location, tracking, payment, review, notification, invoice, ai)
  data/            Mock data shaped like the future backend responses
  context/         AuthContext, ToastContext
  hooks/           useGeolocation, useLocalStorage, useMediaQuery
  utils/storage.js Single localStorage access point
  routes/          ProtectedRoute (role-based route guarding)
```

## Design system

- **Colors**: `rescue` (RoadResQ orange — CTAs, SOS, active states) and `navy`
  (sidebars, headers, dark surfaces), plus `ash` (neutrals) and semantic
  `success` / `warning` / `danger` / `info`. Defined in `tailwind.config.js`.
- **Type**: Sora (display/headings) + Inter (body) — loaded in `index.html`.
- **Motif**: a dashed "road line" (`.route-line` in `index.css`) is reused as a
  structural divider throughout, echoing the road icon in the logo.
- The official RoadResQ logo (`src/assets/images/logo.png`) is used everywhere
  a brand mark is needed — see `components/common/Logo.jsx`.

## Backend-ready architecture

Nothing in `src/pages` or `src/components` talks to `localStorage`, the network,
or the Geolocation API directly — everything goes through `src/services/*` or
`src/hooks/*`. Every service file contains the mock implementation **and** a
commented-out real implementation using `api.js` (Axios), so wiring up Django
REST Framework later is a matter of swapping method bodies, not rewriting pages.

- `VITE_API_BASE_URL` — Django REST Framework base URL
- `VITE_GOOGLE_MAPS_API_KEY` — when set, swap `MapView`'s static preview for a
  real `<GoogleMap>` (see the comment block at the top of
  `components/maps/MapView.jsx`)
- OTP is never hardcoded or faked — `authService.verifyOTP` / `resendOTP` are
  fully wired to the UI (auto-focus, paste, countdown, attempt-limiting,
  expired/invalid states) and simply reject with `BACKEND_NOT_CONNECTED` until
  a real endpoint exists.
- Profile photo upload is prepared for `multipart/form-data` (see
  `components/common/ProfileImageUploader.jsx`).
- Live tracking (`services/trackingService.js`) is structured for WebSockets;
  the current polling simulation is clearly flagged as `isSimulated: true` in
  both the code and the UI, never presented as real GPS.

## What's mocked vs. real

| Feature | Status |
|---|---|
| Routing, layouts, all 60+ pages | Fully built |
| Auth (login/register), vehicles, requests, reviews, notifications | Real UI + localStorage persistence |
| OTP verify/resend, password reset | Real UI, backend call intentionally unimplemented |
| Nearby providers, match score, AI diagnosis | Deterministic mock logic, structured like a future API response |
| Map (location picking, provider markers, live tracking) | Custom styled preview, Google-Maps-ready |
| Live tracking updates | Local simulation, clearly labeled as such |
| Payments, invoices | Mock computation, no real payment gateway |
