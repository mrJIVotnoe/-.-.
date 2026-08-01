# 🛥️ Journey In Vladivostok (JIV) — Enterprise Fleet Rental & AI Maritime Platform

<p align="center">
  <img src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=1400&q=80" alt="JIV Fleet Banner" width="100%" style="border-radius: 12px;" />
</p>

<p align="center">
  <b>Флагманский цифровая экосистема аренды яхт, катеров, катамаранов и морского сервиса в акватории Владивостока и Залива Петра Великого</b>
</p>

<p align="center">
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript" alt="TypeScript"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react" alt="React"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-6.0-646CFF.svg?style=for-the-badge&logo=vite" alt="Vite"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4.21-000000.svg?style=for-the-badge&logo=express" alt="Express"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind"></a>
  <a href="https://tanstack.com/virtual"><img src="https://img.shields.io/badge/DOM_Virtualization-TanStack_Virtual-FF4154.svg?style=for-the-badge" alt="TanStack Virtual"></a>
  <a href="https://docker.com"><img src="https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker" alt="Docker"></a>
  <a href="https://cloud.google.com/vertex-ai"><img src="https://img.shields.io/badge/AI_Engine-Google_Gemini_API-8E44AD.svg?style=for-the-badge&logo=googlecloud" alt="Gemini AI"></a>
</p>

---

## 💎 Executive Summary / Для Инвесторов и Партнёров

**Journey In Vladivostok (JIV)** — это высокотехнологичная маркетплейс-платформа коммерческого и туристического флота Приморского края. Платформа соединяет судовладельцев, капитанов, гидов и туристо-пассажиров в едином экосистемном пространстве.

### 🌟 Ключевые метрики и рыночный потенциал
* **Целевой рынок (TAM):** $50M+ (Морской туризм Приморья, Залив Петра Великого, Японское море, круизные и индивидуальные чартеры для гостей из РФ, Китая и Азиатско-Тихоокеанского региона).
* **Архитектурная независимость (Self-Hosted First):** Платформа разработана по стандарту **On-Premise Native**. Приложение разворачивается на собственном «железе» судовладельцев или локальном ЦОД, с готовой архитектурой бесшовной миграции в облачные контуры (Yandex Cloud, SberCloud, VK Cloud, Cloud SQL/PostgreSQL).
* **Высокая производительность:** Интеграция виртуализации списка судов на базе `@tanstack/react-virtual` позволяет обрабатывать **тысячи объявлений** с нулевой задержкой интерфейса и максимальной экономией DOM-узлов.

---

## 🏛️ Архитектура и Ключевые Модули

### 1. ⚓ Интерактивный Морской Навигатор & Радар Судов
* **AIS GPS Telemetry:** Отображение текущего местоположения судов в реальном времени.
* **Интерактивные карты изобат:** Отображение фарватеров, глубин, опасных мелей и живописных бухт острова Русский, Попова, Рейнеке и Рикорда.
* **Конструктор морских маршрутов:** Визуализация пути, расчет длительности плавания и штормовой безопасности.

### 2. 🤖 «Цифровой Капитан» (Google Gemini AI Engine)
* **Серверный прокси Gemini API:** Безопасное исполнение AI-запросов без утечки API-ключей на клиент.
* **Персонализированные экскурсии:** Генерация авторских морских маршрутов с учетом погоды, ветра, высоты волны и пожеланий гостей.
* **Интеллектуальный расчет расхода топлива:** Автоматическая оценка расхода солярки/бензина по выбранному крейсерскому ходу.

### 3. 🛡️ Безопасность и Полное Соответствие Законодательству РФ (152-ФЗ / 547-ФЗ)
* **Email-авторизация с проверкой доменов РФ:** Автоматическая валидация отечественных почтовых сервисов (`@yandex.ru`, `@mail.ru`, `@bk.ru`, `@inbox.ru`, `@rambler.ru`, `@яндекс.рф`) согласно требованиям закона о защите информации.
* **Двухрежимная аутентификация по почте:**
  - 📩 **Одноразовый 6-значный OTP-код из письма** (Magic Login без паролей).
  - 🔑 **Постоянный зашифрованный пароль** (Хранение в БД в зашифрованном виде SHA-256 + Salt / Argon2).
* **Мобильная верификация (+7 РФ):** Поддержка SMS-кодов и Flash Call экономичных авторизаций.
* **Multi-Provider SSO (OAuth 2.0 / OpenID Connect):** Готовая архитектура для Яндекс ID, Google ID, Sign in with Apple и WeChat Open Platform (微信登录).

### 4. 💳 Мультивалютный Платежный Шлюз
* **Российский контур:** Прямая интеграция НСПК (карты МИР) и СБП (Система Быстрых Платежей по QR-коду).
* **Международный контур:** WeChat Pay (для туристов из КНР) и Stripe Corporate Global.

### 5. 🎨 Динамический Движок Атмосферы (Time-Aware Styling)
* **Автоматическая смена темы по часовому поясу Владивостока (UTC+10):**
  - ☀️ **День** (07:00 – 18:00): Высококонтрастная светлая морская тема.
  - 🌅 **Закат** (18:00 – 22:00): Теплая янтарно-золотая гамма.
  - 🌕 **Ночь** (22:00 – 07:00): Глубокий ультрамариновый тёмный режим.

---

## 🛠️ Технологический Стек

### Frontend
- **Core Framework:** React 19.0 + TypeScript 5.7
- **Build Tool:** Vite 6.0
- **Virtualization Engine:** `@tanstack/react-virtual` 3.13 (Оптимизация огромных списков)
- **Styling & Design System:** Tailwind CSS v4.0, Motion (`motion/react`)
- **Iconography:** Lucide React

### Backend & Server Infrastructure
- **Web Server:** Express.js 4.21 (Production-ready CJS Bundle via Esbuild)
- **AI Infrastructure:** Google GenAI SDK (`@google/genai`)
- **Security:** SHA-256 State Tokens, CORS Origin Isolation, Rate Limit Protections
- **Database Architecture:** Local Storage / LowDB (Self-Hosted Initial) $\rightarrow$ Cloud SQL / PostgreSQL / Drizzle ORM (Production Migration Ready)

---

## 📦 Быстрый Запуск (Quick Start)

### 1. Клонирование репозитория
```bash
git clone https://github.com/vladivostok-fleet/jiv-vladivostok-fleet.git
cd jiv-vladivostok-fleet
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Конфигурация окружения
Создайте файл `.env` в корневой директории:
```env
# Серверные конфигурации
NODE_ENV=development
APP_MODE=demo # demo | local | staging | production
HOST=0.0.0.0
PORT=3000
APP_URL=http://localhost:3000

# ИИ Сервисы
GEMINI_API_KEY=your_google_gemini_api_key

# OAuth Ключи (После оформления юрлица)
YANDEX_CLIENT_ID=your_yandex_client_id
GOOGLE_CLIENT_ID=your_google_client_id
WECHAT_APP_ID=your_wechat_appid
```

### 4. Запуск в режиме разработки
```bash
npm run dev
```
Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 5. Production Сборка & Запуск
```bash
npm run build
npm start
```

### 6. Режимы запуска APP_MODE

`APP_MODE` отделяет демонстрационные интеграции от будущего боевого контура:

- `demo` — презентационный режим с sandbox/preview ответами для WeChat, Telegram, OAuth и OTP.
- `local` — self-hosted запуск на собственном железе до подключения юрлица, домена и платежных провайдеров.
- `staging` — проверка реальных ключей и callback URL перед запуском.
- `production` — боевой режим: demo-коды, simulated WeChat Pay и sandbox-bypass должны быть отключены.

Для первого локального пилота во Владивостоке рекомендуется `APP_MODE=local`, а для презентаций инвесторам и партнёрам — `APP_MODE=demo`.

---

## 🐳 Деплой на Собственном Сервере (Docker / Bare-Metal)

Платформа спроектирована для работы в изолированном Docker-контейнере или на выделенном сервере (Ubuntu Server 22.04 LTS):

```dockerfile
# Dockerfile Example
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

В репозитории также есть production-ready `Dockerfile` и `docker-compose.yml` для self-hosted запуска с PostgreSQL, Redis и Nginx. Для локального пилота используйте:

```bash
APP_MODE=local docker compose up --build
```

---

## 🗺️ Дорожная Карта Развития (Roadmap 2026–2027)

- [x] **Q3 2026:** Выпуск MVP с виртуализацией списков судов, картой Залива Петра Великого и модулем «Цифровой Капитан».
- [x] **Q3 2026:** Внедрение верификации email по стандартам РФ (152-ФЗ/547-ФЗ) и двухрежимной авторизации.
- [ ] **Q4 2026:** Оформление юрлица (ИП/ООО) и подключение реальных ключей Yandex ID и СБП Эквайринга Т-Банк/Сбер.
- [ ] **Q1 2027:** Миграция БД на реплицируемый кластер PostgreSQL (Yandex Managed Service for PostgreSQL).
- [ ] **Q2 2027:** Релиз мобильного приложения React Native (iOS / Android) с оффлайн-картами фарватеров.

---

## 📄 Лицензия и Правовая Информация

© 2026 **Journey In Vladivostok (JIV) Fleet Engine**. Все права защищены.
Распространяется под коммерческой лицензией или MIT License.

---

<p align="center">
  <b>Сделано с любовью к Тихому Океану и Владивостоку ⚓🌊</b>
</p>
