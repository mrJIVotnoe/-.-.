/**
 * YandexTravelAdapter — Data Adapter for Yandex Travel & Yandex Go Marine Services
 */

import { Vessel, VesselSourceType } from '../../types';
import { IVesselDataProvider, VesselFilterOptions } from './types';

const YANDEX_VESSELS: Vessel[] = [
  {
    id: 'yx-galeon-500',
    source_type: 'yandex',
    source_name: 'Яндекс Путешествия (Яхты)',
    original_url: 'https://travel.yandex.ru/cruises/vladivostok/galeon-500-fly-yacht',
    vessel_type: 'yacht',
    geo_coordinates: { lat: 43.0025, lng: 131.8370 },
    name: 'Флайбридж-яхта «Galeon 500 Fly» (Яндекс)',
    category: 'yacht',
    description: 'Интеграция с сервисом Яндекс Путешествия. Премиальная польская яхта с откидными балконами Beach Mode, увеличивающими ширину палубы до 6 метров. Автоматическое бронирование через Яндекс Сплит.',
    capacity: 14,
    speed: 42,
    homeport: 'Бухта Новик (Яндекс Плюс Марина)',
    coordinates: { x: 41, y: 67 },
    latLon: [43.0025, 131.8370],
    priceHour: 16500,
    priceDay: 135000,
    currency: 'RUB',
    rating: 4.96,
    reviewsCount: 52,
    captainName: 'Виктор Плюс (Яндекс)',
    captainPhone: '+7 (800) 234-56-78',
    images: [
      'https://images.unsplash.com/photo-1621275471769-e6aa344546d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Яндекс Плюс Кэшбэк 10%', 'Beach Mode балконы', 'Климат-контроль', '2 каюты', 'Караоке JBL'],
    allowedActivities: ['VIP-круизы', 'Корпоративы', 'Праздники на воде'],
    isLive: true,
    responseTime: 5,
    partnerVerificationId: 'YX-SPLIT-88402'
  },
  {
    id: 'yx-express-taxi',
    source_type: 'yandex',
    source_name: 'Яндекс Go Морское Такси',
    original_url: 'https://taxi.yandex.ru/vladivostok/sea-taxi',
    vessel_type: 'taxi',
    geo_coordinates: { lat: 43.0720, lng: 131.8410 },
    name: 'Скоростной катер «Яндекс Go Sea Express»',
    category: 'taxi',
    description: 'Интегрированный экспресс-трансфер Yandex Go. Мгновенный вызов катера к пирсам острова Русский и острова Попова. Отслеживание местоположения катера в реальном времени на карте.',
    capacity: 10,
    speed: 60,
    homeport: 'Токаревский маяк (Яндекс Go)',
    coordinates: { x: 30, y: 56 },
    latLon: [43.0720, 131.8410],
    priceHour: 5200,
    currency: 'RUB',
    rating: 4.92,
    reviewsCount: 140,
    captainName: 'Диспетчер Яндекс Go',
    captainPhone: '+7 (800) 333-00-11',
    images: [
      'https://images.unsplash.com/photo-1610448721566-47369c768e70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Поддержка Яндекс Go', 'Круглосуточно 24/7', 'GPS-трекинг', 'Трансфер на острова'],
    allowedActivities: ['Трансфер', 'Доставка на острова'],
    isLive: true,
    responseTime: 3,
    partnerVerificationId: 'YX-GO-TAXI-001'
  }
];

export class YandexTravelAdapter implements IVesselDataProvider {
  readonly providerId: VesselSourceType = 'yandex';
  readonly providerName = 'Яндекс Путешествия & Яндекс Go';
  readonly sourceUrl = 'https://travel.yandex.ru/';

  async getVessels(filters?: VesselFilterOptions): Promise<Vessel[]> {
    let result = [...YANDEX_VESSELS];

    if (filters) {
      if (filters.category && filters.category !== 'all') {
        result = result.filter(v => v.category === filters.category);
      }
      if (filters.minCapacity) {
        result = result.filter(v => v.capacity >= filters.minCapacity!);
      }
      if (filters.maxPriceHour) {
        result = result.filter(v => !v.priceHour || v.priceHour <= filters.maxPriceHour!);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          v =>
            v.name.toLowerCase().includes(query) ||
            v.description.toLowerCase().includes(query)
        );
      }
    }

    return result;
  }

  async getVesselById(id: string): Promise<Vessel | null> {
    const found = YANDEX_VESSELS.find(v => v.id === id);
    return found || null;
  }
}
