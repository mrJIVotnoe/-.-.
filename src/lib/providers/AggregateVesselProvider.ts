/**
 * AggregateVesselProvider — Global Bridge Aggregator
 * Coordinates LocalDBProvider, FarPostAdapter, YandexTravelAdapter, and AirbnbLuxAdapter.
 */

import { Vessel, VesselSourceType } from '../../types';
import { IVesselDataProvider, VesselFilterOptions } from './types';
import { LocalDBProvider } from './LocalDBProvider';
import { FarPostAdapter } from './FarPostAdapter';
import { YandexTravelAdapter } from './YandexTravelAdapter';
import { AirbnbLuxAdapter } from './AirbnbLuxAdapter';

export class AggregateVesselProvider {
  private providers: Map<VesselSourceType, IVesselDataProvider>;

  constructor() {
    this.providers = new Map<VesselSourceType, IVesselDataProvider>([
      ['internal', new LocalDBProvider()],
      ['farpost', new FarPostAdapter()],
      ['yandex', new YandexTravelAdapter()],
      ['airbnb', new AirbnbLuxAdapter()]
    ]);
  }

  /**
   * Get all registered providers
   */
  getProviders(): IVesselDataProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get specific provider by ID
   */
  getProvider(sourceType: VesselSourceType): IVesselDataProvider | undefined {
    return this.providers.get(sourceType);
  }

  /**
   * Fetch vessels from all or specific data providers.
   * Standardized output: returns empty array [] if no matches. No fake stubs.
   */
  async getAllVessels(filters?: VesselFilterOptions): Promise<Vessel[]> {
    const selectedSource = filters?.sourceType || 'all';
    
    if (selectedSource !== 'all' && this.providers.has(selectedSource)) {
      const provider = this.providers.get(selectedSource)!;
      return await provider.getVessels(filters);
    }

    // Fetch in parallel across all registered providers
    const promises = Array.from(this.providers.values()).map(p =>
      p.getVessels(filters).catch(err => {
        console.error(`[Data Adapter Error] ${p.providerName}:`, err);
        return []; // Standardized graceful fallback: empty array
      })
    );

    const results = await Promise.all(promises);
    return results.flat();
  }

  /**
   * Find a vessel by ID across all providers
   */
  async getVesselById(id: string): Promise<Vessel | null> {
    for (const provider of this.providers.values()) {
      try {
        const vessel = await provider.getVesselById(id);
        if (vessel) return vessel;
      } catch (err) {
        console.error(`[Data Adapter Error] searching ID in ${provider.providerName}:`, err);
      }
    }
    return null;
  }
}

// Singleton instance for quick app-wide usage
export const globalVesselAggregator = new AggregateVesselProvider();
