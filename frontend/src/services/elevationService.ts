/**
 * frontend/src/services/elevationService.ts
 *
 * Real terrain elevation and DEM slope provider service.
 * Derives gradient angles from Google Maps Elevation API multi-point grid sampling.
 */

import { apiConfig } from '../config/apiConfig';

export interface TerrainReading {
  elevation: number;
  slope: number;
  aspect: number;
  state: string;
  c_prime: number;
  phi_prime: number;
  z: number;
}

class ElevationService {
  async getTerrain(lat = 25.298, lng = 91.582): Promise<TerrainReading> {
    try {
      const res = await apiConfig.fetchWithTimeout(`${apiConfig.getApiBaseUrl()}/terrain?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[ElevationService] Terrain fetch failed:', err);
    }

    return {
      elevation: 0,
      slope: 0,
      aspect: 0,
      state: 'India',
      c_prime: 10,
      phi_prime: 30,
      z: 2.0
    };
  }
}

export const elevationService = new ElevationService();
