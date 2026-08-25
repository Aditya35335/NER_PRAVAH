/**
 * frontend/src/services/geocodingService.ts
 *
 * Location Search & Geocoding Provider Service (Google Geocoding & OpenStreetMap Nominatim).
 */

import { apiConfig } from '../config/apiConfig';

export interface GeocodeResult {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

class GeocodingService {
  async searchLocation(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) return [];
    try {
      const res = await apiConfig.fetchWithTimeout(
        `${apiConfig.getApiBaseUrl()}/geocode?q=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[GeocodingService] Location search failed:', err);
    }
    return [];
  }
}

export const geocodingService = new GeocodingService();
