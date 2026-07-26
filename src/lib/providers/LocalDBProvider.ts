/**
 * LocalDBProvider — Internal JIV Direct Fleet Provider
 */

import { Vessel, VesselSourceType } from '../../types';
import { VESSELS_DATA } from '../../data/vessels';
import { IVesselDataProvider, VesselFilterOptions } from './types';

export class LocalDBProvider implements IVesselDataProvider {
  readonly providerId: VesselSourceType = 'internal';
  readonly providerName = 'JIV Флот (Прямой реестр)';
  readonly sourceUrl = 'https://jiv-vladivostok.ru';

  async getVessels(filters?: VesselFilterOptions): Promise<Vessel[]> {
    let result = [...VESSELS_DATA];

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
      if (filters.hasSharkRepeller) {
        result = result.filter(v => v.hasSharkRepeller);
      }
      if (filters.hasEchoSounder) {
        result = result.filter(v => v.hasEchoSounder);
      }
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase().trim();
        result = result.filter(
          v =>
            v.name.toLowerCase().includes(query) ||
            v.description.toLowerCase().includes(query) ||
            v.homeport.toLowerCase().includes(query)
        );
      }
    }

    return result;
  }

  async getVesselById(id: string): Promise<Vessel | null> {
    const vessel = VESSELS_DATA.find(v => v.id === id);
    return vessel || null;
  }
}
