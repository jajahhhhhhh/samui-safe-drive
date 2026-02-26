"ios": {
  "bundleIdentifier": "com.yourdomain.sauisafedrive"
},
"android": {
  "package": "com.yourdomain.sauisafedrive"
}# Install Expo CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Submit to App Store (or upload manually via Transporter)
eas submit --platform ios
# Samui Safe Drive - AI Coding Agent Guide

## Project Overview

**Samui Safe Drive** is a React Native ride-hailing app for Koh Samui, Thailand. It's built with Expo, TypeScript, and features a Node.js Express backend with PostgreSQL. The app manages trips between geographical zones (Chaweng, Lamai, etc.), driver assignments, and pricing.

## Tech Stack

- **Frontend**: Expo 54, React 19, React Native 0.81 (Replit-hosted)
- **Navigation**: Expo Router (file-based, supports typed routes)
- **State Management**: React Context (`TripProvider`) + React Query (data caching)
- **Data Persistence**: AsyncStorage (client-side), PostgreSQL (server-side)
- **ORM**: Drizzle ORM with Zod validation
- **Styling**: TypeScript with color constants; uses Expo design system (`Ionicons`, `expo-symbols`)
- **Build Tool**: Babel with React Compiler enabled, esbuild for server

## Architecture Patterns

### Domain: Trips & Driver Zones

The core domain revolves around **trips** flowing through states: `searching` → `driver_assigned` → `driver_arriving` → `arrived` → `pickup_confirmed` → `in_progress` → `completed` (or `cancelled`).

**Zones** are hardcoded geographic areas: `chaweng`, `lamai`, `bophut`, `maenam`, `nathon`, `lipa_noi`, `taling_ngam`, `choeng_mon`. Each zone has pricing rules (`PRICING_RULES` in [lib/types.ts](../lib/types.ts)) with base fare, per-km rate, and minimum fare.

**Key types** live in [lib/types.ts](../lib/types.ts): `Trip`, `Driver`, `UserProfile`, `DriverRegistration`, `Zone`, `TripStatus`.

### State Management Layers

1. **Component Props/Local State**: Individual screen state (e.g., form inputs)
2. **Context (`TripProvider`)**: Global trip & active trip state in [lib/trip-context.tsx](../lib/trip-context.tsx)
   - Manages `trips[]`, `activeTrip`, loading state
   - Provides methods: `bookTrip()`, `confirmPickup()`, `cancelTrip()`, `rateTrip()`, `refreshTrips()`
   - Auto-simulates trip state progression with `simulateTripFlow()` (dev mode)
3. **AsyncStorage**: Persists trips, profiles, driver registrations to device
4. **React Query**: (Currently configured but routes not yet implemented; will fetch from `/api/*`)

### Data Flow

```
User Screen (e.g., BookTrip) 
  ↓ calls useTripContext→bookTrip() 
  ↓ updates TripProvider (Context)
  ↓ saves to AsyncStorage 
  ↓ (future) posts to /api/trips via React Query
  ↓ eventually calls simulateTripFlow() to demo state transitions
```

## Project Structure

- **app/** - Expo Router screens (file = route)
  - `(tabs)/` - Modern native tab layout with `index.tsx` (BookTrip), `activity.tsx`, `profile.tsx`
  - Root layout wraps app with providers: ErrorBoundary, QueryClientProvider, TripProvider, GestureHandlerRootView, KeyboardProvider
- **lib/** - Core logic
  - [types.ts](../lib/types.ts) - Domain types, pricing rules, mock drivers
  - [trip-context.tsx](../lib/trip-context.tsx) - Global trip state + methods
  - [storage.ts](../lib/storage.ts) - AsyncStorage wrappers (keys: `@samui_trips`, `@samui_active_trip`, etc.)
  - [query-client.ts](../lib/query-client.ts) - React Query config, `apiRequest()` helper for CORS env
- **components/** - Reusable React components (DriverCard, TripCard, StatusBadge, ErrorBoundary, etc.)
- **server/** - Express backend
  - [index.ts](../server/index.ts) - Setup CORS, fetch body parsing, static file serving
  - [routes.ts](../server/routes.ts) - To be filled with `/api/*` routes
  - [storage.ts](../server/storage.ts) - (Future) server-side persistence  
  - `templates/` - HTML templates for landing page
- **shared/** - [schema.ts](../shared/schema.ts) contains Drizzle schema (currently `users` table) and Zod Insert schema
- **constants/** - `colors.ts` with theme colors
- **scripts/** - `build.js` for static expo build

## Key Conventions

### Import Paths























Use TypeScript path aliases from [tsconfig.json](../tsconfig.json):
- `@/*` for workspace root imports (app, lib, components, etc.)
- `@shared/*` for shared schema imports

Examples: `import { Trip } from '@/lib/types'`, `import { users } from '@shared/schema'`

### Type Definitions

Always extract types to [lib/types.ts](../lib/types.ts), not in component files. Use explicit `export` for future API contracts.

### AsyncStorage Keys

Defined in [lib/storage.ts](../lib/storage.ts): `@samui_trips`, `@samui_profile`, `@samui_active_trip`, `@samui_driver_registration`. Keep them consistent across app.

### Environment Setup

Replit-specific env vars (`REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, `EXPO_PUBLIC_DOMAIN`) are injected into CORS headers and API URLs. Localhost origins always allowed for dev. For server: `NODE_ENV=development|production`.

### Error Handling

Use [ErrorBoundary.tsx](../components/ErrorBoundary.tsx) (class component) at app root to catch rendering errors. Always provide fallback UI via `ErrorFallback.tsx`.

## Development Workflows

**Start dev environment:**
```bash
npm run expo:dev           # Expo dev server on Replit domain
npm run server:dev         # Express server (PORT=3000, NODE_ENV=development)
```

**Database:**
```bash
npm run db:push            # Drizzle: push schema to PostgreSQL
```

**Build & lint:**
```bash
npm run server:build       # esbuild server to server_dist/
npm run expo:static:build  # Expo production static build
npm run lint / lint:fix    # ESLint via expo config
```

## Backend Route Blueprint

Implement routes in [server/routes.ts](../server/routes.ts). Examples:
- `POST /api/trips` - Book trip (validate zone, create trip, return Trip object)
- `GET /api/trips/:tripId` - Fetch trip
- `PUT /api/trips/:tripId/status` - Update trip status
- `POST /api/auth/register` - User registration (hash password via bcrypt)
- `POST /api/drivers/register` - Driver registration

Use Drizzle ORM with [shared/schema.ts](../shared/schema.ts). Response models should match types in [lib/types.ts](../lib/types.ts).

## Testing & Simulation

Mock data in [lib/types.ts](../lib/types.ts):
- `MOCK_DRIVERS` - Three test drivers with ratings
- `simulateTripFlow()` - Automatically transitions trip states in TripProvider with setTimeout delays

For development, use mock data; migration to real API will involve:
1. Removing `simulateTripFlow()` calls
2. Converting React Query queries to fetch real `/api/trips` endpoints
3. Replacing mock drivers with driver search logic

## Debugging Tips

- **Replit dev domain**: Via `EXPO_PUBLIC_DOMAIN` env; check proxy setup in [server/index.ts](../server/index.ts) CORS section
- **Trip state not updating?** Check TripProvider's `updateActiveTrip()` call; ensure AsyncStorage persistence isn't stale
- **DB schema mismatch?** Run `npm run db:push` after schema changes in [shared/schema.ts](../shared/schema.ts)
- **CORS errors?** Verify header origin against allowed list in [server/index.ts](../server/index.ts) `setupCors()` function

## Files to Know

### Critical
- [app/_layout.tsx](../app/_layout.tsx) - Root layout with all providers
- [lib/trip-context.tsx](../lib/trip-context.tsx) - Trip state & methods
- [lib/types.ts](../lib/types.ts) - All domain types + pricing
- [server/index.ts](../server/index.ts) - CORS, middleware setup
- [shared/schema.ts](../shared/schema.ts) - DB schema (Drizzle + Zod)

### Secondary  
- [app/(tabs)/_layout.tsx](../app/%28tabs%29/_layout.tsx) - Tab navigation structure
- [lib/storage.ts](../lib/storage.ts) - AsyncStorage helpers
- [server/routes.ts](../server/routes.ts) - API endpoint stubs
- [components/ErrorBoundary.tsx](../components/ErrorBoundary.tsx) - Error handling

---

When working on this project, prioritize understanding the trip state machine and zone-based pricing before adding features. Always validate zones & trip statuses against enums in types.ts.
