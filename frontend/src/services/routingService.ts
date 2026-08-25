/**
 * frontend/src/services/routingService.ts
 *
 * Real Road Evacuation Routing Provider Service (Google Directions & OSRM).
 */

import { apiConfig } from '../config/apiConfig';

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  steps: RouteStep[];
  blockedSegments: [number, number][];
  destinationShelter: {
    id: string;
    name: string;
    location: string;
    availableCapacity: number;
  };
  alternateShelters: Array<{
    id: string;
    name: string;
    location: string;
    distanceKm: number;
    availableCapacity: number;
    status: string;
  }>;
  source: string;
}

class RoutingService {
  async getEvacuationRoute(startLat: number, startLng: number, targetShelterId?: string): Promise<RouteResult | null> {
    try {
      const q = targetShelterId ? `&shelterId=${encodeURIComponent(targetShelterId)}` : '';
      const res = await apiConfig.fetchWithTimeout(
        `${apiConfig.getApiBaseUrl()}/routing?startLat=${startLat}&startLng=${startLng}${q}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[RoutingService] Route calculation failed:', err);
    }
    return null;
  }
}

export const routingService = new RoutingService();
