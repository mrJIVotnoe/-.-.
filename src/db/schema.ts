import { pgTable, serial, text, integer, boolean, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

// Vessels Catalog (FarPost Verified Fleet)
export const vesselsTable = pgTable('vessels', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'yacht' | 'boat' | 'jet-ski' | 'catamaran' | 'hydrofoil'
  category: text('category').notNull(), // 'vip' | 'active' | 'taxi' | 'standard'
  capacity: integer('capacity').notNull(),
  priceRub: integer('price_rub').notNull(),
  priceCny: integer('price_cny').notNull(),
  speedKm: integer('speed_km').notNull(),
  pierLocation: text('pier_location').notNull(), // 'Улисс' | 'Змеинка' | 'Поспелово' | 'Токаревский маяк'
  captainName: text('captain_name').notNull(),
  gimsLicense: text('gims_license').notNull(),
  hasSharkShield: boolean('has_shark_shield').default(false).notNull(),
  hasGpsTelemetry: boolean('has_gps_telemetry').default(true).notNull(),
  isVerifiedFarpost: boolean('is_verified_farpost').default(true).notNull(),
  image: text('image').notNull(),
  specs: jsonb('specs').$type<string[]>().default([]),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Bookings Table
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

// Security & Authentication Logs (152-ФЗ / 547-ФЗ Audit)
export const securityLogsTable = pgTable('security_logs', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email'),
  phone: text('phone'),
  authMethod: text('auth_method').notNull(), // 'EMAIL_OTP' | 'FLASH_CALL' | 'YANDEX_OAUTH' | 'WECHAT_OAUTH'
  ipAddress: text('ip_address'),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILED' | 'BLOCKED_DOMAIN'
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Initial FarPost Fleet Seed Dataset
export const SEED_VESSELS = [
  {
    id: 'julia-60',
    name: 'Яхта «Джулия» VIP (Shark Shield)',
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
    isVerifiedFarpost: true,
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
    specs: ['Длина: 60 футов (18.5 м)', 'Система отпугивания акул Shark Shield (Электромагнитная)', '2 каюты флайбридж + камбуз', 'Морская акустика JBL Marine'],
    description: 'Флагманская 60-футовая VIP-яхта для морских прогулок, свадеб и деловых встреч во Владивостоке. Оснащена промышленной австралийской системой Shark Shield для защиты купающихся от акул в бухтах острова Русский.'
  },
  {
    id: 'nika-48',
    name: 'Премиум Яхта «Nika»',
    type: 'yacht',
    category: 'vip',
    capacity: 12,
    priceRub: 14000,
    priceCny: 1100,
    speedKm: 38,
    pierLocation: 'Улисс',
    captainName: 'Капитан Виктор С.',
    gimsLicense: 'GIMS-RU-25-8831',
    hasSharkShield: false,
    hasGpsTelemetry: true,
    isVerifiedFarpost: true,
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    specs: ['Длина: 48 футов (14.6 м)', 'Роскошная кожаная каюта с панорамой', 'Сауна на борту и гриль-зона', 'SUP-борды включены в стоимость'],
    description: 'Комфортабельная элитная яхта с панорамным остеклением и тиковым покрытием палубы. Идеальна для экскурсий к маяку Басаргина и архипелагу Императрицы Евгении.'
  },
  {
    id: 'brp-seadoo-pospelovo',
    name: 'Гидроциклы BRP SeaDoo RXT-X 300',
    type: 'jet-ski',
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
    isVerifiedFarpost: true,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    specs: ['Мощность: 300 л.с.', 'Макс. скорость: 127 км/ч', 'Базирование: Причал Поспелово (о. Русский)', 'Гидрокостюмы, жилеты и инструктаж включены'],
    description: 'Самые быстрые реактивные гидроциклы во Владивостоке. Локация Поспелово позволяет за 2 минуты выйти под Русский Мост и развить рекордные 127 км/ч.'
  },
  {
    id: 'zmeinka-express-boat',
    name: 'Скоростной катер «Змеинка-Экспресс»',
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
    isVerifiedFarpost: true,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    specs: ['Вместимость: 8 пассажиров', 'Базирование: Бухта Змеинка', 'Круглосуточное морское такси 24/7', 'Защитный закрытый тент от брызг'],
    description: 'Надежное морское такси из бухты Змеинка. Быстрые трансферы на мыс Вятлина, бухту Новик и остров Попова.'
  },
  {
    id: 'tokarevsky-taxi-shuttle',
    name: 'Морское Такси «Токаревский Шаттл»',
    type: 'boat',
    category: 'taxi',
    capacity: 6,
    priceRub: 799,
    priceCny: 65,
    speedKm: 48,
    pierLocation: 'Токаревский маяк',
    captainName: 'Капитан Дмитрий К.',
    gimsLicense: 'GIMS-RU-25-3310',
    hasSharkShield: false,
    hasGpsTelemetry: true,
    isVerifiedFarpost: true,
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    specs: ['Доступная цена: от 799 ₽/час', 'Базирование: Маяк Токаревского', 'Экспресс-рейсы по Босфору Восточному', 'Детские спасательные жилеты МЧС'],
    description: 'Самый доступный катер морского такси у Токаревского маяка. Регулярные экскурсионные круги под Золотой и Русский мосты от 799 рублей за час.'
  }
];
