/**
 * frontend/src/config/apiConfig.ts
 *
 * Single centralized configuration & provider selection manager for all external APIs.
 * Ensures zero hardcoding of keys across React components and unified error/timeout handling.
 */

export interface ApiConfigState {
  googleMapsApiKey: string;
  openWeatherApiKey: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  apiBaseUrl: string;
  requestTimeoutMs: number;
}

class FrontendApiConfig {
  private config: ApiConfigState;

  constructor() {
    const env = (import.meta as any).env || {};
    this.config = {
      googleMapsApiKey:  env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDHSdugZERrsqMRzIsB1X5I8-S2uo2LkQg',
      openWeatherApiKey: env.VITE_OPENWEATHER_API_KEY || '54aed839fb82bd7c5f6c957ca7365960',
      firebaseConfig: {
        apiKey:            env.VITE_FIREBASE_API_KEY            || "AIzaSyBX0ol5z6httEajjccDvEadVbTe5CM5Rr0",
        authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN        || "nreprahva.firebaseapp.com",
        projectId:         env.VITE_FIREBASE_PROJECT_ID         || "nreprahva",
        storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET     || "nreprahva.firebasestorage.app",
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID|| "140952405705",
        appId:             env.VITE_FIREBASE_APP_ID             || "1:140952405705:web:77079c93593fdc29962f18"
      },
      apiBaseUrl: '/api',
      requestTimeoutMs: 10000
    };
  }

  public getGoogleMapsKey(): string {
    return this.config.googleMapsApiKey;
  }

  public getOpenWeatherKey(): string {
    return this.config.openWeatherApiKey;
  }

  public getFirebaseConfig() {
    return this.config.firebaseConfig;
  }

  public getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  public getGoogleSatelliteTileUrl(): string {
    const key = this.config.googleMapsApiKey;
    return `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${key}`;
  }

  public getOpenWeatherRainTileUrl(): string {
    const key = this.config.openWeatherApiKey;
    return `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${key}`;
  }

  public getOpenWeatherCloudTileUrl(): string {
    const key = this.config.openWeatherApiKey;
    return `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${key}`;
  }

  public getStaticMapSatelliteUrl(lat: number, lng: number, zoom = 16, width = 800, height = 400): string {
    const key = this.config.googleMapsApiKey;
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${key}`;
  }

  /** Unified fetch helper with timeout and standardized error handling */
  public async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${this.config.requestTimeoutMs}ms: ${url}`);
      }
      throw err;
    }
  }
}

export const apiConfig = new FrontendApiConfig();
