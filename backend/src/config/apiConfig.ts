import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG_PATH = path.join(__dirname, '../../config_override.json');

export interface ApiKeys {
  IMD_API_KEY: string;
  WEATHER_API_KEY: string;
  SATELLITE_API_KEY: string;
  BHUVAN_API_KEY: string;
  MAP_API_KEY: string;
  ROUTING_API_KEY: string;
  SMS_API_KEY: string;
  FIREBASE_CONFIG: string;
  ML_API_URL: string;
}

class ApiConfigManager {
  private keys: ApiKeys = {
    IMD_API_KEY: process.env.IMD_API_KEY || '',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
    SATELLITE_API_KEY: process.env.SATELLITE_API_KEY || '',
    BHUVAN_API_KEY: process.env.BHUVAN_API_KEY || '',
    MAP_API_KEY: process.env.MAP_API_KEY || '',
    ROUTING_API_KEY: process.env.ROUTING_API_KEY || '',
    SMS_API_KEY: process.env.SMS_API_KEY || '',
    FIREBASE_CONFIG: process.env.FIREBASE_CONFIG || '',
    ML_API_URL: process.env.ML_API_URL || '',
  };

  private demoMode = true;

  constructor() {
    this.loadOverrides();
  }

  private loadOverrides() {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const fileContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const overrides = JSON.parse(fileContent);
        this.keys = { ...this.keys, ...overrides };
        console.log('[ApiConfig] Loaded configuration overrides from file.');
      }
    } catch (error) {
      console.error('[ApiConfig] Failed to load configuration overrides:', error);
    }
  }

  public saveOverrides(newKeys: Partial<ApiKeys>) {
    try {
      this.keys = { ...this.keys, ...newKeys };
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.keys, null, 2), 'utf-8');
      console.log('[ApiConfig] Saved configuration overrides to file.');
    } catch (error) {
      console.error('[ApiConfig] Failed to save configuration overrides:', error);
    }
  }

  public getKeys(): ApiKeys {
    return { ...this.keys };
  }

  public getKey(name: keyof ApiKeys): string {
    return this.keys[name];
  }

  public isDemoMode(): boolean {
    return this.demoMode;
  }

  public setDemoMode(mode: boolean) {
    this.demoMode = mode;
  }

  public getMaskedKeys() {
    const masked: Record<string, string> = {};
    (Object.keys(this.keys) as Array<keyof ApiKeys>).forEach((key) => {
      const val = this.keys[key];
      if (!val) {
        masked[key] = '';
      } else if (key === 'ML_API_URL') {
        masked[key] = val; // URL is fine to show
      } else if (val.length <= 8) {
        masked[key] = '••••' + val.slice(-2);
      } else {
        masked[key] = `${val.slice(0, 4)}_••••••••••${val.slice(-4)}`;
      }
    });
    return masked;
  }
}

export const apiConfig = new ApiConfigManager();
