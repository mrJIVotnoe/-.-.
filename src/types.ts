/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VesselCategory = 'yacht' | 'boat' | 'jetski' | 'taxi' | 'catamaran';
export type VesselSourceType = 'internal' | 'farpost' | 'yandex' | 'airbnb';
export type SupportedCurrency = 'RUB' | 'USD' | 'CNY';

export interface Vessel {
  id: string;
  source_type: VesselSourceType;
  source_name: string; // e.g. "FarPost Морской Транспорт", "Яндекс Путешествия", "Airbnb Luxe Marina", "JIV Флот"
  original_url: string; // Deep link URL to primary source
  vessel_type: VesselCategory;
  geo_coordinates: { lat: number; lng: number }; // Standarized geo-coordinates object
  
  name: string;
  category: VesselCategory;
  description: string;
  capacity: number; // in persons
  speed: number; // in km/h
  homeport: string; // e.g., "Бухта Улисс", "Бухта Новик", "Токаревский маяк"
  coordinates: { x: number; y: number }; // Percentage coordinate on custom SVG map
  latLon: [number, number]; // Actual coordinates for navigation
  priceHour?: number;
  priceDay?: number;
  currency?: SupportedCurrency; // Base currency for original prices (default: RUB)
  rating: number;
  reviewsCount: number;
  captainName: string;
  captainPhone: string;
  images: string[];
  features: string[]; // e.g., "Теплая каюта", "Эхолот", "Сап-борды", "Акустическая система"
  hasSharkRepeller?: boolean; // For Yacht "Julia"
  hasMusic?: boolean; // For jet skis
  hasEchoSounder?: boolean; // For fishing boats
  allowedActivities: string[]; // e.g., "Рыбалка", "Прогулки", "Скоростной драйв"
  isLive?: boolean; // Yandex Go status "В море / На связи"
  status?: 'free' | 'trip' | 'maintenance'; // 'Свободен' | 'На рейсе' | 'Техпомощь'
  responseTime?: number; // Average response speed in seconds
  isTopPromoted?: boolean; // Promoted in TOP-1 search
  promoBadge?: string; // e.g. "🔥 VIP TOP-1"
  partnerVerificationId?: string; // Verification code from partner API
}

export interface AdCampaign {
  id: string;
  name: string;
  format: 'search_banner' | 'weather_radar' | 'push_promo' | 'route_sponsor';
  status: 'active' | 'paused';
  impressions: number;
  clicks: number;
  ctr: string;
  spent: string;
  erid: string;
  bannerText?: string;
  promoCode?: string;
  targetLink?: string;
  imageUrl?: string;
}

export interface SharedTour {
  id: string;
  title: string;
  vesselId: string;
  vesselName: string;
  vesselImage: string;
  date: string;
  time: string;
  durationHours: number;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number;
  targetActivity: 'Рыбалка на тунца' | 'Прогулка к лежбищу нерп' | 'Рыбалка на лакедру' | 'Кальмарная ночная охота' | 'Обзорная экскурсия';
  homeport: string;
  features: string[];
}

export interface WeatherCondition {
  waveHeight: number; // meters
  windSpeed: number; // m/s
  windDirection: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  temperatureAir: number; // °C
  temperatureWater: number; // °C
  status: 'calm' | 'moderate' | 'stormy';
  warningMessage?: string;
  shelteredBaySuggestion?: string;
}

export interface MapPoint {
  id: string;
  name: string;
  type: 'harbor' | 'lighthouse' | 'sight';
  coordinates: { x: number; y: number };
  description: string;
}

export interface Booking {
  id: string;
  vesselId: string;
  vesselName: string;
  bookingType: 'hour' | 'day' | 'seat';
  date: string;
  timeStart: string;
  hoursCount?: number;
  seatsCount?: number;
  duration?: number;
  selectedExtras: string[];
  couponApplied?: string;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'declined';
  wishesRoute?: string;
  wishesConditions?: string;
  requestedAt?: string;
}
