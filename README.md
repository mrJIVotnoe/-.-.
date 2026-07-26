# 🛥️ Journey In Vladivostok (JIV) — Аренда флота & Цифровой капитан

[![AI Friendly](https://img.shields.io/badge/AI--Ready-Cursor%20%7C%20Claude%20%7C%20ChatGPT%20%7C%20Gemini-38bdf8?style=for-the-badge&logo=openai)](AGENTS.md)
[![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI--3.0-Swagger%20UI%20Ready-emerald?style=for-the-badge&logo=swagger)](http://localhost:3000/api/docs)
[![LLMs.txt Standard](https://img.shields.io/badge/llms.txt-Indexed-amber?style=for-the-badge)](llms.txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**Journey In Vladivostok (JIV)** — Интерактивный экосистемный маркетплейс аренды яхт, катеров, катамаранов и гидроциклов в акватории Владивостока (Залив Петра Великого, Остров Русский, Босфор Восточный, Японское море) с адаптивным слоем **Global Bridge Data Adapters** и встроенным **AI Цифровым Капитаном**.

![JIV Fleet Banner](https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1200&q=80)

---

## 🤖 Для ИИ-ассистентов & Разработчиков (AI Compatibility)

Данный репозиторий полностью подготовлен для чтения, анализа и автоматической доработки сторонними нейросетями и ИИ-кодерами (**Cursor, Claude Code, Antigravity, ChatGPT, Windsurf, GitHub Copilot, Aider, Gemini**):

- **[AGENTS.md](./AGENTS.md)** — Главный документ архитектуры для ИИ-агентских систем.
- **[GEMINI.md](./GEMINI.md)** — Руководство по интеграции Google Gemini API.
- **[llms.txt](./llms.txt)** — Облегченный индекс для автоматической индексации нейросетями (по стандарту [llmstxt.org](https://llmstxt.org)).
- **[llms-full.txt](./llms-full.txt)** — Полный контекстный дамп схемы данных и адаптеров для загрузки в LLM.
- **[.cursorrules](./.cursorrules)** — Автоматические правила для IDE Cursor и Copilot.

---

## 📐 Архитектура проекта (Mermaid Diagram)

```mermaid
graph TD
    Client[React 19 Frontend App] --> Aggregator[AggregateVesselProvider]
    
    subgraph Data Adapters Layer (Global Bridge)
        Aggregator --> LocalDB[LocalDBProvider - JIV Реестр]
        Aggregator --> FarPost[FarPostAdapter - FarPost.ru Feed]
        Aggregator --> Yandex[YandexTravelAdapter - Яндекс Путешествия & Go]
        Aggregator --> Airbnb[AirbnbLuxAdapter - Airbnb Luxe Marine]
    end

    Client --> Express[Express.js Server (server.ts)]
    
    subgraph Backend & API Endpoints
        Express --> REST[/api/vessels, /api/tours, /api/rates, /api/regions]
        Express --> Swagger[/api/docs - Interactive Swagger UI]
        Express --> OpenAPI[/api/openapi.json - OpenAPI 3.0 Spec]
    end

    Client --> Gemini[Google Gemini API (@google/genai)]
    subgraph AI Engine
        Gemini --> Captain[Цифровой Капитан / AI Route Planner]
    end
```

---

## 🚀 Основной функционал платформы

1. **🌐 Слой Data Providers (Global Bridge):**
   - Абстрактный интерфейс `IVesselDataProvider` для параллельной агрегации судов.
   - Поддержка быстрого переключения между локальной базой (`LocalDBProvider`) и внешними API (`FarPostAdapter`, `YandexTravelAdapter`, `AirbnbLuxAdapter`).
   - Механизм **Deep Linking** — карточки судов содержат кликабельные плашки первоисточника и оригинальные ссылки на объявления партнеров.

2. **🌏 3 Рынка реализации & Мультивалютность:**
   - `ru-vladivostok`: Навигация по Яндекс.Картам, НСПК / МИР / СБП / Т-Пэй, валюта RUB.
   - `asia-hub`: Baidu Maritime Chart, WeChat Pay / Alipay / UnionPay, валюта CNY.
   - `global-marina`: OpenSeaMap, Stripe / Apple Pay / PayPal, валюта USD.
   - Конвертер валют в реальном времени (`convertCurrency`, `formatCurrencyPrice`).

3. **⚓ Интерактивная морская карта Владивостока:**
   - Отображение изобат глубин, судоходных фарватерных линий и опасных мелей.
   - GPS-трекинг судов в реальном времени.
   - Интерактивный конструктор маршрутов с возможностью визуализации собственного морского пути.

4. **🌊 Модуль «Цифровой Капитан» (Gemini AI):**
   - Умный ассистент на базе Google Gemini API (`@google/genai`) для генерации экскурсионных маршрутов, рекомендации безопасных бухт с учетом ветро-волновой обстановки и расчета расхода топлива.

5. **📖 Swagger & OpenAPI 3.0 Документация:**
   - Встроенный интерактивный Swagger UI доступен по адресу `http://localhost:3000/api/docs`.
   - JSON-спецификация доступна по адресу `http://localhost:3000/api/openapi.json`.

---

## 📂 Структура каталогов

```
/
├── server.ts                    # Express backend, Vite middleware & OpenAPI Swagger documentation
├── AGENTS.md                    # AI Agent Architecture instructions (Cursor, Claude, Copilot)
├── GEMINI.md                    # Gemini Model integration directives
├── llms.txt                     # Standard LLM indexing file
├── llms-full.txt                # Full context dump for LLMs
├── .cursorrules                 # Cursor IDE rules
├── metadata.json                # Project capabilities manifest
├── package.json                 # Node dependencies & esbuild compilation scripts
│
├── src/
│   ├── App.tsx                  # Main single-page application orchestrator
│   ├── types.ts                 # Standardized TypeScript interfaces (Vessel, SharedTour, etc.)
│   │
│   ├── lib/
│   │   ├── currency.ts          # Multi-Currency engine (RUB, USD, CNY rates & formatting)
│   │   ├── regionConfig.ts      # 3 Regional Market Profiles (RU, Asia, Global)
│   │   ├── translations.tsx     # Language dictionary (RU, EN, ZH)
│   │   │
│   │   └── providers/           # Data Adapters Layer
│   │       ├── types.ts         # IVesselDataProvider interface
│   │       ├── LocalDBProvider.ts       # JIV direct registry
│   │       ├── FarPostAdapter.ts        # FarPost.ru feed adapter
│   │       ├── YandexTravelAdapter.ts   # Yandex Travel & Sea Taxi adapter
│   │       ├── AirbnbLuxAdapter.ts      # Airbnb Luxe Marine adapter
│   │       └── AggregateVesselProvider.ts # Parallel provider aggregator
│   │
│   └── components/              # React UI Components
```

---

## 🛠️ Технологический стек

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion)
- **Backend / API:** Express.js, esbuild, OpenAPI 3.0, Swagger UI
- **AI / Navigation:** Google GenAI SDK (`@google/genai`), Gemini 2.5 Flash / Pro
- **Icons:** Lucide React

---

## 🚀 Запуск и сборка проекта

### 1. Установка зависимостей
```bash
npm install
```

### 2. Режим разработки
```bash
npm run dev
```
Приложение и API откроются по адресу `http://localhost:3000`.
- **Интерактивная API Документация (Swagger UI):** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI Schema:** [http://localhost:3000/api/openapi.json](http://localhost:3000/api/openapi.json)

### 3. Проверка типов и линтинг
```bash
npm run lint
```

### 4. Продакшен сборка
```bash
npm run build
npm start
```

---

## 📄 Лицензия

Проект распространяется под лицензией MIT. Подробности в файле [LICENSE](./LICENSE).
