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
│   ├── App.jsx               # All 12 routes with ProtectedRoute
│   ├── index.css             # Tailwind + custom classes (btn-primary, card, input-field, text-card)
│   ├── hooks/
│   │   └── useAuth.jsx       # AuthProvider context + useAuth hook
│   ├── services/
│   │   ├── firebase.js       # Firebase init + DB helpers + generateReferenceNumber
│   │   ├── emailjs.js        # EmailJS REST sender
│   │   └── haversine.js      # calculateDistance, formatDistance, isWithinRange
│   ├── utils/
│   │   └── errors.js         # getFirebaseErrorMessage — user-friendly Firebase auth error codes
│   ├── components/
│   │   ├── Footer.jsx        # Social links, contact info (used in Landing/Login/Signup)
│   │   ├── BottomNav.jsx     # 3-tab nav: Map | Orders | Profile
│   │   ├── WaterStationCard.jsx  # Station card with status, pricing, distance, actions
│   │   ├── OrderTicketItem.jsx   # Order list item with status badge, ref#, total
│   │   └── HowToOrderDialog.jsx  # 5-step modal dialog
│   └── pages/
│       ├── Splash.jsx        # Auth-aware redirect (1.5s → /maps or /main)
│       ├── Landing.jsx       # Logo + Login/Signup buttons + Footer
│       ├── Login.jsx         # signInWithEmailAndPassword + user-friendly errors
│       ├── Signup.jsx        # Duplicate phone check (orderByChild), createUser, write to /users
│       ├── Home.jsx          # "Why Aqua-llera" info pages + BottomNav
│       ├── Maps.jsx          # Mapbox map + station markers + user location + station list
│       ├── StoreDetails.jsx  # Station details: hours, services, prices, about
│       ├── CreateOrder.jsx   # Water type + quantity + Delivery/Pickup + date/time + GPS
│       ├── OrderConfirmation.jsx  # Summary + payment breakdown + save to Firebase + email
│       ├── OrderSuccess.jsx  # Success page with order details
│       ├── Orders.jsx        # User's orders list (filtered by userId) + BottomNav
│       ├── Profile.jsx       # Avatar, account details, edit/logout/maps/orders/home
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
| `/home` | Yes | Home (info) |
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
- `pricing_gallon_pure`, `pricing_liter_spring`, `pricing_gallon_mineral` — prices
- `pricing_delivery_fee` — delivery fee (nullable, fallback 50)
- `businessHours`: `{ "Monday": "8:00 AM - 5:00 PM", ... }`
- `offered_services`: `["Delivery", "Pickup"]`
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
  "transactionFee": 20.0,
  "grandTotal": 120.0,
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

Required Firebase Realtime Database rules (currently in use). **Must add `.indexOn: "number"` to the `users` node** to support the duplicate phone number check in Signup:

```json
{
  "rules": {
    "users": {
      ".read": true,
      ".write": true,
      ".indexOn": "number"
    },
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
VITE_FIREBASE_AUTH_DOMAIN=aquallera.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://aquallera-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=aquallera
VITE_FIREBASE_STORAGE_BUCKET=aquallera.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=432017337394
VITE_FIREBASE_APP_ID=1:432017337394:web:f62e953b995675cbaa602b

# EmailJS (same service used by Android app)
VITE_EMAILJS_SERVICE_ID=service_6q0e89w
VITE_EMAILJS_TEMPLATE_ID=template_2rk5qyq
VITE_EMAILJS_PUBLIC_KEY=fpu4u65UlHZOE96yR

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# REACT_APP_ prefixes kept for backwards compatibility
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=aquallera.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://aquallera-default-rtdb.asia-southeast1.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=aquallera
REACT_APP_FIREBASE_STORAGE_BUCKET=aquallera.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=432017337394
REACT_APP_FIREBASE_APP_ID=1:432017337394:web:f62e953b995675cbaa602b
REACT_APP_EMAILJS_SERVICE_ID=service_6q0e89w
REACT_APP_EMAILJS_TEMPLATE_ID=template_2rk5qyq
REACT_APP_EMAILJS_PUBLIC_KEY=fpu4u65UlHZOE96yR
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

### Duplicate Phone Number Check
- Signup queries `/users` with `orderByChild('number')` and `equalTo()`
- This requires `.indexOn: "number"` in Firebase rules on the `users` node
- On success, writes `{ uid, fullName, email, number, createdAt }` to `/users/{uid}`

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
- `useAuth.jsx` provides `{ user, loading }` context via `onAuthStateChanged`
- `ProtectedRoute` component wraps all authenticated pages, redirects to `/main` if not logged in
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

### Maps
- Mapbox GL JS loaded from npm package (not CDN)
- Token: `your_mapbox_token` (see `.env`)
- Default center: Baguio City `[120.5931, 16.4164]`, zoom 11
- Water station markers are custom div elements (blue circle with 💧 emoji)
- User location shown as blue marker with "You are here" popup
- Station markers have click handlers that fly to the station and select it
- Mapbox NavigationControl added to top-left

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

### Bundle too large for PWA service worker
The `workbox.maximumFileSizeToCacheInBytes` in `vite.config.js` is set to 4 MiB to accommodate mapbox-gl. If the bundle grows further, increase this limit or use dynamic imports for code-splitting.

### Build fails with JSX in .js file
Rename the file to `.jsx`. Example: `useAuth.js` was renamed to `useAuth.jsx` because it contains JSX.

---

## Android App Reference

The original Android app source is at `~/Desktop/Github/aqullera-app`. Key files for reference:

| File | Purpose |
|---|---|
| `OrderConfirmationActivity.kt:224-258` | Reference number generation logic (same as PWA) |
| `OrderConfirmationActivity.kt:261-308` | Order object creation (data model) |
| `Order.kt` | Order data class (all fields) |
| `CreateOrderActivity.kt` | Create order form |
| `res/layout/*.xml` | Layout files (18 total, visual reference) |
| `res/drawable/` | Images (logo PNGs copied to PWA's public/) |
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

## TODO / Known Gaps

1. **Firebase rules** — Add `.indexOn: "number"` to `users` node for signup duplicate phone check
2. **orderCounter cleanup** — The `orderCounter` node may need periodic cleanup for old dates
3. **Order detail view** — Clicking an order in the Orders list doesn't open a detail view (currently only displays summary via OrderTicketItem)
4. **PWA icons** — The Android drawable logo files are copied but the `icons/icon-192x192.png` and `icons/icon-512x512.png` need to be generated/resized from the logo
5. **Offline support** — The PWA service worker precaches assets but no offline fallback pages are implemented
6. **Mapbox fallback** — Currently only Mapbox GL JS is configured; Leaflet fallback from `package.json` (react-leaflet, leaflet) is installed as a dependency but not imported anywhere
7. **API key is hardcoded in .env** — Should be kept secure and not committed to git
