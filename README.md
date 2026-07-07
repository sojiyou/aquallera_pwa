# Aqua-llera PWA

A Progressive Web App for Baguio City residents to locate nearby water refilling stations and order clean water for delivery or pickup. Part of a capstone project consisting of three components:

| Component | Path | Purpose |
|---|---|---|
| **Android App** | `~/Desktop/Github/aqullera-app` | Native mobile app (Kotlin) |
| **Admin Website** | `~/Desktop/Github/aquallera_web` | Dashboard for water station owners to process orders |
| **PWA (this)** | `~/Desktop/Github/aquallera-pwa` | Cross-platform customer-facing app (React + PWA) |

All three share the same Firebase project (`aquallera`) and Realtime Database (`https://aquallera-default-rtdb.asia-southeast1.firebasedatabase.app`).

---

## Architecture

### Stack
- **Vite 5** + **React 18** + **React Router 6**
- **TailwindCSS 3** — utility-first CSS, no component library
- **Firebase v12** — Auth (email/password) + Realtime Database
- **Mapbox GL JS v3** — interactive maps with station markers
- **EmailJS** — REST API for order confirmation emails
- **vite-plugin-pwa** — service worker + manifest for PWA installability
- **Nunito** (Google Fonts) — Soft, rounded sans-serif font for a friendly UI

### Project Structure

```
aquallera-pwa/
├── .env                      # All secrets (Firebase, EmailJS, Mapbox)
├── vite.config.js            # PWA + React plugin config
├── tailwind.config.js        # Exact Android color palette mapping
├── public/
│   ├── logo.png              # Full logo (from Android drawable)
│   ├── logo-no-name.png      # Logo without text (from Android drawable)
│   └── icons/icon-{192,512}x{192,512}.png  # PWA icons
├── src/
│   ├── main.jsx              # Entry: BrowserRouter + AuthProvider
│   ├── App.jsx               # All 14 routes + ProtectedRoute with email guard + Nunito font
│   ├── index.css             # Tailwind + custom classes (btn-primary, card, input-field, text-card)
│   ├── hooks/
│   │   └── useAuth.jsx       # AuthProvider context + useAuth hook (exposes emailVerified)
│   ├── services/
│   │   ├── firebase.js       # Firebase init + DB helpers + generateReferenceNumber + sendEmailVerification
│   │   ├── emailjs.js        # EmailJS REST sender
│   │   └── haversine.js      # calculateDistance, formatDistance, isWithinRange
│   ├── utils/
│   │   ├── errors.js         # getFirebaseErrorMessage — user-friendly Firebase auth error codes
│   │   └── formatTime.js     # to12Hour — converts 24h "14:30" → "2:30 PM"
│   ├── components/
│   │   ├── Footer.jsx        # Social links, contact info (used in Landing/Login/Signup)
│   │   ├── BottomNav.jsx     # 3-tab nav: Map | Orders | Profile
│   │   ├── WaterStationCard.jsx  # Station card with status, pricing, distance, actions
│   │   ├── OrderTicketItem.jsx   # Order list item with status badge, ref#, total
│   │   ├── OrderReceipt.jsx      # Shared receipt-style order detail component
│   │   └── HowToOrderDialog.jsx  # 5-step modal dialog
│   └── pages/
│       ├── Splash.jsx        # Auth-aware redirect (1.5s → /maps or /main)
│       ├── Landing.jsx       # Logo + Login/Signup buttons + Footer
│       ├── Login.jsx         # signInWithEmailAndPassword + auto-creates /users record + gradient wave bg
│       ├── Signup.jsx        # Duplicate phone+email checks, createUser, sendEmailVerification, gradient wave bg
│       ├── VerifyEmail.jsx   # Full-page email verification blocker with auto-polling every 5s
│       ├── About.jsx         # "What is Aqua-llera", "Why make Aquallera", "How to Order"
│       ├── Maps.jsx          # Mapbox map + station markers + user location button + station list
│       ├── StoreDetails.jsx  # Station details: hours, delivery hours, services, prices, about
│       ├── CreateOrder.jsx   # Water type + qty + Delivery/Pickup + address autocomplete + delivery time slots
│       ├── OrderConfirmation.jsx  # Receipt-style confirm + save to Firebase + email
│       ├── OrderSuccess.jsx  # Success page with order details
│       ├── Orders.jsx        # User's orders list — tap card to see receipt detail
│       ├── Profile.jsx       # Avatar, account details, email verification card, edit/logout/maps/orders/about
│       └── EditProfile.jsx   # Edit name/email/phone → writes to /users/{uid}
```

---

## Routes

| Path | Auth Required | Page |
|---|---|---|
| `/` | No | Splash (auto-redirect) |
| `/main` | No | Landing |
| `/login` | No | Login |
| `/signup` | No | Signup |
| `/verify-email` | No (redirects to /main if logged out) | Email verification blocker |
| `/about` | Yes | About Aquallera |
| `/maps` | Yes | Maps + station list |
| `/store/:id` | Yes | Station details |
| `/create-order/:id` | Yes | New order form |
| `/order-confirmation` | Yes | Confirm order |
| `/order-success` | Yes | Order placed |
| `/orders` | Yes | My orders |
| `/profile` | Yes | Profile |
| `/edit-profile` | Yes | Edit profile |

---

## Firebase Realtime Database Structure

### Data model reference

Root paths used by the PWA + admin website + Android app:

| Path | Used By | Notes |
|---|---|---|
| `/users/{uid}` | PWA | User profiles: `{ uid, fullName, email, number, createdAt }` |
| `/waterStations/{stationId}` | PWA + admin + Android | Station profiles with pricing, hours, status, stock, etc. |
| `/orders/{orderId}` | PWA + admin + Android | Orders stored flat at root, key = orderId (e.g., `AQU-20260427-0042`) |
| `/orderCounter/{yyyyMMdd}` | PWA + Android | Daily auto-incrementing counter for reference number generation |
| `/admins` | Admin website | Admin accounts for dashboard login |

### Users node (`/users/{uid}`)

```json
{
  "uid": "abc123...",
  "fullName": "Juan Dela Cruz",
  "email": "juan@example.com",
  "number": "09171234567",
  "createdAt": 1745769600000
}
```

### Water stations node (`/waterStations/{stationId}`)

Key fields used by the PWA:
- `stationName`, `address`, `latitude`, `longitude`
- `status`: `"pending"` | `"approved"` | `"rejected"`
- `online`: boolean (set by station owner's dashboard)
- `isOnline`: boolean (auto-presence flag — set on dashboard login via `onDisconnect`)
- `pricing_gallon_pure`, `pricing_liter_spring` / `pricing_gallon_spring`, `pricing_gallon_mineral` — prices
- `pricing_delivery_fee` — delivery fee (nullable, fallback 50)
- `businessHours`: `{ "Monday": "8:00 AM - 5:00 PM", ... }`
- `serviceTypes`: `["delivery", "pickup"]` — lowercase; drives available order types in CreateOrder and displayed services in StoreDetails
- `deliveryHours`: `["08:00", "09:00", "10:00", ...]` — array of HH:mm delivery time slots
- `about`: description text
- `openNow`: boolean

### Orders node (`/orders/{orderId}`)

The order ID format matches the Android app: `{stationPrefix}-{yyyyMMdd}-{counter}` (e.g. `AQU-20260427-0042`).

The `generateReferenceNumber(stationName)` function in `src/services/firebase.js:23` does a Firebase `runTransaction` on `orderCounter/{dateStr}` to atomically increment it, exactly like the Android app.

Full order data model (matching Android `Order.kt`):

```json
{
  "orderId": "AQU-20260427-0042",
  "referenceNumber": "AQU-20260427-0042",
  "stationId": "-NJk3...",
  "stationName": "Aquallera Water Station",
  "customerId": "abc123...",
  "customerName": "Juan Dela Cruz",
  "customerPhone": "09171234567",
  "orderType": "Delivery",
  "status": "Pending",
  "date": "2026-04-27",
  "time": "14:30",
  "pureWaterQty": 0,
  "pureWaterPrice": 0,
  "pureWaterTotal": 0,
  "springWaterQty": 2,
  "springWaterPrice": 25.0,
  "springWaterTotal": 50.0,
  "mineralWaterQty": 0,
  "mineralWaterPrice": 0,
  "mineralWaterTotal": 0,
  "waterSubtotal": 50.0,
  "deliveryFee": 50.0,
   "transactionFee": 5.0,
   "grandTotal": 105.0,
  "deliveryLatitude": 16.4123,
  "deliveryLongitude": 120.5931,
  "locationDetails": "123 Session Rd, Baguio City",
  "deliveryAddress": "123 Session Rd, Baguio City",
  "additionalDetails": "Leave at gate",
  "paymentMethod": "Cash on Delivery",
  "createdAt": "2026-04-27T06:30:00.000Z",
  "updatedAt": "2026-04-27T06:30:00.000Z",
  "userId": "abc123..."
}
```

The admin website's status flow (from `Dashboard.js`):
```
pending → confirmed → preparing → (on_delivery for Delivery | ready for Pickup) → completed
                                                                          ↕ cancelled
```

### Order counter node (`/orderCounter/{yyyyMMdd}`)

```json
{
  "20260427": 42
}
```

Auto-incremented by `runTransaction` on each order placement. Resets per day.

---

## Firebase Rules

Required Firebase Realtime Database rules (currently in use). **Must add `.indexOn` to `users` and `waterStations` nodes** to support duplicate phone/email checks on signup:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": ["number", "email"]
    },
    "waterStations": {
      ".read": true,
      ".write": true,
      ".indexOn": "email",
      "$stationId": {
    "admins": {
      ".read": true,
      ".write": true
    },
    "waterStations": {
      ".read": true,
      ".write": true,
      "$stationId": {
        ".read": true,
        ".write": true,
        "monthlyArchive": {
          ".read": true,
          ".write": true
        },
        "yearlyRevenue": {
          ".read": true,
          ".write": true
        }
      }
    },
    "orders": {
      ".read": true,
      ".write": true
    },
    "orderCounter": {
      ".read": true,
      ".write": true
    }
  }
}
```

---

## Environment Variables (`.env`)

```env
# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# EmailJS (same service used by Android app)
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# REACT_APP_ prefixes kept for backwards compatibility
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

**Note:** The admin website (`aquallera_web`) uses the same Firebase/EmailJS values **hardcoded** in its source files (not in `.env`). Keep them in sync.

---

## Color Palette

Exact mapping from Android's `colors.xml` to Tailwind:

| Android Name | Hex | Tailwind Class |
|---|---|---|
| `midnight_blue` | `#191970` | `text-midnight-blue`, `bg-midnight-blue` |
| `midnight_active` | `#010113` | `bg-midnight-active` |
| `app_bg` | `#FFFCF2` | `bg-app-bg` |
| `light_yellow` | `#E5C95F` | `text-light-yellow`, `bg-light-yellow` |
| `mist_gray` | `#ECEFF1` | `bg-mist-gray` |
| `footer_bg` | `#2F3C51` | `bg-footer-bg` |
| `order_list_bg` | `#F4E8BB` | `bg-order-list` |
| `input_bg` | `#D9D9D9` | `bg-input-bg` |
| `blue` | `#015084` | `text-blue` |

Custom component classes (defined in `src/index.css`):
- `btn-primary` — midnight blue bg, white text, scale on press
- `btn-secondary` — mist gray bg, midnight blue text
- `input-field` — full-width, rounded, `#D9D9D9` background
- `card` — white bg, rounded-xl, shadow-sm, p-5
- `text-card` — `#F4E7BB` bg, rounded-lg, p-3

---

## Key Design Decisions

### Reference Number Generation
- **Format:** `{stationPrefix}-{yyyyMMdd}-{counter}` (e.g. `AQU-20260427-0042`)
- **Station prefix:** First 3 letters of station name, uppercase, letters only (fallback `WTR`)
- **Counter:** Daily auto-incrementing counter stored at `orderCounter/{yyyyMMdd}` in Firebase, atomically incremented via `runTransaction` — same logic as the Android app (`OrderConfirmationActivity.kt:224-258`)
- **Firebase key:** The order is stored at `orders/{orderId}` using `set()` not `push()`, matching the Android app

### Duplicate Phone & Email Checks
- Signup queries `/users` with `orderByChild('number')` and `equalTo()` for duplicate phone
- Also queries `/users` with `orderByChild('email')` and `equalTo()` for duplicate customer email
- Also queries `/waterStations` with `orderByChild('email')` and `equalTo()` for duplicate station owner email
- These require `.indexOn: ["number", "email"]` on the `users` node and `.indexOn: "email"` on the `waterStations` node
- On success, writes `{ uid, fullName, email, number, createdAt }` to `/users/{uid}`

### Login Auto-Create User Record
- After successful `signInWithEmailAndPassword`, Login checks if `/users/{uid}` exists
- If missing, checks `/waterStations/{uid}` for station owner data — creates user record from `ownerName`/`stationName` and `phone`
- If missing from both, creates a minimal user record with email and empty fields
- This ensures station owners who signed up on the admin website can log in to the PWA

### Email Verification
- `sendEmailVerification(cred.user)` is called right after account creation in Signup
- The `useAuth` context exposes `emailVerified` from the Firebase Auth user object
- **ProtectedRoute in App.jsx** checks `user.emailVerified` — unverified users are blocked from all protected routes (maps, orders, profile, etc.) and redirected to `/verify-email`
- **`VerifyEmail.jsx`** is a full-page blocker that:
  - Shows the user's email with instructions to check their inbox
  - Automatically polls every **5 seconds** via `auth.currentUser.reload()`
  - When verified is detected, triggers a page reload → `onAuthStateChanged` picks up the new status → redirects to `/maps`
  - "Resend verification email" button with console error logging
  - "Back to Login" to sign out
- `CreateOrder.jsx` also checks `user.emailVerified` as a secondary guard — amber warning banner + "Preview Order" disabled when unverified
- `Profile.jsx` shows a verification status card with:
  - ✅ **Email Verified** badge (green) when confirmed
  - ⚠️ **Email not verified** warning (amber) with "Resend verification email" and "Refresh status" button
  - The "Refresh status" button calls `auth.currentUser.reload()` and updates local state
- All three apps share the same Firebase project, so the sender name "Aquallera" applies universally

### Multi-Water-Type Ordering
- All three water types (Pure/Gallon, Spring/Liter, Mineral/Gallon) have independent +/- counters
- Quantities start at 0; user can order any combination (e.g. 2 Pure + 3 Spring + 1 Mineral)
- At least one type must have qty > 0 to enable "Preview Order"
- Subtotal sums across all types; each type's line total is stored individually in the order

### Order Type Filtering
- The available order types ("Delivery", "Pickup") are derived from the station's `serviceTypes` array in Firebase
- Pickup-only stations only show "Pickup" (auto-selected); delivery-only only shows "Delivery"
- Stations with both or no services set show both options (default: "Delivery")

### 12-Hour Time Format
- `src/utils/formatTime.js` provides `to12Hour()` — regex-based converter for `HH:mm` → `h:mm AM/PM`
- Applied to order time display in preview, business hours in StoreDetails, and email template params
- Raw `HH:mm` value is still stored in Firebase for data consistency

### Order Data Model
- The PWA writes orders in the **same format** as the Android app (`Order.kt` data class)
- The admin website (`Dashboard.js`) reads all orders and filters by `stationId` client-side
- Additional `userId` field is written to allow the PWA to filter orders for the current user (admin website ignores unknown fields)
- Status uses `"Pending"` (capital P) matching the Android app; admin website handles case-insensitive comparison

### Admin Website Compatibility
The admin website at `~/Desktop/Github/aquallera_web` is a separate Create React App that:
- Reads all orders from `/orders` and filters by `order.stationId` (client-side)
- Expects fields: `orderId`, `stationId`, `customerName`, `customerPhone`, `orderType`, `status`, `grandTotal`, `waterSubtotal`, `transactionFee`, `deliveryFee`, `pureWaterQty`, `springWaterQty`, `mineralWaterQty`, `pureWaterTotal`, `springWaterTotal`, `mineralWaterTotal`, `date`, `referenceNumber`, `createdAt`, `updatedAt`, `deliveryLatitude`, `deliveryLongitude`, `additionalDetails`, `locationDetails`
- Uses hardcoded admin login (`admin@aquallera.com` / `admin123`) plus `/admins` node
- Never uses `/users` path or `orderByChild` queries
- Same Firebase config hardcoded in `src/components/config/Firebase.js`
- Same EmailJS config in `src/components/services/EmailService.js`

### Authentication
- Firebase Auth with email/password only
- `useAuth.jsx` provides `{ user, loading }` context via `onAuthStateChanged` (includes `emailVerified`)
- **Email verification** (`sendEmailVerification`) sent after signup — all protected routes blocked until verified
  - `ProtectedRoute` checks `emailVerified` and redirects to `/verify-email`
  - `VerifyEmail.jsx` auto-polls every 5s and auto-redirects once verified
  - Profile and CreateOrder show secondary verification status UIs
- **Signup** (`Signup.jsx`): Duplicate phone check (`orderByChild('number')`), duplicate email check against `/users` and `/waterStations`, creates Firebase Auth user, writes to `/users/{uid}`, sends verification email, redirects to `/verify-email`
- **Login** (`Login.jsx`): `signInWithEmailAndPassword` + auto-creates `/users/{uid}` record if missing (also checks `/waterStations/{uid}` for station owner fallback)
- `ProtectedRoute` component wraps all authenticated pages, redirects to `/main` if not logged in, redirects to `/verify-email` if email not verified
- Admin website uses its **own separate** auth (hardcoded credentials + `/admins` node), not Firebase Auth

### EmailJS
- REST API call to `https://api.emailjs.com/api/v1.0/email/send`
- Uses the same `service_6q0e89w` service ID as the Android app
- Template params: `to_email`, `customer_name`, `station_name`, `order_type`, `order_date`, `order_time`, `reference_number`, `total`, `status`
- Error handling: silently catches failures (doesn't block order placement)

### Error Handling
- `src/utils/errors.js` maps Firebase Auth error codes to user-friendly messages
- Used in Login and Signup pages
- Covers: `auth/email-already-in-use`, `auth/invalid-email`, `auth/weak-password`, `auth/user-not-found`, `auth/wrong-password`, `auth/invalid-credential`, `auth/too-many-requests`, `auth/network-request-failed`, `auth/internal-error`, `permission-denied`

### Login & Signup UI Design
- **Gradient background:** Dark blue gradient (`bg-gradient-to-b from-blue to-midnight-blue`) with decorative wave SVG overlay at 10% opacity
- **Wave SVG:** 3-path wave design in light-yellow (`#E5C95F`) and white, covering the full background
- **White card:** Form content sits in a `bg-white rounded-xl shadow-lg` card for contrast against the dark background
- **Logo:** Clean logo without text (`/logo-no-name.png`) to reduce visual clutter
- **Max-width forms:** Both pages use `max-w-md mx-auto` to prevent inputs from stretching too wide on tablets
- Both pages share this design for visual consistency

### Maps
- Mapbox GL JS loaded from npm package (not CDN) — CSS imported directly in the component
- Token: `VITE_MAPBOX_TOKEN` (see `.env`)
- Default center: Burnham Park, Baguio `[120.593, 16.412]`, zoom 11
- Viewport constrained to Baguio City bounds (`[[120.52, 16.36], [120.67, 16.46]]`)
- **Overlapping layout:** Map fills the full container height; station list overlays as a draggable bottom panel with rounded top corners
- **Draggable bottom sheet:** Panel snaps to three heights — **peek (15%)**, **default (55%)**, **expanded (85%)** — via mouse/touch drag on the handle bar
- Station markers are custom SVG pins (midnight blue drop shape, scales with zoom)
- Each marker has a **station name label** above it that scales with zoom and fades out below zoom 13 to prevent clutter
- Station markers have click handlers that fly to the station, select it, and auto-expand the panel to show nearby cards
- A floating chip appears above the panel when a station is selected (name, address, "View" button, ✕ to deselect)
- User location: **pulsing marker** (animated ring, blue dot with white center, scales with zoom)
- On load: map shows Burnham Park centered at default zoom 11
- User location is requested only on button click (no auto-fly on load)
- ResizeObserver on the map container keeps the map sized correctly after layout shifts
- Window resize listener + `map.resize()` on 'load' event for responsive sizing
- No map controls (NavigationControl and attribution are removed for a cleaner UI)

### WaterStationCard Distance
- Calculates distance using haversine formula (inlined in component)
- Fallback to `src/services/haversine.js` for `formatDistance`

---

## Scripts

```bash
npm run dev       # Start dev server (Vite hot reload)
npm run build     # Production build → dist/ (includes PWA service worker)
npm run preview   # Preview production build locally
```

---

## Common Issues & Fixes

### "Index not defined" on signup
Add `.indexOn: "number"` to the `users` node in Firebase Realtime Database rules.

### "auth/api-key-not-valid"
The `VITE_FIREBASE_API_KEY` or `REACT_APP_FIREBASE_API_KEY` in `.env` is a placeholder. Update it with the real key from the Firebase Console or from `aquallera_web/src/components/config/Firebase.js`.

### "Permission denied" on database operations
Check Firebase Realtime Database rules. The paths `/users`, `/orders`, `/waterStations`, `/orderCounter`, `/admins` must all have `.read: true, .write: true` (or appropriate auth rules).

### "Failed to send verification email"
Open the browser console (F12) to see the exact Firebase error code. Common causes:
- `auth/unauthorized-continue-uri` — Add your app's URL to Firebase Console → Authentication → Settings → Authorized domains
- `auth/too-many-requests` — Firebase rate-limited email sending; wait a few minutes
- Firebase Spark plan email quota exceeded — wait 24h or upgrade

### Bundle too large for PWA service worker
The `workbox.maximumFileSizeToCacheInBytes` in `vite.config.js` is set to 4 MiB to accommodate mapbox-gl. If the bundle grows further, increase this limit or use dynamic imports for code-splitting.

### Build fails with JSX in .js file
Rename the file to `.jsx`. Example: `useAuth.js` was renamed to `useAuth.jsx` because it contains JSX.

---

## Android App Reference

The Android app source is at `~/Desktop/Github/aqullera-app`. **Conversion complete** — all 14 PWA pages now have matching Android activities.

### Conversion Status

| PWA Page | Android Activity | Status |
|---|---|---|
| Splash.jsx | `SplashActivity` | ✅ |
| Landing.jsx | `MainActivity` | ✅ |
| Login.jsx | `LoginActivity` | ✅ redesigned (wave gradient, floating inputs) |
| Signup.jsx | `SignupActivity` | ✅ redesigned (wave gradient, floating inputs) |
| VerifyEmail.jsx | `VerifyEmailActivity` | ✅ |
| About.jsx | `AboutActivity` | ✅ |
| Maps.jsx | `MapActivity` | ✅ pixel-match |
| StoreDetails.jsx | `StoreDetailsActivity` | ✅ |
| CreateOrder.jsx | `CreateOrderActivity` | ✅ pixel-match |
| OrderConfirmation.jsx | `OrderConfirmationActivity` | ✅ pixel-match |
| OrderSuccess.jsx | `OrderSuccessActivity` | ✅ |
| Orders.jsx | `OrdersActivity` | ✅ pixel-match |
| Profile.jsx | `ProfileActivity` | ✅ pixel-match |
| EditProfile.jsx | `EditProfileActivity` | ✅ |

### Key Files

| File | Purpose |
|---|---|
| `OrderConfirmationActivity.kt:224-258` | Reference number generation logic (same as PWA) |
| `OrderConfirmationActivity.kt:261-308` | Order object creation (data model) |
| `Order.kt` | Order data class (all fields + `transactionFee`) |
| `WaterStation.kt` | Station data class (incl. `about` field) |
| `CreateOrderActivity.kt` | Create order form with Mapbox Geocoding |
| `LoginActivity.kt` / `SignupActivity.kt` | Wave gradient + floating label inputs |
| `res/layout/*.xml` | Layout files (13 layouts, one per activity + shared) |
| `res/drawable/` | 55+ XML drawables + logo PNGs |
| `res/values/colors.xml` | Color definitions |

---

## Admin Website Reference

The admin website is at `~/Desktop/Github/aquallera_web`. Key files:

| File | Purpose |
|---|---|
| `src/components/config/Firebase.js` | Hardcoded Firebase config |
| `src/components/services/EmailService.js` | Hardcoded EmailJS config |
| `src/components/dashboard/Dashboard.js` | Order processing dashboard (reads `/orders`, filters by `stationId`) |
| `src/components/admin/AdminPage.js` | Admin auth + station approval |
| `src/components/stock/Stock.js` | Inventory management |
| `src/utils/revenueCalculator.js` | Revenue calculations from orders |
| `src/utils/consumptionCalculator.js` | Consumption calculations from orders |
| `src/utils/monthlyArchiver.js` | Monthly data archiving |
| `src/utils/yearlyReportGenerator.js` | Yearly report generation |

---

## Conversion Status

**All 14 PWA pages have been converted to native Android activities** (`~/Desktop/Github/aqullera-app`). The Android app is an exact pixel-replica using Kotlin + XML layouts, sharing the same Firebase Auth + Realtime Database. Remaining work for the capstone:

- [ ] Build/compile on Android Studio to verify no resource errors
- [ ] Generate signed APK for submission

## TODO / Known Gaps

1. **Firebase rules** — Add `.indexOn: ["number", "email"]` to `users` and `.indexOn: "email"` to `waterStations` for signup duplicate checks (currently only works if indexes exist or dataset is small)
2. **Admin website email verification** — Station owner signup on `aquallera_web` does not send `sendEmailVerification`, and login does not check `emailVerified`. Should be added for consistency.
3. **orderCounter cleanup** — The `orderCounter` node may need periodic cleanup for old dates
4. **PWA icons** — The Android drawable logo files are copied but the `icons/icon-192x192.png` and `icons/icon-512x512.png` need to be generated/resized from the logo
5. **Offline support** — The PWA service worker precaches assets but no offline fallback pages are implemented
6. **API key is hardcoded in .env** — Should be kept secure and not committed to git
