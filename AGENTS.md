# 🤖 AGENTS.md — AI Agent & LLM Architecture Blueprint
> **Journey In Vladivostok (JIV) — Ecosystem Fleet Charter & Digital Captain Platform**

This document serves as the primary system context and structural guide for AI Coding Assistants (Cursor, Claude Code, Antigravity Agent, Gemini, ChatGPT, GitHub Copilot, Windsurf, Aider).

---

## 🧭 Project Purpose & Core Architecture

**JIV (Journey In Vladivostok)** is a full-stack maritime charter marketplace and AI navigation engine operating in the Vladivostok waters (Peter the Great Gulf, Russky Island, Eastern Bosphorus, Sea of Japan).

### Key Architectural Pillars
1. **Global Bridge Data Adapters (`/src/lib/providers/`)**:
   - Modular Data Provider pattern (`IVesselDataProvider`).
   - Seamlessly aggregates internal listings (`LocalDBProvider`) with external partner feeds (`FarPostAdapter`, `YandexTravelAdapter`, `AirbnbLuxAdapter`).
   - Aggregated via `AggregateVesselProvider` (`globalVesselAggregator`).
   - Standardized output: Returns clean normalized `Vessel[]` arrays (no placeholder objects).

2. **Full-Stack Express + Vite Integration (`/server.ts`)**:
   - Custom Express server powering REST endpoints (`/api/vessels`, `/api/vessels/:id`, `/api/tours`, `/api/rates`, `/api/regions`).
   - OpenAPI 3.0 specification (`/api/openapi.json`) & Interactive Swagger UI (`/api/docs`).
   - Single-port container setup on port `3000` (host `0.0.0.0`).

3. **Multi-Region & Multi-Currency Engine (`/src/lib/regionConfig.ts` & `/src/lib/currency.ts`)**:
   - Supports 3 Regional Realization Markets:
     1. `ru-vladivostok`: Russian Federation (Yandex Maps, NSPK / Mir / SBP payments, RUB).
     2. `asia-hub`: Asian Marina Hub (China / WeChat Pay, Alipay, UnionPay, CNY).
     3. `global-marina`: Global Marina (USA & Europe / Stripe, Apple Pay, PayPal, USD).
   - Real-time conversion helper functions: `convertFromRUB`, `convertCurrency`, `formatCurrencyPrice`.

4. **Digital Captain & Marine Map (`/src/components/DigitalCaptainHub.tsx` & `/src/components/InteractiveSeaMap.tsx`)**:
   - AI Assistant using Google Gemini API (`@google/genai`) for itinerary planning, weather/wave safety checks, and fuel calculations.
   - Interactive SVG/Canvas nautical chart with bathymetry lines, fairways, GPS vessel tracking, and interactive route designer.

---

## 📂 Codebase File Map

```
/
├── server.ts                    # Express + Vite backend server & OpenAPI Swagger docs (/api/docs)
├── metadata.json                # Platform capability declarations & permissions
├── package.json                 # Dependencies, scripts (dev: tsx server.ts, build: esbuild)
├── .env.example                 # Environment variable templates
├── AGENTS.md                    # Primary AI Context & Architecture Blueprint (this file)
├── GEMINI.md                    # Gemini Model Guidelines
├── llms.txt                     # Standard LLM indexing specification (llmstxt.org)
├── llms-full.txt                # Full LLM context dump
├── .cursorrules                 # Cursor IDE / Copilot rule definitions
├── README.md                    # Public documentation with Mermaid diagrams & API guide
│
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main single-page application orchestrator
│   ├── types.ts                 # Shared TypeScript interfaces (Vessel, SharedTour, etc.)
│   ├── index.css                # Tailwind CSS v4 setup (@import "tailwindcss";)
│   │
│   ├── data/
│   │   └── vessels.ts           # Initial vessel raw data, tours, and nautical map points
│   │
│   └── lib/
│       ├── currency.ts          # Multi-Currency engine (RUB, USD, CNY rates & formatting)
│       ├── regionConfig.ts      # 3 Regional Market profiles (RU, Asia, Global)
│       ├── translations.tsx     # Multi-language dictionary (RU, EN, ZH)
│       ├── vesselLocalization.ts# Localized vessel metadata helpers
│       │
│       └── providers/           # Global Bridge Data Adapters Layer
│           ├── types.ts         # IVesselDataProvider interface & VesselFilterOptions
│           ├── LocalDBProvider.ts       # Internal JIV direct fleet registry
│           ├── FarPostAdapter.ts        # FarPost.ru marine transport feed adapter
│           ├── YandexTravelAdapter.ts   # Yandex Travel & Yandex Go sea taxi adapter
│           ├── AirbnbLuxAdapter.ts      # Airbnb Luxe Marine global charters adapter
│           └── AggregateVesselProvider.ts # Parallel provider aggregator singleton
│
    └── components/              # Modular UI React Components
        ├── ArchitecturePanel.tsx         # Data Provider & API Architecture visualizer
        ├── BookingDrawer.tsx             # Interactive booking checkout drawer
        ├── CaptainsBridge.tsx            # Vessel owner dashboard & fleet publisher
        ├── DigitalCaptainHub.tsx         # Gemini AI Captain assistant modal
        ├── InteractiveSeaMap.tsx         # Nautical chart with depth contours & GPS tracks
        ├── PartnerBridge.tsx             # Sponsor & advertising campaign bridge
        ├── VesselCard.tsx                # Vessel listing card with deep-link partner badges
        ├── WeatherWidget.tsx             # Live weather, wind & wave forecast widget
        └── ...
```

---

## 🧬 Data Schemas & Types Summary

### Vessel (`/src/types.ts`)
```typescript
export type VesselCategory = 'yacht' | 'boat' | 'jetski' | 'taxi' | 'catamaran';
export type VesselSourceType = 'internal' | 'farpost' | 'yandex' | 'airbnb';
export type SupportedCurrency = 'RUB' | 'USD' | 'CNY';

export interface Vessel {
  id: string;
  source_type: VesselSourceType; // 'internal' | 'farpost' | 'yandex' | 'airbnb'
  source_name: string;        // Human readable source label
  original_url: string;       // Deep link URL to original listing
  vessel_type: VesselCategory;
  geo_coordinates: { lat: number; lng: number }; // Standardized coordinates
  
  name: string;
  category: VesselCategory;
  description: string;
  capacity: number;
  speed: number;
  homeport: string;
  coordinates: { x: number; y: number }; // Visual SVG map coordinates
  latLon: [number, number];
  priceHour?: number;
  priceDay?: number;
  currency?: SupportedCurrency;
  rating: number;
  reviewsCount: number;
  captainName: string;
  captainPhone: string;
  images: string[];
  features: string[];
  hasSharkRepeller?: boolean;
  hasEchoSounder?: boolean;
  allowedActivities?: string[];
  isLive?: boolean;
  responseTime?: number;
  partnerVerificationId?: string;
}
```

---

## ⚡ API Endpoints (`/server.ts`)

| HTTP Method | Path | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status | - |
| `GET` | `/api/vessels` | Aggregate vessels across Data Providers | `category`, `source`, `capacity`, `maxPrice`, `search` |
| `GET` | `/api/vessels/:id` | Get single vessel by ID | - |
| `GET` | `/api/tours` | Shared tours & excursions list | - |
| `GET` | `/api/rates` | Currency exchange rates (RUB, USD, CNY) | - |
| `GET` | `/api/regions` | Regional market profiles (RU, Asia, Global) | - |
| `GET` | `/api/openapi.json` | OpenAPI 3.0 specification in JSON | - |
| `GET` | `/api/docs` | Interactive Swagger UI API documentation | - |

---

## 🛠 Instructions for AI Agents & Models

When interacting with or extending this codebase:
1. **Respect Data Adapter Abstraction**: Do NOT hardcode vessels directly inside components. Use `globalVesselAggregator` from `src/lib/providers/AggregateVesselProvider` or create new classes implementing `IVesselDataProvider`.
2. **Multi-Currency Support**: Always format prices using `formatCurrencyPrice` and `convertFromRUB` from `src/lib/currency.ts`.
3. **No Placeholders or Fake Stubs**: If an API or query returns no data, return a clean empty array `[]` or 404 response.
4. **Tailwind CSS v4 & Lucide Icons**: All icons MUST be imported from `lucide-react`. Styling MUST use Tailwind utility classes.
5. **Express Server Building**: `server.ts` is compiled into `dist/server.cjs` via `esbuild`. Always test build with `npm run build` and lint with `npm run lint`.
