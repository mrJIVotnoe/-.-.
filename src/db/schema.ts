import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

// 1. Captains & Users Table
export const usersTable = pgTable('users', {
  id: text('id').primaryKey(), // e.g. usr_101 or telegram_123456
  name: text('name').notNull(),
  role: text('role').default('captain').notNull(), // 'captain' | 'passenger' | 'admin'
  phone: text('phone'),
  email: text('email'),
  telegramUsername: text('telegram_username'),
  wechatId: text('wechat_id'),
  isVerified: boolean('is_verified').default(false).notNull(),
  licenseGims: text('license_gims'),
  rating: numeric('rating').default('5.0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. Vessels Catalog Table
export const vesselsTable = pgTable('vessels', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'yacht' | 'boat' | 'jetski' | 'catamaran' | 'hydrofoil'
  category: text('category').notNull(), // 'vip' | 'active' | 'taxi'
  capacity: integer('capacity').notNull(),
  priceRub: integer('price_rub').notNull(),
  priceCny: integer('price_cny').notNull(),
  speedKm: integer('speed_km').notNull(),
  pierLocation: text('pier_location').notNull(), // 'Улисс' | 'Змеинка' | 'Поспелово' | 'Токаревский маяк'
  captainName: text('captain_name').notNull(),
  gimsLicense: text('gims_license').notNull(),
  hasSharkShield: boolean('has_shark_shield').default(false).notNull(),
  hasGpsTelemetry: boolean('has_gps_telemetry').default(true).notNull(),
  isVerifiedGims: boolean('is_verified_gims').default(true).notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  image: text('image').notNull(),
  specs: jsonb('specs').$type<string[]>().default([]),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 3. Bookings Table
export const bookingsTable = pgTable('bookings', {
  id: text('id').primaryKey(), // Order ID e.g. B-901
  vesselId: text('vessel_id').notNull().references(() => vesselsTable.id),
  vesselName: text('vessel_name').notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  bookingDate: text('booking_date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(),
  durationHours: integer('duration_hours').notNull(),
  totalPriceRub: integer('total_price_rub').notNull(),
  paymentMethod: text('payment_method').default('SBP').notNull(), // 'SBP' | 'CASH' | 'CARD' | 'WECHAT'
  paymentStatus: text('payment_status').default('PENDING').notNull(), // 'PENDING' | 'PAID' | 'REFUNDED'
  sbpQrPayload: text('sbp_qr_payload'),
  sbpPaymentId: text('sbp_payment_id'),
  passengersCount: integer('passengers_count').default(1).notNull(),
  wishesRoute: text('wishes_route'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. Captain Verification Documents Table
export const verificationDocsTable = pgTable('verification_docs', {
  id: text('id').primaryKey(),
  captainId: text('captain_id').notNull(),
  vesselId: text('vessel_id'),
  docType: text('doc_type').notNull(), // 'GIMS_LICENSE' | 'VESSEL_PASSPORT' | 'MCHS_SAFETY' | 'INSURANCE'
  docNumber: text('doc_number').notNull(),
  docImageUrl: text('doc_image_url'),
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 5. Security & Audit Logs Table (152-ФЗ / 547-ФЗ Audit)
export const securityLogsTable = pgTable('security_logs', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email'),
  phone: text('phone'),
  authMethod: text('auth_method').notNull(), // 'EMAIL_OTP' | 'FLASH_CALL' | 'TELEGRAM_AUTH' | 'WECHAT_OAUTH'
  ipAddress: text('ip_address'),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILED' | 'BLOCKED_DOMAIN'
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Demo Seed Dataset (Strictly 1 item per category for interface debug / captain onboard demo)
export const DEMO_SEED_VESSELS = [
  {
    id: 'demo-vip-julia',
    name: 'Яхта VIP «Джулия» [Демо-образ]',
    type: 'yacht',
    category: 'vip',
    capacity: 15,
    priceRub: 18500,
    priceCny: 1450,
    speedKm: 42,
    pierLocation: 'Улисс',
    captainName: 'Капитан Александр Г.',
    gimsLicense: 'GIMS-RU-25-9012',
    hasSharkShield: true,
    hasGpsTelemetry: true,
    isVerifiedGims: true,
    isDemo: true,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
    specs: ['Длина: 60 футов (18.5 м)', 'Система отпугивания акул Shark Shield', 'Флайбридж и 2 каюты', 'Акустика JBL Marine'],
    description: 'Образец оформления карточки VIP-яхты для капитанов-партнеров. Оснащена системой отпугивания акул.'
  },
  {
    id: 'demo-active-jetski',
    name: 'Гидроцикл BRP SeaDoo RXT-300 [Демо-образ]',
    type: 'jetski',
    category: 'active',
    capacity: 2,
    priceRub: 3500,
    priceCny: 280,
    speedKm: 127,
    pierLocation: 'Поспелово',
    captainName: 'Инструктор Денис М.',
    gimsLicense: 'GIMS-RU-25-7712',
    hasSharkShield: false,
    hasGpsTelemetry: true,
    isVerifiedGims: true,
    isDemo: true,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    specs: ['Мощность: 300 л.с.', 'Скорость: до 127 км/ч', 'Базирование: Поспелово', 'Жилеты и гидрокостюмы'],
    description: 'Образец карточки активного отдыха для проката гидроциклов и катеров в акватории острова Русский.'
  },
  {
    id: 'demo-taxi-boat',
    name: 'Морское такси «Русский Экспресс» [Демо-образ]',
    type: 'boat',
    category: 'taxi',
    capacity: 8,
    priceRub: 1200,
    priceCny: 95,
    speedKm: 55,
    pierLocation: 'Змеинка',
    captainName: 'Капитан Игорь П.',
    gimsLicense: 'GIMS-RU-25-4421',
    hasSharkShield: false,
    hasGpsTelemetry: true,
    isVerifiedGims: true,
    isDemo: true,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    specs: ['Вместимость: 8 человек', 'Бухта Змеинка / Маяк Токаревского', 'Круглосуточный трансфер 24/7', 'Тент от брызг'],
    description: 'Образец карточки морского такси и островных трансферов.'
  }
];

// Legacy alias for compatibility during migration
export const SEED_VESSELS = DEMO_SEED_VESSELS;

