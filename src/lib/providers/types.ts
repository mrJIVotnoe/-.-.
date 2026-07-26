/**
 * Data Providers Architecture — Global Bridge Data Adapters
 */

import { Vessel, VesselSourceType, VesselCategory, SupportedCurrency } from '../../types';

export interface VesselFilterOptions {
  category?: VesselCategory | 'all';
  sourceType?: VesselSourceType | 'all';
  minCapacity?: number;
  maxPriceHour?: number;
  searchQuery?: string;
  hasSharkRepeller?: boolean;
  hasEchoSounder?: boolean;
}

export interface IVesselDataProvider {
  /**
   * Unique identifier of provider
   */
  readonly providerId: VesselSourceType;
  
  /**
   * Human-readable provider name
   */
  readonly providerName: string;

  /**
   * Primary partner website / endpoint
   */
  readonly sourceUrl: string;

  /**
   * Retrieve normalized vessel list filtered by query options.
   * MUST return clean array (empty [] if no match). NO placeholders.
   */
  getVessels(filters?: VesselFilterOptions): Promise<Vessel[]>;

  /**
   * Retrieve a single vessel by ID from this provider
   */
  getVesselById(id: string): Promise<Vessel | null>;
}
