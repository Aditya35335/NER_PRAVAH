/**
 * frontend/src/services/weatherService.ts
 *
 * Real weather and soil moisture data provider service.
 * Fetches 24h accumulated rainfall, volumetric soil saturation, and 7-day forecasts.
 */

import { apiConfig } from '../config/apiConfig';

export interface WeatherReading {
  rainfall24h: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  soilMoisture: number; // % volumetric saturation
  forecast: string;
  source: string;
  providerName: string;
  hourlyHistory?: Array<{
    time: string;
    hour: string;
    rainfall: number;
    soilMoisture: number;
    temp: number;
    riskScore: number;
    FS: number;
  }>;
}

class WeatherService {
  async getCurrentWeather(lat = 25.298, lng = 91.582): Promise<WeatherReading> {
    try {
      const res = await apiConfig.fetchWithTimeout(`${apiConfig.getApiBaseUrl()}/weather?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[WeatherService] Live weather fetch failed:', err);
    }

    return {
      rainfall24h: 0,
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      soilMoisture: 0,
      forecast: 'Weather stream unavailable',
      source: 'UNAVAILABLE',
      providerName: 'Open-Meteo / OWM'
    };
  }
}

export const weatherService = new WeatherService();
