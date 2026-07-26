/**
 * AirbnbLuxAdapter — Data Adapter for Airbnb Luxe Marine & Global Yacht Charters
 */

import { Vessel, VesselSourceType } from '../../types';
import { IVesselDataProvider, VesselFilterOptions } from './types';

const AIRBNB_VESSELS: Vessel[] = [
  {
    id: 'ab-sunseeker-74',
    source_type: 'airbnb',
    source_name: 'Airbnb Luxe Marine',
    original_url: 'https://airbnb.com/rooms/luxe-vladivostok-sunseeker-74',
    vessel_type: 'yacht',
    geo_coordinates: { lat: 43.0038, lng: 131.8388 },
    name: 'Mega Yacht «Sunseeker Manhattan 74» (Airbnb Luxe)',
    category: 'yacht',
    description: 'Verified Airbnb Luxe listing #AB-749201. Premium 23-meter British motor yacht with full crew, private chef, master suite, and Jacuzzi on top deck. Global reservation with instant confirmation.',
    capacity: 18,
    speed: 46,
    homeport: 'Novik Bay Superyacht Pier (Airbnb)',
    coordinates: { x: 44, y: 69 },
    latLon: [43.0038, 131.8388],
    priceHour: 22000,
    priceDay: 180000,
    currency: 'USD',
    rating: 4.99,
    reviewsCount: 37,
    captainName: 'Capt. James & Crew (Airbnb Superhost)',
    captainPhone: '+1 (800) 555-0199',
    images: [
      'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Airbnb Superhost Guaranteed', 'Top Deck Jacuzzi', 'Private Chef Onboard', 'Jet Ski Included', '4 Luxury Suites'],
    hasSharkRepeller: true,
    allowedActivities: ['Luxury Charters', 'Private VIP Events', 'Sunset Cruises'],
    isLive: true,
    responseTime: 8,
    partnerVerificationId: 'AIRBNB-LUXE-VLAD-007'
  },
  {
    id: 'ab-fountaine-pajot-47',
    source_type: 'airbnb',
    source_name: 'Airbnb Luxe Marine',
    original_url: 'https://airbnb.com/rooms/luxe-vladivostok-fountaine-pajot-saona-47',
    vessel_type: 'catamaran',
    geo_coordinates: { lat: 43.1119, lng: 131.8650 },
    name: 'Sailing Catamaran «Fountaine Pajot Saona 47» (Airbnb)',
    category: 'catamaran',
    description: 'Verified Airbnb Luxe Listing #AB-882190. Ultra-stable luxury sailing catamaran with 5 double cabins, outdoor lounge, and panoramic salon. Ideal for overseas travelers visiting Peter the Great Gulf.',
    capacity: 16,
    speed: 22,
    homeport: 'Seven Feet Yacht Club (Airbnb)',
    coordinates: { x: 37, y: 36 },
    latLon: [43.1119, 131.8650],
    priceHour: 15000,
    priceDay: 120000,
    currency: 'USD',
    rating: 4.97,
    reviewsCount: 28,
    captainName: 'Capt. Elena (Airbnb Superhost)',
    captainPhone: '+1 (800) 555-0188',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505080856163-267d49b302cd?auto=format&fit=crop&w=600&q=80'
    ],
    features: ['Airbnb Verified Cleanliness', 'Panoramic Lounge', '3 SUP Boards', 'Solar Powered Systems', 'Air Conditioning'],
    allowedActivities: ['Island Hopping', 'Family Vacations', 'Sailing Tours'],
    isLive: true,
    responseTime: 12,
    partnerVerificationId: 'AIRBNB-LUXE-CAT-47'
  }
];

export class AirbnbLuxAdapter implements IVesselDataProvider {
  readonly providerId: VesselSourceType = 'airbnb';
  readonly providerName = 'Airbnb Luxe Marine Charters';
  readonly sourceUrl = 'https://airbnb.com/luxe/';

  async getVessels(filters?: VesselFilterOptions): Promise<Vessel[]> {
    let result = [...AIRBNB_VESSELS];

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
    const found = AIRBNB_VESSELS.find(v => v.id === id);
    return found || null;
  }
}
