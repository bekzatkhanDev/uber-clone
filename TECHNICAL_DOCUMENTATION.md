# Technical Documentation — Taxi App (Uber Clone)

**Version:** 1.0.0  
**Last Updated:** 2026-04-15  
**Platform:** iOS · Android · Web  
**Backend:** Django REST Framework  

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Architecture Overview](#4-architecture-overview)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Routing & Navigation](#6-routing--navigation)
7. [State Management](#7-state-management)
8. [API Layer](#8-api-layer)
9. [Data Types & Interfaces](#9-data-types--interfaces)
10. [Feature Modules](#10-feature-modules)
11. [Admin Panel](#11-admin-panel)
12. [Internationalization](#12-internationalization)
13. [Platform-Specific Code](#13-platform-specific-code)
14. [Styling System](#14-styling-system)
15. [Environment Configuration](#15-environment-configuration)

---

## 1. Project Overview

A full-stack taxi booking application built with Expo Router (React Native + Web). The app serves three user roles from a single codebase:

| Role | App Section | Entry Route |
|------|-------------|-------------|
| `customer` | Rider app | `/(root)/(tabs)/home` |
| `driver` | Driver app | `/(driver)/(tabs)/home` |
| `admin` | Admin panel | `/(admin)/(tabs)/dashboard` *(planned)* |

The app is designed for the Kazakhstan market with support for Kazakh (`kk`), Russian (`ru`), and English (`en`) languages. Russian is the default language.

---

## 2. Technology Stack

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native + Expo | `expo ~54.0.33` |
| Routing | Expo Router (file-based) | `~6.0.23` |
| Language | TypeScript | `~5.9.2` |
| UI Styling | NativeWind (Tailwind) | `^4.2.1` + `tailwindcss ^3.4.19` |
| Global State | Zustand | `^5.0.11` |
| Server State | TanStack React Query | `^5.90.21` |
| Animations | React Native Reanimated | `~4.1.1` |
| Bottom Sheet | @gorhom/bottom-sheet | `^5.2.8` |
| Maps (Web) | Leaflet + React Leaflet | `^1.9.4` / `^4.2.1` |
| Maps (Native) | React Native Maps | `^1.20.1` |
| Maps (Utility) | @react-google-maps/api | `^2.20.7` |
| Secure Storage | Expo SecureStore | `^15.0.8` |
| Image Picker | expo-image-picker | `^55.0.18` |
| Fonts | Plus Jakarta Sans | via `expo-font ~14.0.11` |

### Backend

| Layer | Technology |
|-------|-----------|
| Framework | Django REST Framework |
| Auth | JWT (access + refresh tokens) |
| Database | PostgreSQL (inferred) |
| API Style | REST — `/api/v1/` prefix |

---

## 3. Repository Structure

```
uber-clone/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root layout — providers, fonts, Stack
│   ├── index.tsx               # Entry point — auth check & role redirect
│   ├── +not-found.tsx          # 404 fallback screen
│   ├── (auth)/                 # Public auth screens (no token required)
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx / welcome.web.tsx
│   │   ├── role-select.tsx / role-select.web.tsx
│   │   ├── sign-in.tsx / sign-in.web.tsx
│   │   ├── sign-up.tsx / sign-up.web.tsx
│   │   └── driver-register.tsx / driver-register.web.tsx
│   ├── (root)/                 # Customer app (token required)
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx / home.web.tsx
│   │   │   ├── rides.tsx
│   │   │   ├── chat.tsx
│   │   │   └── profile.tsx
│   │   ├── find-ride.tsx
│   │   ├── confirm-ride.tsx
│   │   ├── book-ride.tsx
│   │   ├── chat/[tripId].tsx
│   │   ├── trip-share/index.tsx
│   │   └── profile/edit.tsx
│   ├── (driver)/               # Driver app (token + driver role required)
│   │   ├── _layout.tsx
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx / home.web.tsx
│   │   │   ├── trips.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── earnings.tsx
│   │   │   └── profile.tsx
│   │   └── profile/edit.tsx
│   ├── (public)/               # Public pages (no auth)
│   │   ├── _layout.tsx
│   │   └── tracks/[token].tsx  # Shareable trip tracking
│   └── (admin)/                # [PLANNED] Admin panel (token + admin role)
│       ├── _layout.tsx
│       ├── (tabs)/
│       │   ├── _layout.tsx
│       │   ├── dashboard.tsx
│       │   ├── users.tsx
│       │   ├── drivers.tsx
│       │   ├── trips.tsx
│       │   └── settings.tsx
│       ├── users/[id].tsx
│       ├── drivers/[id].tsx
│       └── trips/[id].tsx
├── components/                 # Shared UI components
│   ├── ui/                     # Base components (Button, Input, etc.)
│   ├── Map.tsx / Map.web.tsx
│   ├── Payment.tsx
│   ├── RideCard.tsx
│   └── BankSelector.tsx
├── hooks/                      # React Query hooks
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useTrips.ts
│   ├── useDriver.ts
│   ├── useDriverDashboard.ts
│   ├── useDriverProfile.ts
│   ├── useChat.ts
│   ├── useTariffs.ts
│   ├── useEstimate.ts
│   ├── useBulkTariffEstimate.ts
│   ├── usePayment.ts
│   ├── useTripSharing.ts
│   ├── useCars.ts
│   ├── useCurrentLocation.ts
│   ├── useUpdateLocation.ts
│   ├── useUserLocation.ts
│   ├── useLocation.ts
│   └── usePlaceSearch.ts
├── store/                      # Zustand stores
│   ├── authStore.ts            # Auth state
│   └── index.tsx               # Location + Driver stores
├── lib/                        # Utilities
│   ├── fetch.ts                # Public API fetch
│   ├── fetchWithAuth.ts        # Authenticated fetch + token refresh
│   ├── storage.ts              # SecureStore (native)
│   ├── storage.web.ts          # localStorage (web)
│   ├── auth.ts                 # Token cache setup
│   ├── utils.ts                # Role routing, formatting helpers
│   ├── validation.ts           # Input validation
│   ├── map.ts                  # Map utilities (native)
│   └── map.web.ts              # Map utilities (web)
├── types/
│   └── type.d.ts               # Global TypeScript interfaces
├── i18n/
│   ├── I18nProvider.tsx        # React Context provider
│   ├── index.ts                # Zustand i18n store
│   ├── en.json                 # English translations
│   ├── ru.json                 # Russian translations
│   └── kk.json                 # Kazakh translations
├── constants/
│   ├── index.ts                # Icon/image imports
│   ├── location.ts             # Location constants
│   └── theme.ts                # Theme tokens
├── assets/
│   ├── fonts/                  # PlusJakartaSans-*.ttf
│   ├── icons/
│   └── images/
├── .env                        # Environment variables (not in git)
├── .gitignore
├── app.json                    # Expo config
├── package.json
└── tsconfig.json
```

---

## 4. Architecture Overview

### Request Lifecycle

```
User Action
    │
    ▼
React Component
    │
    ▼
React Query Hook (useXxx)
    │  uses
    ▼
fetchWithAuth() / fetchAPI()        ← lib/fetchWithAuth.ts / lib/fetch.ts
    │  sends Bearer token
    ▼
Django REST API  →  /api/v1/{resource}/
    │  returns JSON
    ▼
React Query Cache  →  Component Re-render
```

### Token Refresh Flow

```
fetchWithAuth() sends request
    │
    ├── 200 OK → return response
    │
    └── 401 Unauthorized
            │
            ▼
        isRefreshing? ──yes──► queue request, wait for refreshPromise
            │ no
            ▼
        POST /auth/refresh/  { refresh: token }
            │
            ├── success → save new tokens → retry original request
            │
            └── failure → clearAuth() → router.replace('/(auth)/welcome')
```

### Role-Based Navigation

```
app/index.tsx startup
    │
    ├── getAuthToken() → null
    │       └── redirect → /(auth)/welcome
    │
    └── getAuthToken() → token
            │
            ▼
        getUserRoles()
            │
            ├── includes('admin')  → /(admin)/(tabs)/dashboard  [planned]
            ├── includes('driver') → /(driver)/(tabs)/home
            └── default            → /(root)/(tabs)/home
```

---

## 5. Authentication & Authorization

### Token Storage

| Platform | Access Token | Refresh Token | User Roles | User ID |
|----------|-------------|---------------|------------|---------|
| Native | `expo-secure-store` key: `access-token` | key: `refresh-token` | key: `user-roles` | key: `user-id` |
| Web | `localStorage` key: `access-token` | key: `refresh-token` | key: `user-roles` | key: `user-id` |

### Auth Store (`store/authStore.ts`)

```typescript
interface AuthStore {
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean

  setAuthenticated(value: boolean): void
  setLoading(value: boolean): void
  initialize(): Promise<void>   // reads 'access-token' from storage
  clearAuth(): Promise<void>    // removes access-token, refresh-token, user-roles
}
```

### Role Guard Pattern

Each protected route group uses the same async guard pattern in its `_layout.tsx`:

```typescript
// Example: app/(driver)/_layout.tsx
const [checked, setChecked] = useState(false);
const [allowed, setAllowed] = useState(false);

useEffect(() => {
  Promise.all([getAuthToken(), getUserRoles()]).then(([token, roles]) => {
    setAllowed(!!token && roles.includes('driver'));
    setChecked(true);
  });
}, []);

if (!checked) return null;
if (!allowed) return <Redirect href="/(root)/(tabs)/home" />;
```

### Available Roles

| Role | Access | Guard Location |
|------|--------|----------------|
| `customer` | `/(root)` | `app/(root)/_layout.tsx` — checks token only |
| `driver` | `/(driver)` | `app/(driver)/_layout.tsx` — checks token + `driver` role |
| `admin` | `/(admin)` | `app/(admin)/_layout.tsx` — checks token + `admin` role *(planned)* |

---

## 6. Routing & Navigation

### Route Groups

| Group | Path Prefix | Auth Required | Role Required |
|-------|------------|---------------|---------------|
| Auth | `/(auth)` | No | — |
| Public | `/(public)` | No | — |
| Customer | `/(root)` | Yes | — |
| Driver | `/(driver)` | Yes | `driver` |
| Admin | `/(admin)` | Yes | `admin` *(planned)* |

### Root Stack (`app/_layout.tsx`)

```typescript
// Providers wrapping order:
SafeAreaProvider
  └── QueryClientProvider  (retry: 2, staleTime: 5 min)
        └── I18nProvider
              └── Stack
                    ├── index
                    ├── (auth)
                    ├── (root)
                    ├── (driver)
                    ├── (public)
                    └── +not-found
```

### Customer Tabs (`app/(root)/(tabs)/_layout.tsx`)

| Tab | Route | Icon |
|-----|-------|------|
| Home | `home` | home icon |
| Rides | `rides` | list icon |
| Chat | `chat` | chat icon |
| Profile | `profile` | person icon |

Tab bar styling:
- **Web:** inline, `backgroundColor: #333333`, `height: 70`, labels visible (`fontSize: 11`)
- **Native:** floating pill, `backgroundColor: #333333`, `borderRadius: 50`, `height: 78`, absolute-positioned

### Driver Tabs (`app/(driver)/(tabs)/_layout.tsx`)

| Tab | Route | Purpose |
|-----|-------|---------|
| Home | `home` | Accept rides, toggle online |
| Trips | `trips` | Trip history |
| Chat | `chat` | Rider messages |
| Earnings | `earnings` | Revenue summary |
| Profile | `profile` | Driver profile |

### Customer Sub-Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/find-ride` | FindRide | Browse nearby drivers |
| `/confirm-ride` | ConfirmRide | Review & confirm booking |
| `/book-ride` | BookRide | Live booking status |
| `/chat/[tripId]` | Chat | Trip chat with driver |
| `/trip-share` | TripShare | Generate share link |
| `/profile/edit` | EditProfile | Edit name, photo |

### Public Routes

| Route | Screen | Purpose |
|-------|--------|---------|
| `/tracks/[token]` | TripTracker | Public trip tracking (auto-refresh 10s, 24h token) |

---

## 7. State Management

### Zustand Stores

#### Auth Store (`store/authStore.ts`)

```typescript
{
  isAuthenticated: boolean     // token exists in storage
  isLoading: boolean
  isInitialized: boolean       // initialize() has completed
}
```

#### Location Store (`store/index.tsx`)

```typescript
{
  userLatitude: number | null
  userLongitude: number | null
  userAddress: string | null
  destinationLatitude: number | null
  destinationLongitude: number | null
  destinationAddress: string | null
  selectedTariff: Tariff | null
  estimate: EstimateData | null
  selectedPaymentMethod: string | null
}
```

Actions: `setUserLocation`, `setDestinationLocation`, `clearDestination`, `setSelectedTariff`, `clearSelectedTariff`, `setEstimate`, `clearEstimate`, `setSelectedPaymentMethod`

#### Driver Store (`store/index.tsx`)

```typescript
{
  drivers: MarkerData[]
  selectedDriver: number | null   // driver's user.id
}
```

Actions: `setDrivers`, `setSelectedDriver`, `clearSelectedDriver`

#### i18n Store (`i18n/index.ts`)

```typescript
{
  language: 'en' | 'ru' | 'kk'
  t: Translations                 // current language strings object
  setLanguage(language): Promise<void>
}
```

### React Query

Used for all server state. QueryClient config:
```typescript
new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 }
  }
})
```

---

## 8. API Layer

### Base URL

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
All requests: {baseUrl}/api/v1{endpoint}
```

### Fetch Functions

#### `fetchAPI(endpoint, options?)` — `lib/fetch.ts`
Public endpoints. Attaches Bearer token if available.

#### `fetchWithAuth(endpoint, options?)` — `lib/fetchWithAuth.ts`
Protected endpoints. Attaches Bearer token and automatically refreshes on 401 with a `isRefreshing` guard to prevent concurrent refresh calls.

### Endpoint Reference

#### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register customer or driver |
| POST | `/auth/login/` | Login — returns `access`, `refresh`, `user.roles` |
| POST | `/auth/refresh/` | Refresh access token — body: `{ refresh }` |
| POST | `/auth/logout/` | Logout |

#### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me/` | Current user profile |
| PATCH | `/users/me/` | Update profile (supports FormData) |
| GET | `/users/{id}/` | Get user by ID |
| PATCH | `/users/{userId}/roles/` | Assign roles to user (admin) |

#### Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers/me/dashboard/` | Dashboard: profile, active car, online status, active trip |
| GET | `/drivers/profile/me/` | Driver profile details |
| PATCH | `/drivers/profile/me/` | Update driver profile |
| GET | `/drivers/me/online-status/` | Online/offline status |
| POST | `/drivers/offline/` | Go offline |
| GET | `/drivers/cars/` | List driver's cars |
| POST | `/drivers/cars/` | Add car |
| POST | `/drivers/cars/{carId}/activate/` | Set active car |
| GET | `/drivers/me/earnings/` | Earnings (`?from=&to=` optional) |

#### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/trips/` | Create trip |
| GET | `/trips/active/` | Active trip for current user |
| GET | `/trips/{tripId}/` | Trip details |
| PATCH | `/trips/{tripId}/` | Update trip status |
| POST | `/trips/{tripId}/cancel/` | Cancel trip |
| GET | `/trips/history/?limit=10` | Trip history |
| POST | `/trips/{tripId}/review/` | Leave review `{ rating, comment? }` |
| POST | `/trips/{tripUuid}/estimate/` | Price estimate |
| POST | `/trips/{tripUuid}/share-token/` | Generate 24h share token |
| GET | `/trips/{tripUuid}/share-tokens/` | List share tokens |

#### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips/{tripUuid}/chat-room/` | Chat room info + WebSocket URL |
| GET | `/trips/{tripUuid}/messages/` | Message history |
| POST | `/trips/{tripUuid}/messages/send/` | Send message |

#### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/` | Process payment |
| POST | `/payments/trip/{tripId}/` | Charge for trip |

#### Reference Data (public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tariffs/` | All tariffs |
| GET | `/tariffs/estimates/` | Bulk price estimates |
| GET | `/car-brands/` | Car brands list |
| GET | `/car-types/` | Car types list |

### React Query Hooks Summary

| Hook | File | Endpoints Used |
|------|------|---------------|
| `useRegister` | `useAuth.ts` | `POST /auth/register/` |
| `useLogin` | `useAuth.ts` | `POST /auth/login/` |
| `useLogout` | `useAuth.ts` | `POST /auth/logout/` |
| `useRefreshToken` | `useAuth.ts` | `POST /auth/refresh/` |
| `useAuthCheck` | `useAuth.ts` | storage check (no HTTP) |
| `useCurrentUser` | `useUser.ts` | `GET /users/me/` |
| `useUpdateProfile` | `useUser.ts` | `PATCH /users/me/` |
| `useAssignRoles` | `useUser.ts` | `PATCH /users/{id}/roles/` |
| `useCreateTrip` | `useTrips.ts` | `POST /trips/` |
| `useActiveTrip` | `useTrips.ts` | `GET /trips/active/` |
| `useTripDetails` | `useTrips.ts` | `GET /trips/{id}/` |
| `useUpdateTripStatus` | `useTrips.ts` | `PATCH /trips/{id}/` |
| `useCancelTrip` | `useTrips.ts` | `POST /trips/{id}/cancel/` |
| `useTripHistory` | `useTrips.ts` | `GET /trips/history/` |
| `useCreateReview` | `useTrips.ts` | `POST /trips/{id}/review/` |
| `useDriverDashboard` | `useDriverDashboard.ts` | `GET /drivers/me/dashboard/` |
| `useDriverEarnings` | `useDriverDashboard.ts` | `GET /drivers/me/earnings/` |
| `useGoOffline` | `useDriverDashboard.ts` | `POST /drivers/offline/` |
| `useActivateCar` | `useDriverDashboard.ts` | `POST /drivers/cars/{id}/activate/` |
| `useDriverProfile` | `useDriverProfile.ts` | `GET /drivers/profile/me/` |
| `useTariffs` | `useTariffs.ts` | `GET /tariffs/` |
| `useEstimate` | `useEstimate.ts` | `POST /trips/{uuid}/estimate/` |
| `useBulkTariffEstimate` | `useBulkTariffEstimate.ts` | `GET /tariffs/estimates/` |
| `useChat` | `useChat.ts` | messages + WebSocket |
| `usePayment` | `usePayment.ts` | `POST /payments/` |
| `useTripSharing` | `useTripSharing.ts` | share token endpoints |
| `useCars` | `useCars.ts` | `GET /car-brands/`, `GET /car-types/` |

---

## 9. Data Types & Interfaces

Defined in `types/type.d.ts`:

```typescript
interface Driver {
  id: number                  // equals user.id
  first_name: string
  last_name: string
  profile_image_url: string
  car_image_url: string
  rating: number
}

interface MarkerData {
  latitude: number
  longitude: number
  id: number                  // driver's user.id
  title: string
  profile_image_url: string
  car_image_url: string
  rating: number
  first_name: string
  last_name: string
  time?: number
  price?: string
  distance_km?: number
  lat?: number               // legacy
  lng?: number               // legacy
}

interface Ride {
  origin_address: string
  destination_address: string
  origin_latitude: number
  origin_longitude: number
  destination_latitude: number
  destination_longitude: number
  ride_time: number
  fare_price: number
  payment_status: 'pending' | 'paid' | 'failed'
  driver_id: number | null
  user_id: number
  created_at: string
  driver: {
    first_name: string
    last_name: string
    car_seats: number
  } | null
}

interface Tariff {
  id: number
  code: string
  base_price: string
  price_per_km: string
  price_per_min: string
  min_price: string
  is_active: boolean
}

interface EstimateData {
  distance_km: number
  duration_min: number
  price: number
  route_geometry?: string
  is_estimate?: boolean
}
```

---

## 10. Feature Modules

### Customer (Rider) Flow

```
Welcome → Role Select → Sign Up / Sign In
    │
    ▼
Home (Where To?)
    │  set destination
    ▼
Find Ride (driver list + map)
    │  select driver
    ▼
Confirm Ride (fare, duration, distance)
    │  confirm
    ▼
Book Ride (live status: searching → assigned → in progress)
    │  trip active
    ├── Chat with driver  [chat/[tripId]]
    └── Share trip link   [trip-share]
    │  trip complete
    ▼
Review Driver (rating + comment)
```

### Driver Flow

```
Driver Register (license, experience, car details)
    │
    ▼
Driver Home
    ├── Toggle online/offline
    ├── Select active car
    └── View + accept nearby ride requests
    │  trip accepted
    ├── Chat with rider
    └── Update trip status (en route → arrived → started → completed)
    │
    ▼
Earnings & Trip History
```

### Public Trip Tracking

- Accessible via `/tracks/{token}` with no authentication
- Token generated by rider: `POST /trips/{uuid}/share-token/`
- Token expires after 24 hours
- Page auto-refreshes every 10 seconds
- Shows: status, driver info, route, estimated arrival

### Real-time Chat

- WebSocket connection per trip
- Initiated after trip is created and driver is assigned
- Chat room fetched via `GET /trips/{uuid}/chat-room/`
- Separate chat list screens for both rider (`/(root)/(tabs)/chat`) and driver (`/(driver)/(tabs)/chat`)

---

## 11. Admin Panel

> **Status: Planned — not yet implemented**

The admin panel will be a dedicated app section `/(admin)` following the same route group pattern as `/(driver)`. It requires both a valid auth token and the `admin` role.

### 11.1 Access Control

**Guard** — `app/(admin)/_layout.tsx`:
```typescript
Promise.all([getAuthToken(), getUserRoles()]).then(([token, roles]) => {
  setAllowed(!!token && roles.includes('admin'));
});
// Redirect non-admins → /(root)/(tabs)/home
```

**Role routing** — `lib/utils.ts` update:
```typescript
export function getHomeRouteForRoles(roles: string[]): string {
  if (roles.includes('admin'))  return '/(admin)/(tabs)/dashboard';
  if (roles.includes('driver')) return '/(driver)/(tabs)/home';
  return '/(root)/(tabs)/home';
}
```

**Root Stack** — `app/_layout.tsx` addition:
```tsx
<Stack.Screen name="(admin)" options={{ headerShown: false }} />
```

---

### 11.2 Admin Tabs (`app/(admin)/(tabs)/`)

| Tab | File | Purpose |
|-----|------|---------|
| Dashboard | `dashboard.tsx` | Platform overview stats |
| Users | `users.tsx` | All customers, search, role management |
| Drivers | `drivers.tsx` | Driver list, approvals, suspensions |
| Trips | `trips.tsx` | All trips with filters |
| Settings | `settings.tsx` | Tariff editor, app config |

---

### 11.3 Screens in Detail

#### Dashboard (`/(admin)/(tabs)/dashboard`)

Summary cards:
- Total registered users
- Total registered drivers
- Active drivers right now (online)
- Trips today (count)
- Revenue today (sum of fare_price for completed trips today)
- Recent activity feed — last 10 trips (rider name, driver name, fare, status)

#### Users (`/(admin)/(tabs)/users`)

- Paginated list of all users
- Search by name or phone number
- Each row: avatar, full name, phone, role badges (customer / driver / admin), join date
- Tap → `/(admin)/users/[id]` detail screen:
  - Full profile (name, phone, photo, join date, trip count)
  - Role assignment: add or remove roles via `PATCH /users/{id}/roles/`
  - Suspend / reactivate account

#### Drivers (`/(admin)/(tabs)/drivers`)

- All driver profiles with online/offline badge and star rating
- Filter: pending approval / active / suspended
- Tap → `/(admin)/drivers/[id]` detail screen:
  - Driver profile (name, photo, license, experience)
  - Car details (brand, type, plate number, car photo)
  - Approve or suspend driver
  - Earnings overview
  - Trip history count and rating

#### Trips (`/(admin)/(tabs)/trips`)

- All trips in reverse chronological order
- Filter by status: `active` / `completed` / `cancelled`
- Filter by date range
- Each row: trip ID, rider, driver, fare, status badge, date
- Tap → `/(admin)/trips/[id]` detail screen:
  - Full trip data (origin, destination, route map, distance, duration)
  - Rider and driver info (linked to their detail screens)
  - Price breakdown (base, per km, per min)
  - Timestamps (created, started, completed/cancelled)
  - Force-cancel button for active trips

#### Settings (`/(admin)/(tabs)/settings`)

**Tariff Management:**
- List all tariffs from `GET /tariffs/`
- Edit inline: base_price, price_per_km, price_per_min, min_price
- Toggle tariff active/inactive
- Save via `PATCH /tariffs/{id}/`

**Admin Profile:**
- View and edit own admin profile
- Logout button (same flow as other roles)

---

### 11.4 New Hooks (`hooks/useAdmin.ts`)

```typescript
// Stats
useAdminDashboard()
  // GET /admin/dashboard/
  // Returns: { total_users, total_drivers, online_drivers, trips_today, revenue_today, recent_trips[] }

// Users
useAllUsers({ page, search })
  // GET /admin/users/?page={page}&search={search}

useAdminUserDetail(userId)
  // GET /admin/users/{userId}/  or  GET /users/{userId}/

useSuspendUser()
  // PATCH /admin/users/{userId}/suspend/
  // Body: { is_active: boolean }

// Drivers
useAllDrivers({ status })
  // GET /admin/drivers/?status={status}
  // status: 'pending' | 'active' | 'suspended'

useApproveDriver()
  // PATCH /admin/drivers/{driverId}/approve/

useSuspendDriver()
  // PATCH /admin/drivers/{driverId}/suspend/

// Trips
useAllTrips({ status, from, to, page })
  // GET /admin/trips/?status={}&from={}&to={}&page={}

useAdminTripDetail(tripId)
  // GET /admin/trips/{tripId}/

useAdminCancelTrip()
  // POST /admin/trips/{tripId}/cancel/

// Tariffs
useUpdateTariff()
  // PATCH /tariffs/{id}/
  // Body: { base_price?, price_per_km?, price_per_min?, min_price?, is_active? }
```

---

### 11.5 Backend Endpoints Needed

The following endpoints must exist or be created in the Django backend. Endpoints already confirmed are marked ✅.

| Endpoint | Method | Status | Used By |
|----------|--------|--------|---------|
| `/users/{id}/roles/` | PATCH | ✅ exists | `useAssignRoles` |
| `/tariffs/` | GET | ✅ exists | `useTariffs` |
| `/tariffs/{id}/` | PATCH | needs confirmation | `useUpdateTariff` |
| `/admin/dashboard/` | GET | to be created | `useAdminDashboard` |
| `/admin/users/` | GET | to be created | `useAllUsers` |
| `/admin/users/{id}/suspend/` | PATCH | to be created | `useSuspendUser` |
| `/admin/drivers/` | GET | to be created | `useAllDrivers` |
| `/admin/drivers/{id}/approve/` | PATCH | to be created | `useApproveDriver` |
| `/admin/drivers/{id}/suspend/` | PATCH | to be created | `useSuspendDriver` |
| `/admin/trips/` | GET | to be created | `useAllTrips` |
| `/admin/trips/{id}/cancel/` | POST | to be created | `useAdminCancelTrip` |

---

### 11.6 Implementation Order

```
Phase 1 — Routing & Guards
  1. lib/utils.ts          → add admin branch to getHomeRouteForRoles()
  2. app/_layout.tsx       → register (admin) Stack.Screen
  3. app/(admin)/_layout.tsx           → auth + admin role guard
  4. app/(admin)/(tabs)/_layout.tsx    → tab bar (5 tabs)

Phase 2 — Hooks
  5. hooks/useAdmin.ts     → all admin queries and mutations

Phase 3 — Screens (order by priority)
  6. app/(admin)/(tabs)/dashboard.tsx
  7. app/(admin)/(tabs)/users.tsx
  8. app/(admin)/users/[id].tsx
  9. app/(admin)/(tabs)/drivers.tsx
  10. app/(admin)/drivers/[id].tsx
  11. app/(admin)/(tabs)/trips.tsx
  12. app/(admin)/trips/[id].tsx
  13. app/(admin)/(tabs)/settings.tsx

Phase 4 — Polish
  14. i18n keys for admin strings (en.json, ru.json, kk.json)
  15. Web-responsive layout for admin screens
```

---

## 12. Internationalization

### Supported Languages

| Code | Language | Display Name | Default |
|------|----------|-------------|---------|
| `ru` | Russian | Русский | Yes |
| `en` | English | English | |
| `kk` | Kazakh | Қазақша | |

### Usage

```typescript
// Read translations in a component:
const { t } = useI18n();  // from I18nProvider context
// or:
const { t, language, setLanguage } = useI18nStore();  // from Zustand store

// Change language (persists to storage):
setLanguage('kk');
```

### Translation File Structure (`i18n/en.json`)

```json
{
  "common": { ... },
  "auth": { ... },
  "onboarding": { ... },
  "home": { ... },
  "findRide": { ... },
  "confirmRide": { ... },
  "bookRide": { ... },
  "profile": { ... },
  "currency": { ... },
  "admin": { ... }    // to be added
}
```

### Adding Admin Translations

Add to each of `en.json`, `ru.json`, `kk.json`:

```json
"admin": {
  "dashboard": "Dashboard",
  "users": "Users",
  "drivers": "Drivers",
  "trips": "Trips",
  "settings": "Settings",
  "totalUsers": "Total Users",
  "totalDrivers": "Total Drivers",
  "onlineDrivers": "Online Drivers",
  "tripsToday": "Trips Today",
  "revenueToday": "Revenue Today",
  "approve": "Approve",
  "suspend": "Suspend",
  "reactivate": "Reactivate",
  "assignRole": "Assign Role",
  "forceCancel": "Force Cancel",
  "pendingApproval": "Pending Approval",
  "editTariff": "Edit Tariff"
}
```

---

## 13. Platform-Specific Code

Files with `.web.tsx` / `.web.ts` suffixes override their native counterparts on web:

| Native File | Web Override | Difference |
|-------------|-------------|------------|
| `components/Map.tsx` | `Map.web.tsx` | React Leaflet vs React Native Maps |
| `app/(auth)/welcome.tsx` | `welcome.web.tsx` | Web-optimized layout |
| `app/(auth)/sign-in.tsx` | `sign-in.web.tsx` | Web-specific input styling |
| `app/(auth)/sign-up.tsx` | `sign-up.web.tsx` | Web-specific input styling |
| `app/(auth)/role-select.tsx` | `role-select.web.tsx` | Web layout |
| `app/(auth)/driver-register.tsx` | `driver-register.web.tsx` | Web layout |
| `app/(root)/(tabs)/home.tsx` | `home.web.tsx` | Web map integration |
| `app/(driver)/(tabs)/home.tsx` | `home.web.tsx` | Web map integration |
| `lib/storage.ts` | `storage.web.ts` | `localStorage` vs `SecureStore` |
| `lib/map.ts` | `map.web.ts` | Leaflet utils vs native map utils |

---

## 14. Styling System

**NativeWind** (Tailwind CSS for React Native) is used throughout.

### Typography

Font family: **Plus Jakarta Sans** — loaded via `expo-font`.

| Font Name (loaded as) | Weight |
|----------------------|--------|
| `Jakarta-ExtraLight` | 200 |
| `Jakarta-Light` | 300 |
| `Jakarta` | 400 |
| `Jakarta-Medium` | 500 |
| `Jakarta-SemiBold` | 600 |
| `Jakarta-Bold` | 700 |
| `Jakarta-ExtraBold` | 800 |

### Theme Tokens (`constants/theme.ts`)

Core colors used across the app:
- `#333333` — tab bar background
- `white` — active/inactive tab tint
- `#general-300`, `#general-400` — tab icon focus backgrounds

---

## 15. Environment Configuration

Required environment variables in `.env` (not committed to git):

```bash
# Backend API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# Google Maps (for distance/route calculations)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here

# 2GIS (optional, Kazakhstan mapping)
EXPO_PUBLIC_2GIS_API_KEY=your_key_here
```

> **Note:** `.env`, `.env.local`, and `.env.*` are excluded from git via `.gitignore`.

---

*End of Technical Documentation*
