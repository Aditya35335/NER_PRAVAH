"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const CONFIG_PATH = path_1.default.join(__dirname, '../../config_override.json');
class ApiConfigManager {
    keys = {
        IMD_API_KEY: process.env.IMD_API_KEY || '',
        WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
        SATELLITE_API_KEY: process.env.SATELLITE_API_KEY || '',
        BHUVAN_API_KEY: process.env.BHUVAN_API_KEY || '',
        MAP_API_KEY: process.env.MAP_API_KEY || '',
        ROUTING_API_KEY: process.env.ROUTING_API_KEY || '',
        SMS_API_KEY: process.env.SMS_API_KEY || '',
        FIREBASE_CONFIG: process.env.FIREBASE_CONFIG || '',
        ML_API_URL: process.env.ML_API_URL || '',
    };
    demoMode = true;
    constructor() {
        this.loadOverrides();
    }
    loadOverrides() {
        try {
            if (fs_1.default.existsSync(CONFIG_PATH)) {
                const fileContent = fs_1.default.readFileSync(CONFIG_PATH, 'utf-8');
                const overrides = JSON.parse(fileContent);
                this.keys = { ...this.keys, ...overrides };
                console.log('[ApiConfig] Loaded configuration overrides from file.');
            }
        }
        catch (error) {
            console.error('[ApiConfig] Failed to load configuration overrides:', error);
        }
    }
    saveOverrides(newKeys) {
        try {
            this.keys = { ...this.keys, ...newKeys };
            fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(this.keys, null, 2), 'utf-8');
            console.log('[ApiConfig] Saved configuration overrides to file.');
        }
        catch (error) {
            console.error('[ApiConfig] Failed to save configuration overrides:', error);
        }
    }
    getKeys() {
        return { ...this.keys };
    }
    getKey(name) {
        return this.keys[name];
    }
    isDemoMode() {
        return this.demoMode;
    }
    setDemoMode(mode) {
        this.demoMode = mode;
    }
    getMaskedKeys() {
        const masked = {};
        Object.keys(this.keys).forEach((key) => {
            const val = this.keys[key];
            if (!val) {
                masked[key] = '';
            }
            else if (key === 'ML_API_URL') {
                masked[key] = val; // URL is fine to show
            }
            else if (val.length <= 8) {
                masked[key] = '••••' + val.slice(-2);
            }
            else {
                masked[key] = `${val.slice(0, 4)}_••••••••••${val.slice(-4)}`;
            }
        });
        return masked;
    }
}
exports.apiConfig = new ApiConfigManager();
