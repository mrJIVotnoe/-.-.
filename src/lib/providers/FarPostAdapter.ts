/**
 * FarPostAdapter — Data Adapter for FarPost.ru Marine Transport Feed
 */

import { Vessel, VesselSourceType } from '../../types';
import { IVesselDataProvider, VesselFilterOptions } from './types';

const FARPOST_VESSELS: Vessel[] = [
  {
    id: 'fp-sea-ray-330',
    source_type: 'farpost',
    source_name: 'FarPost Водный Транспорт',
    original_url: 'https://farpost.ru/vladivostok/water/yacht/sea-ray-330-sundancer-10829381.html',
    vessel_type: 'yacht',
    geo_coordinates: { lat: 43.1128, lng: 131.868 },
    name: 'Круизер «Sea Ray 330 Sundancer» (FarPost)',
    category: 'yacht',
    description: 'Официальное объявление с доски FarPost.ru #10829381. Двухкаютный круизный катер повышенной комфортности для аренды в акватории Амурского залива. Салон з натурального тика, купальная платформа, мангал.',
    capacity: 10,
    speed: 40,
    homeport: 'Яхт-клуб «Семь Футов» (FarPost)',
    coordinates: { x: 38, y: 36 },
    latLon: [43.1128, 131.868],
    priceHour: 5500,
    priceDay: 45000,
    currency: 'RUB',
    rating: 4.88,
    reviewsCount: 29,
    captainName: 'Алексей ДВ (FarPost)',
    captainPhone: '+7 (914) 700-11-99',
    images: [
      'https://images.unsplash.com/photo-1563299796-17596ed6b017?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Проверено FarPost API', 'Теплая каюта', 'SUP-борд', 'Гриль', 'Душ с горячей водой'],
    allowedActivities: ['Семейный отдых', 'Прогулки', 'Купание'],
    isLive: true,
    responseTime: 10,
    partnerVerificationId: 'FP-98214-VL'
  },
  {
    id: 'fp-yamaha-fr-25',
    source_type: 'farpost',
    source_name: 'FarPost Водный Транспорт',
    original_url: 'https://farpost.ru/vladivostok/water/boating/yamaha-fr25-fishing-9938210.html',
    vessel_type: 'boat',
    geo_coordinates: { lat: 43.0862, lng: 131.938 },
    name: 'Рыболовный катер «Yamaha FR-25» (FarPost)',
    category: 'boat',
    description: 'Объявление FarPost.ru #9938210. Оснащен навигацией Lowrance, держателями для 10 удилищ и аэратором. Выход на рыбалку из бухты Улисс на кальмара и камбалу.',
    capacity: 7,
    speed: 34,
    homeport: 'Бухта Улисс (Пирс #4)',
    coordinates: { x: 62, y: 43 },
    latLon: [43.0862, 131.938],
    priceHour: 3200,
    priceDay: 25000,
    currency: 'RUB',
    rating: 4.79,
    reviewsCount: 41,
    captainName: 'Сергей Морской (FarPost)',
    captainPhone: '+7 (924) 440-22-11',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Проверено FarPost API', 'Эхолот Lowrance', 'Снасти на кальмара', 'Аэратор'],
    hasEchoSounder: true,
    allowedActivities: ['Рыбалка', 'Ночной лов кальмара'],
    isLive: true,
    responseTime: 15,
    partnerVerificationId: 'FP-44102-VL'
  }
];

export class FarPostAdapter implements IVesselDataProvider {
  readonly providerId: VesselSourceType = 'farpost';
  readonly providerName = 'FarPost.ru Морской Транспорт';
  readonly sourceUrl = 'https://farpost.ru/vladivostok/water/';

  async getVessels(filters?: VesselFilterOptions): Promise<Vessel[]> {
    let result = [...FARPOST_VESSELS];

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
    const found = FARPOST_VESSELS.find(v => v.id === id);
    return found || null;
  }
}
