# 🏍️ Samui Safe Drive

> **Ride-hailing & island services app for Koh Samui, Thailand**

Samui Safe Drive is a full-stack mobile application that connects passengers with drivers across the 8 zones of Koh Samui. It supports the complete ride lifecycle — from zone-based booking and real-time trip tracking to OTP pickup confirmation and post-trip ratings — with dedicated driver registration and policy management flows.

---

## ✨ Features

### 🚗 Passenger
- **Zone-based booking** — Select pickup and drop-off across 8 island zones (Chaweng, Lamai, Bophut, Mae Nam, Nathon, Lipa Noi, Taling Ngam, Choeng Mon)
- **Fare estimation** — Instant price calculation based on zone-to-zone pricing rules
- **Real-time trip status** — Track your ride through every stage: Searching → Driver Assigned → Arriving → Pickup → In Progress → Completed
- **OTP confirmation** — Secure pickup verification via one-time passcode
- **Post-trip ratings** — Rate your driver after each completed journey
- **Trip history** — Browse past rides in the Activity tab with detailed view

### 🏍️ Driver
- **Driver registration** — Multi-field onboarding with license, vehicle details, language preferences, and zone selection
- **Policy acceptance** — Read-only policy document that drivers must review and accept
- **Language preferences** — Multi-language support configuration during registration

### 🎨 General
- **Dark theme UI** — Uber-inspired design system with pure black background (#000), white text (#FFF), green CTAs (#05944F), and blue informational accents (#276EF1)
- **Haptic feedback** — Tactile responses for key interactions
- **Cross-platform** — Runs on iOS, Android, and web via Expo

---

## 🏗️ Architecture

Samui Safe Drive uses a **hybrid architecture**:

```
┌─────────────────────────────────────┐
│         Expo / React Native         │
│   (iOS · Android · Web via Expo)    │
│                                     │
│  ┌──────────┐ ┌─────────┐ ┌───────┐│
│  │   Book   │ │Activity │ │Profile││
│  └──────────┘ └─────────┘ └───────┘│
│  expo-router · TanStack Query       │
│  React Context · AsyncStorage       │
└──────────────┬──────────────────────┘
               │ HTTP / REST
┌──────────────▼──────────────────────┐
│         Express.js Backend          │
│            (server/)                │
│  Routes · IStorage Interface        │
└──────────────┬──────────────────────┘
               │ Drizzle ORM
┌──────────────▼──────────────────────┐
│           PostgreSQL DB             │
│       (shared/schema.ts)            │
└─────────────────────────────────────┘
```

### Frontend (Expo / React Native)

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 · React Native 0.81 (new arch) |
| Routing | expo-router (file-based, typed routes) |
| State | React Context (TripProvider) · TanStack React Query |
| Local storage | AsyncStorage (trips, profiles, active trips) |
| Styling | Custom dark theme · Inter font · `constants/colors.ts` |
| Animations | react-native-reanimated · react-native-gesture-handler |
| Location | expo-location |
| Media | expo-image-picker · expo-image |

### Backend (Express.js)

| Layer | Technology |
|---|---|
| Server | Express 5 (`server/index.ts`) |
| Routes | `server/routes.ts` (`/api` prefix) |
| Storage | `IStorage` interface · `MemStorage` (in-memory, swappable for DB) |
| Static | Serves Expo web build in production; proxies to Expo dev server in development |

### Database

| Layer | Technology |
|---|---|
| ORM | Drizzle ORM |
| Database | PostgreSQL (via `DATABASE_URL`) |
| Schema | `shared/schema.ts` |
| Validation | drizzle-zod · Zod |
| Migrations | drizzle-kit (`npm run db:push`) |

---

## 📁 Project Structure

```
samui-safe-drive/
├── app/                         # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            # Book tab — booking & active trip tracking
│   │   ├── activity.tsx         # Activity tab — trip history & ratings
│   │   └── profile.tsx          # Profile tab — user settings & driver link
│   ├── driver-register.tsx      # Driver registration modal
│   ├── driver-policy.tsx        # Driver policy document modal
│   ├── _layout.tsx              # Root layout
│   └── +not-found.tsx           # 404 screen
├── assets/images/               # Static image assets
├── components/                  # Shared UI components
├── constants/
│   └── colors.ts                # Global color system (dark theme)
├── lib/
│   ├── trip-context.tsx          # TripProvider — global trip state
│   ├── types.ts                 # Domain types (zones, statuses, pricing)
│   ├── storage.ts               # AsyncStorage helpers
│   └── query-client.ts          # TanStack React Query client
├── server/
│   ├── index.ts                 # Express entry point
│   ├── routes.ts                # API route definitions
│   └── storage.ts               # IStorage interface & MemStorage
├── shared/
│   └── schema.ts                # Drizzle DB schema (users table)
├── scripts/
│   └── build.js                 # Static web bundle builder
├── drizzle.config.ts            # Drizzle ORM config
├── app.json                     # Expo app config
├── tsconfig.json                # TypeScript config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL database (for server-side features)
- [Expo Go](https://expo.dev/client) app (for mobile development)

### Installation

```bash
git clone https://github.com/jajahhhhhhh/samui-safe-drive.git
cd samui-safe-drive
npm install
```

### Environment Variables

Create a `.env` file (or configure in your hosting environment):

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REPLIT_DEV_DOMAIN=your-replit-domain.repl.co
EXPO_PUBLIC_DOMAIN=your-replit-domain.repl.co:5000
REPLIT_DOMAINS=your-replit-domain.repl.co
REPLIT_INTERNAL_APP_DOMAIN=your-internal-domain
```

### Running the App

```bash
# Start Expo client (mobile & web)
npm run start

# Start the backend server (development mode)
npm run server:dev

# Sync the database schema
npm run db:push
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run start` | Start Expo development server |
| `npm run expo:dev` | Start Expo with Replit proxy configuration |
| `npm run server:dev` | Start Express backend in development (tsx) |
| `npm run server:build` | Bundle server with esbuild |
| `npm run server:prod` | Run production Express server |
| `npm run expo:static:build` | Build static web bundle |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |
| `npm run lint` | Run Expo linter |
| `npm run lint:fix` | Run linter with auto-fix |

---

## 🗺️ Trip Flow

```
searching → driver_assigned → driver_arriving → arrived → pickup_confirmed → in_progress → completed
                                                                                           ↕
                                                                                       cancelled
```

### Island Zones

The app covers **8 zones** on Koh Samui:

| Zone | Zone |
|---|---|
| Chaweng | Mae Nam |
| Lamai | Nathon |
| Bophut | Lipa Noi |
| Choeng Mon | Taling Ngam |

Pricing is calculated via **zone-to-zone rules** defined in `lib/types.ts`. Mock drivers are provided for prototype testing via the `MOCK_DRIVERS` array.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Mobile Framework** | Expo SDK 54 · React Native 0.81 |
| **Language** | TypeScript 5.9 |
| **Routing** | expo-router (file-based) |
| **State Management** | React Context · TanStack React Query v5 |
| **Animations** | react-native-reanimated v4 |
| **Backend** | Node.js · Express 5 |
| **Database** | PostgreSQL · Drizzle ORM |
| **Validation** | Zod · drizzle-zod |
| **Build Tools** | Babel · esbuild · drizzle-kit |
| **Linting** | ESLint · eslint-config-expo |

---

## 📄 License

This project is private. All rights reserved.

---

<p align="center">Built with ❤️ for Koh Samui, Thailand 🇹🇭</p>
