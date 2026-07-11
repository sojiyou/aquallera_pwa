# Aqua-llera PWA

A Progressive Web App for Baguio City residents to locate nearby water refilling stations and order clean water for delivery or pickup. Part of a capstone project alongside the Android app (`aqullera-app`) and admin dashboard (`aquallera_web`), all sharing the same Firebase project.

## Features

- **Maps & Station Discovery** — Interactive Mapbox map with custom SVG station markers, user location (pulsing dot), draggable bottom sheet panel with status filters (All / Online / Offline / Pending).
- **Store Details** — Station info, operating hours, delivery days, services, pricing, and online/offline status.
- **Order Creation** — Multi-water-type ordering (Pure/Gallon, Spring/Liter, Mineral/Gallon) with independent +/- counters; Delivery or Pickup options; address autocomplete; available date selection based on station delivery days.
- **Order Management** — Orders list with status filter tabs, receipt-style detail view, cancel option, and revoked order handling.
- **Email Notifications** — Order confirmation emails via EmailJS using the same service as the Android app.
- **Email Verification** — Full-page blocker with auto-polling every 5s; verified-only access to all protected routes.
- **User Profile** — Avatar, account details, email verification status, edit name/email/phone.

## Tech Stack

- Vite 5 + React 18 + React Router 6
- TailwindCSS 3 — utility-first CSS
- Firebase v12 — Auth (email/password) + Realtime Database
- Mapbox GL JS v3 — interactive maps
- EmailJS — REST API for order confirmation emails
- vite-plugin-pwa — service worker + manifest for PWA installability

## Getting Started

### `npm run dev`

Starts the dev server with Vite hot reload at [http://localhost:5173](http://localhost:5173).

### `npm run build`

Production build to the `dist/` folder (includes PWA service worker via workbox).

### `npm run preview`

Preview the production build locally.

## Vercel Deployment

Configured via `vercel.json`. Framework auto-detected as Vite; builds to `dist/`; all routes rewrite to `/index.html` for React Router SPA support. Node `>=18` required (set via `engines` in `package.json`).

Set all `VITE_*` and `REACT_APP_*` environment variables in the Vercel dashboard (Firebase config, EmailJS credentials, Mapbox token).

## Mobile Responsiveness

All pages use `h-dvh` (dynamic viewport height) instead of `h-screen` to account for mobile browser chrome. BottomNav includes `safe-area-inset-bottom` padding for notched phones.

| Component | Behavior |
|---|---|
| **Maps** | Full-height map with draggable bottom panel snapping to 3 heights: peek (15%), default (55%), expanded (85%). Station markers scale with zoom; labels fade below zoom 13. Floating selected-station chip with "View" button. |
| **Orders** | Card layout with status badge, reference number, total, revoked banner; status filter tabs. |
| **Create Order** | Modal for water type quantities; Delivery/Pickup toggle; address autocomplete; date dropdown (30-day lookahead). |
| **Bottom Nav** | 3-tab navigation: Map, Orders, Profile. Sticky bottom with safe-area padding. |

## Recent Changes

| Date | Commit | Changes |
|------|--------|---------|
| Jul 11 | `53effab` | Global font size bump — all Tailwind text sizes increased by 2px |
| Jul 11 | `29f6fa7` | Status filter dropdown (All / Online / Offline / Pending) in Maps station list |
| Jul 11 | `6002d6c` | Selected station card moved from bottom to top of map |
| Jul 11 | `08e2860` | StoreDetails: fixed online/isOnline status; added Delivery Days card |
| Jul 11 | `764aa83` | Timezone fix in availableDates: `toLocaleDateString('en-CA')` instead of `toISOString()` |
| Jul 11 | `64dde5a` | Timezone fix for today — use local time instead of UTC |
| Jul 11 | `8184ee8` | Auto-default nearest delivery date when none selected |
| Jul 11 | `2b3aa17` | Delivery date dropdown (select instead of date buttons); 30-day lookahead |
| Jul 11 | `77add4e` | Reorganized README to match aquallera_web format; added Session Log section |
| Jul 11 | `d3f1416` | Pagination (10 per page) with Previous/Next controls; increased container padding |
| Jul 11 | `a1795f7` | Replaced Vite "A" favicon with Aquallera logo mark |
| Jul 11 | `4f9f907` | Updated page title from "Aqua-llera" to "Aquallera: PWA" |
| Jul 11 | `f2a7545` | Reduced card sizes (p-4→p-3, text-lg→text-base); more container padding; PAGE_SIZE set to 5 |
| Jul 11 | `b7fbf13` | Replaced splash page "A" icon with Aquallera logo; regenerated PWA install icons |
| Jul 11 | `628cc8c` | Fixed Footer globe link not clickable on Login/Signup — added `pointer-events-none` to wave SVG overlay |
| Jul 11 | `26fb419` | Increased container padding to `px-6`; compacted card sizes (text-sm title, text-xs rows, text-base price) |
| Jul 11 | `eddbb5a` | Constrained order card width to `max-w-xs` (320px) centered via `mx-auto` |
| Jul 11 | `1229256` | Increased card max-width from 320px to 384px |
| Jul 11 | `045a418` | Adjusted card max-width to 416px |
| Jul 11 | `d2f7434` | Added "More payment options coming soon" indicator to CreateOrder; added payment method display to order receipt |

## Session Log

| Session ID | What we did |
|---|---|
| `2026-07-04` | Initial commit — scaffold Vite + React + Tailwind + Firebase + Mapbox setup; basic splash, login, signup, and verify-email pages; Landing page with Footer component |
| `2026-07-06` | Map improvements with station markers, user location, overlapping layout; multi-water-type ordering (Pure/Spring/Mineral); service-based Delivery/Pickup toggle; address autocomplete; receipt-style order confirmation; 12-hour time format |
| `2026-07-07` | Overlapping map layout with draggable bottom sheet (3 snap heights); email verification with auto-polling; Nunito font integration; transaction fee update (₱5); station labels on map; About section rewrites; removed auto-location and Mapbox controls |
| `2026-07-08` | Vercel deployment setup (`vercel.json`, Node engine); responsive mobile layout (`h-dvh`, safe-area-inset-bottom); date/time picker refinements (native inputs, wheel picker, iOS fixes); order status handling (revoked stations, auto-cancel, warning banners, status filter tabs); password toggle; footer globe link; removed emoji icons |
| `2026-07-09` | SVG icons in bottom navigation; unified order status colors (blue gradient); available delivery date buttons from station deliveryDays; pull-to-refresh prevention; human-readable status labels; Tailwind JIT color fix |
| `2026-07-11` | Global font size bump (+2px); status filter dropdown in Maps; selected station card moved to top; StoreDetails online/isOnline fix + Delivery Days card; timezone fixes; delivery date dropdown with 30-day lookahead; auto-default nearest delivery date; README reorganization with Session Log; pagination (10→5 per page) with Previous/Next controls; container padding increase; card size reduction; Vite "A" favicon replaced with Aquallera logo; page title updated to "Aquallera: PWA"; splash page "A" icon replaced with logo; PWA install icons regenerated from actual logo; fixed Footer globe link on Login/Signup (pointer-events-none on wave overlay); card compacting (text-sm title, text-xs details, text-base price); card width constrained to 416px max; added payment method display to receipt; added "More payment options coming soon" badge to CreateOrder |

## Payment

Currently only **Cash on Delivery** is supported.

- **Data model:** The `paymentMethod` field is part of every order (defaults to `"Cash on Delivery"`)
- **Order creation:** `CreateOrder.jsx:110` — hardcoded to `"Cash on Delivery"` for all orders
- **Receipt display:** `OrderReceipt.jsx` — shows payment method in the order details section
- **Coming soon indicator:** A pulsing amber dot with "More payment options coming soon" appears on the Create Order page

### Planned

- Credit/debit card payments
- Online banking / e-wallet options (GCash, Maya, etc.)
- Payment method selection UI at order creation

## Known Gaps

1. **Firebase rules** — Add `.indexOn: ["number", "email"]` to `users` and `.indexOn: "email"` to `waterStations` for signup duplicate checks
2. **Offline support** — Service worker precaches assets but no offline fallback pages are implemented
3. **Env vars** — Placeholder values in `.env` need to be replaced with real keys before deployment
