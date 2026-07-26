# 🪐 GEMINI.md — Gemini AI Instructions & Model Integration Guide
> **Journey In Vladivostok (JIV) — Digital Captain & AI Navigation Engine**

This document provides system guidelines and model integration patterns for Google Gemini models operating within the JIV maritime ecosystem.

---

## 🌟 System Overview & Role

In this application, Gemini acts as the **"Digital Captain" (Цифровой Капитан)** — an expert AI maritime navigator for Vladivostok and Peter the Great Gulf.

### Core Capabilities
- **Itinerary Generation**: Suggesting sea routes around Vladivostok (Russky Island, Popova Island, Askold Island, Gamov Peninsula).
- **Marine Safety Assessment**: Analyzing weather conditions, wind speed, wave heights, and recommending sheltered bays.
- **Fuel & Logistics Calculation**: Estimating fuel consumption based on vessel horsepower, speed, and distance in nautical miles.
- **Multilingual Support**: Russian (`ru`), English (`en`), and Chinese (`zh`).

---

## 🔑 SDK Usage & Model Aliases

The backend uses the official `@google/genai` TypeScript SDK:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

### Preferred Models
- `gemini-2.5-flash`: Primary fast inference model for Digital Captain chat & route recommendations.
- `gemini-2.5-pro`: Advanced reasoning model for complex marine navigation analysis and multi-day itinerary design.

---

## 📂 Key AI Code Locations
- `/src/components/DigitalCaptainHub.tsx`: Frontend modal UI for AI Digital Captain interactions.
- `/server.ts`: Backend Express server handling secure proxy requests if server-side AI execution is used.

---

## 🛡️ Security & Privacy Guidelines
- **API Key Handling**: `GEMINI_API_KEY` is kept strictly server-side in environment variables or proxied via API routes.
- **Safety Settings**: Standard safety settings applied to prevent generation of unsafe marine advice or prohibited navigation directives.
