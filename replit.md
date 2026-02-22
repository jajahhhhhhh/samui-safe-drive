# Samui Safe Drive

## Overview

Samui Safe Drive is a ride-hailing mobile application built for Koh Samui, Thailand. It allows passengers to book rides across different zones on the island, track trip status through multiple stages (searching → driver assigned → arriving → pickup → in progress → completed), confirm pickups via OTP codes, and rate drivers after trips. The app also supports driver registration with policy acceptance, language preferences, and vehicle details.

The project uses a hybrid architecture: an Expo/React Native frontend for cross-platform mobile and web support, paired with an Express.js backend server. Data persistence uses both client-side AsyncStorage (for local trip/profile data) and a PostgreSQL database via Drizzle ORM on the server side.

## Recent Changes

- **Uber Redesign (Feb 2026)**: Complete visual overhaul to match Uber's design system
  - Color system: Pure black (#000000) background, white (#FFFFFF) text, green (#05944F) for primary CTAs, blue (#276EF1) for informational accents
  - Removed LinearGradient from booking screen hero
  - Updated StatusBadge to use dark-themed badge colors
  - All screens updated: Book, Activity, Profile, Driver Registration, Driver Policy
  - Tab bar uses white active tint, dark gray inactive

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture
- **Routing**: expo-router with file-based routing and typed routes. The app uses a tab-based layout with three tabs: Book (index), Activity, and Profile. Modal screens exist for driver registration and driver policy viewing.
- **State Management**: React Context (`TripProvider` in `lib/trip-context.tsx`) manages trip lifecycle state. TanStack React Query is set up for server data fetching via `lib/query-client.ts`.
- **Local Storage**: AsyncStorage stores trips, user profiles, active trips, and driver registrations on-device (`lib/storage.ts`). This serves as the primary data store for the current implementation.
- **Styling**: Dark theme by default with a custom color system defined in `constants/colors.ts`. Uses Inter font family loaded via `@expo-google-fonts/inter`.
- **Key Libraries**: expo-haptics for tactile feedback, expo-linear-gradient for UI gradients, expo-location for GPS, expo-image-picker, react-native-reanimated for animations, react-native-gesture-handler, react-native-keyboard-controller.

### Tab Structure
- **Book tab** (`app/(tabs)/index.tsx`): Main booking flow — zone selection, pickup/dropoff entry, fare estimation, active trip tracking with OTP confirmation
- **Activity tab** (`app/(tabs)/activity.tsx`): Trip history list with detail view and rating functionality
- **Profile tab** (`app/(tabs)/profile.tsx`): User profile editing, language preferences, link to driver registration

### Modal Screens
- **Driver Registration** (`app/driver-register.tsx`): Multi-field form for drivers to register with license, vehicle, language, and zone info
- **Driver Policy** (`app/driver-policy.tsx`): Read-only policy document that drivers must accept

### Backend (Express.js)

- **Server**: Express 5 running in `server/index.ts` with CORS configured for Replit domains and localhost
- **Routes**: Defined in `server/routes.ts` — currently minimal with a placeholder for `/api` prefixed routes
- **Storage Layer**: `server/storage.ts` provides an `IStorage` interface with an in-memory implementation (`MemStorage`). This is designed to be swapped for a database-backed implementation.
- **Static Serving**: In production, the server serves the Expo web build. In development, it proxies to the Expo dev server.

### Database (Drizzle ORM + PostgreSQL)

- **Schema**: Defined in `shared/schema.ts` — currently contains a `users` table with id, username, and password fields
- **Config**: `drizzle.config.ts` points to PostgreSQL via `DATABASE_URL` environment variable
- **Migrations**: Output to `./migrations` directory
- **Schema Push**: Use `npm run db:push` to sync schema to database
- **Validation**: Uses `drizzle-zod` to generate Zod schemas from Drizzle table definitions

### Trip Flow & Types

The core domain types are in `lib/types.ts`:
- **Zones**: 8 areas of Koh Samui (Chaweng, Lamai, Bophut, Mae Nam, Nathon, Lipa Noi, Taling Ngam, Choeng Mon)
- **Trip Statuses**: searching → driver_assigned → driver_arriving → arrived → pickup_confirmed → in_progress → completed (or cancelled)
- **Pricing**: Zone-based fare calculation via `PRICING_RULES`
- **Mock Drivers**: `MOCK_DRIVERS` array provides sample driver data for the prototype
- **OTP**: Generated for pickup verification

### Build & Development Scripts

- `npm run expo:dev` — Start Expo dev server (configured for Replit)
- `npm run server:dev` — Start Express backend with tsx
- `npm run db:push` — Push Drizzle schema to PostgreSQL
- `npm run expo:static:build` — Build static web bundle via custom `scripts/build.js`
- `npm run server:build` — Bundle server with esbuild
- `npm run server:prod` — Run production server

### Path Aliases
- `@/*` maps to project root
- `@shared/*` maps to `./shared/*`

## External Dependencies

### Database
- **PostgreSQL** via `DATABASE_URL` environment variable
- **Drizzle ORM** for schema definition and queries
- **drizzle-kit** for migrations and schema push

### Key npm Packages
- **expo** (SDK 54) — Core mobile framework
- **express** (v5) — Backend HTTP server
- **@tanstack/react-query** — Server state management
- **pg** — PostgreSQL client
- **zod** + **drizzle-zod** — Schema validation
- **@react-native-async-storage/async-storage** — Local key-value storage
- **http-proxy-middleware** — Dev server proxy for Expo
- **patch-package** — Applies patches on postinstall

### Expo Modules Used
- expo-router, expo-font, expo-web-browser, expo-haptics, expo-image, expo-image-picker, expo-linear-gradient, expo-location, expo-crypto, expo-blur, expo-glass-effect, expo-constants, expo-splash-screen, expo-status-bar, expo-symbols, expo-system-ui, expo-linking

### Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `REPLIT_DEV_DOMAIN` — Used for Expo packager proxy and API URL construction
- `EXPO_PUBLIC_DOMAIN` — Public domain for API calls from the client
- `REPLIT_DOMAINS` — Comma-separated list of allowed CORS origins
- `REPLIT_INTERNAL_APP_DOMAIN` — Used in production build for deployment domain