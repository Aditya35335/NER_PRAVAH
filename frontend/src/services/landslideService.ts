/**
 * frontend/src/services/landslideService.ts
 *
 * Physics-Based Landslide Risk & NASA EONET Historical Incidents Service.
 */

import { apiConfig } from '../config/apiConfig';

export interface HistoricalEvent {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  date: string;
  source: string;
  description: string;
}

export interface LandslidePrediction {
  latitude: number;
  longitude: number;
  locationName: string;
  stateName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: {
    rainfallWeight: number;
    soilSaturationWeight: number;
    slopeGradientWeight: number;
    geologicalIndex: number;
  };
  metrics: {
    rainfall24h: number;
    soilMoisture: number;
    slopeAngle: number;
    elevation: number;
  };
  hourlyHistory?: Array<{
    time: string;
    hour: string;
    rainfall: number;
    soilMoisture: number;
    temp: number;
    riskScore: number;
    FS: number;
  }>;
  forecast7day?: Array<{
    date: string;
    predictedRainfall: number;
    predictedRisk: number;
  }>;
  fsParameters: {
    c_prime: number;
    gamma: number;
    gamma_w: number;
    z: number;
    h_w: number;
    theta_deg: number;
    phi_prime: number;
    FS: number;
  };
  triggerReason: string;
  recommendation: string;
  modelConfidence: number;
  calculatedAt: string;
}

class LandslideService {
  async predictLandslideRisk(lat: number, lng: number, name = 'Location'): Promise<LandslidePrediction | null> {
    try {
      const res = await apiConfig.fetchWithTimeout(
        `${apiConfig.getApiBaseUrl()}/predict?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[LandslideService] Prediction failed:', err);
    }
    return null;
  }

  async getHistoricalEvents(bounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number }): Promise<HistoricalEvent[]> {
    try {
      const query = bounds
        ? `?minLat=${bounds.minLat}&maxLat=${bounds.maxLat}&minLng=${bounds.minLng}&maxLng=${bounds.maxLng}`
        : '';
      const res = await apiConfig.fetchWithTimeout(`${apiConfig.getApiBaseUrl()}/historical-events${query}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[LandslideService] Historical events fetch failed:', err);
    }
    return [];
  }

  async scanPanIndiaSectors(): Promise<any[]> {
    try {
      const res = await apiConfig.fetchWithTimeout(`${apiConfig.getApiBaseUrl()}/india-scan`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[LandslideService] Pan-India scan failed:', err);
    }
    return [];
  }
}

export const landslideService = new LandslideService();
