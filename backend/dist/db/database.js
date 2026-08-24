"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, '../../data');
class JsonDB {
    data = {
        users: [],
        districts: [],
        villages: [],
        shelters: [],
        roads: [],
        alerts: [],
        households: [],
        fieldReports: [],
        incidents: [],
        dataSources: []
    };
    constructor() {
        this.init();
    }
    init() {
        if (!fs_1.default.existsSync(DATA_DIR)) {
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        }
        const dbPath = path_1.default.join(DATA_DIR, 'db.json');
        if (fs_1.default.existsSync(dbPath)) {
            try {
                const fileContent = fs_1.default.readFileSync(dbPath, 'utf-8');
                this.data = JSON.parse(fileContent);
                console.log('[JsonDB] Database loaded successfully from file.');
                // Ensure all collections are arrays
                this.data.users = this.data.users || [];
                this.data.districts = this.data.districts || [];
                this.data.villages = this.data.villages || [];
                this.data.shelters = this.data.shelters || [];
                this.data.roads = this.data.roads || [];
                this.data.alerts = this.data.alerts || [];
                this.data.households = this.data.households || [];
                this.data.fieldReports = this.data.fieldReports || [];
                this.data.incidents = this.data.incidents || [];
                this.data.dataSources = this.data.dataSources || [];
            }
            catch (err) {
                console.error('[JsonDB] Database file corrupt, reseeding...', err);
                this.seed();
            }
        }
        else {
            this.seed();
        }
    }
    save() {
        const dbPath = path_1.default.join(DATA_DIR, 'db.json');
        fs_1.default.writeFileSync(dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    }
    seed() {
        console.log('[JsonDB] Seeding database with initial hackathon data...');
        // 1. Districts
        this.data.districts = [
            { id: 'east-sikkim', name: 'East Sikkim', riskLevel: 'MEDIUM' },
            { id: 'east-khasi-hills', name: 'East Khasi Hills', riskLevel: 'HIGH' },
            { id: 'lunglei', name: 'Lunglei (Mizoram)', riskLevel: 'MEDIUM' }
        ];
        // 2. Villages
        this.data.villages = [
            {
                id: 'sohra',
                name: 'Sohra (Cherrapunjee)',
                districtId: 'east-khasi-hills',
                estimatedPopulation: 2200,
                riskScore: 78,
                riskLevel: 'HIGH',
                evacuationStatus: 'IN_PROGRESS',
                shelterId: 'sohra-school',
                roadStatus: 'WARNING',
                soilMoisture: 72,
                rainfall: 95,
                slope: 38,
                elevation: 1430,
                latitude: 25.270,
                longitude: 91.730
            },
            {
                id: 'mawsynram',
                name: 'Mawsynram Village',
                districtId: 'east-khasi-hills',
                estimatedPopulation: 1800,
                riskScore: 92,
                riskLevel: 'CRITICAL',
                evacuationStatus: 'IN_PROGRESS',
                shelterId: 'mawsynram-relief',
                roadStatus: 'WARNING',
                soilMoisture: 88,
                rainfall: 145,
                slope: 42,
                elevation: 1400,
                latitude: 25.298,
                longitude: 91.582
            },
            {
                id: 'pakyong',
                name: 'Pakyong Foothills',
                districtId: 'east-sikkim',
                estimatedPopulation: 1200,
                riskScore: 32,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'pakyong-center',
                roadStatus: 'SAFE',
                soilMoisture: 42,
                rainfall: 25,
                slope: 24,
                elevation: 1120,
                latitude: 27.225,
                longitude: 88.588
            },
            {
                id: 'rongli',
                name: 'Rongli Valley',
                districtId: 'east-sikkim',
                estimatedPopulation: 850,
                riskScore: 54,
                riskLevel: 'MEDIUM',
                evacuationStatus: 'PREPARING',
                shelterId: 'pakyong-center',
                roadStatus: 'SAFE',
                soilMoisture: 58,
                rainfall: 52,
                slope: 31,
                elevation: 980,
                latitude: 27.202,
                longitude: 88.701
            },
            {
                id: 'theiriat',
                name: 'Theiriat Slopes',
                districtId: 'lunglei',
                estimatedPopulation: 620,
                riskScore: 82,
                riskLevel: 'HIGH',
                evacuationStatus: 'IN_PROGRESS',
                shelterId: 'lunglei-hall',
                roadStatus: 'BLOCKED',
                soilMoisture: 80,
                rainfall: 110,
                slope: 45,
                elevation: 1220,
                latitude: 22.880,
                longitude: 92.760
            }
        ];
        // 3. Shelters
        this.data.shelters = [
            {
                id: 'sohra-school',
                name: 'Sohra Government High School',
                location: 'Sohra Sector 2',
                capacity: 800,
                occupied: 520,
                status: 'OPEN',
                latitude: 25.275,
                longitude: 91.725,
                facilities: ['Medical Station', 'Drinking Water', 'Food Pantry', 'Generator Backup']
            },
            {
                id: 'mawsynram-relief',
                name: 'Mawsynram Sports Complex Relief Camp',
                location: 'Main Bazar Area, Mawsynram',
                capacity: 1000,
                occupied: 850,
                status: 'NEAR_CAPACITY',
                latitude: 25.295,
                longitude: 91.585,
                facilities: ['First Aid Wing', 'Separate Sanitation Rooms', 'Wireless Sat-Link']
            },
            {
                id: 'pakyong-center',
                name: 'Pakyong Community Hall',
                location: 'Near Pakyong Airport Road',
                capacity: 500,
                occupied: 120,
                status: 'OPEN',
                latitude: 27.230,
                longitude: 88.590,
                facilities: ['Basic Medical Aid', 'Potable Water']
            },
            {
                id: 'lunglei-hall',
                name: 'Lunglei District Town Hall',
                location: 'Lunglei Heights',
                capacity: 600,
                occupied: 480,
                status: 'OPEN',
                latitude: 22.883,
                longitude: 92.765,
                facilities: ['Hot Meals', 'Emergency Power Supply', 'Telecom Link']
            }
        ];
        // 4. Roads
        this.data.roads = [
            {
                id: 'nh-10',
                name: 'NH-10 Highway Corridor',
                status: 'SAFE',
                riskLevel: 'LOW',
                latStart: 27.210,
                lngStart: 88.580,
                latEnd: 27.235,
                lngEnd: 88.600
            },
            {
                id: 'sohra-shella',
                name: 'Sohra-Shella Access Route',
                status: 'WARNING',
                riskLevel: 'MEDIUM',
                blockageReason: 'Small gravel slippage, driving slow recommended',
                latStart: 25.260,
                lngStart: 91.720,
                latEnd: 25.280,
                lngEnd: 91.740
            },
            {
                id: 'mawsynram-shillong',
                name: 'Mawsynram-Shillong Highway',
                status: 'WARNING',
                riskLevel: 'HIGH',
                blockageReason: 'Mud slurry on curves near bypass',
                latStart: 25.290,
                lngStart: 91.570,
                latEnd: 25.310,
                lngEnd: 91.600
            },
            {
                id: 'lunglei-tlabung',
                name: 'Lunglei-Tlabung Road segment B',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Major rockfall at Milestone 24. Clearing in progress.',
                latStart: 22.870,
                lngStart: 92.750,
                latEnd: 22.890,
                lngEnd: 92.770,
                altRouteId: 'lunglei-hall'
            }
        ];
        // 5. Alerts
        this.data.alerts = [
            {
                id: 'alert-1',
                severity: 'CRITICAL',
                title: 'Immediate Landslide Evacuation Required',
                message: 'Extreme rain (145mm) and 88% soil moisture detected on 42° slope.',
                status: 'IN_RESPONSE',
                timestamp: new Date().toISOString(),
                villageId: 'mawsynram',
                riskScore: 92,
                reason: 'Extreme rainfall + Saturated soil + Steep slope'
            },
            {
                id: 'alert-2',
                severity: 'HIGH',
                title: 'Landslide Warning Level Orange',
                message: 'Elevated precipitation (95mm) in Sohra region. Keep preparedness alert active.',
                status: 'NEW',
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                villageId: 'sohra',
                riskScore: 78,
                reason: 'Heavy rainfall + soil moisture saturation trend'
            }
        ];
        // 6. Users
        // In a real application, passwords would be properly hashed. This is plain for easy login on hackathon.
        this.data.users = [
            {
                id: 'user-admin',
                name: 'Super Administrator',
                username: 'admin',
                passwordHash: 'admin',
                role: 'SUPER_ADMIN'
            },
            {
                id: 'user-district',
                name: 'Shri K. Sangma (DC Khasi Hills)',
                username: 'authority',
                passwordHash: 'authority',
                role: 'DISTRICT_AUTHORITY',
                districtId: 'east-khasi-hills'
            },
            {
                id: 'user-officer',
                name: 'Amit Sharma (Disaster Officer)',
                username: 'officer',
                passwordHash: 'officer',
                role: 'DISASTER_OFFICER'
            },
            {
                id: 'user-volunteer',
                name: 'Lalrinkima (Field Volunteer)',
                username: 'volunteer',
                passwordHash: 'volunteer',
                role: 'FIELD_VOLUNTEER',
                villageId: 'mawsynram'
            },
            {
                id: 'user-village',
                name: 'Jadonang (Sohra Community Representative)',
                username: 'village',
                passwordHash: 'village',
                role: 'VILLAGE_USER',
                villageId: 'sohra'
            }
        ];
        // 7. Households (For detailed village accountability tracking)
        this.data.households = [
            // Mawsynram (1800 population ~ 360 households)
            { id: 'hh-maw-101', villageId: 'mawsynram', familyHead: 'Thrangbor Rynjah', size: 5, status: 'EVACUATED', lastUpdated: new Date().toISOString() },
            { id: 'hh-maw-102', villageId: 'mawsynram', familyHead: 'Phibarisha Syiem', size: 4, status: 'EVACUATED', lastUpdated: new Date().toISOString() },
            { id: 'hh-maw-103', villageId: 'mawsynram', familyHead: 'Banteilang Kurkalang', size: 6, status: 'NOT_EVACUATED', lastUpdated: new Date().toISOString() },
            { id: 'hh-maw-104', villageId: 'mawsynram', familyHead: 'Kynsaibor Lartang', size: 5, status: 'UNKNOWN', lastUpdated: new Date().toISOString() },
            { id: 'hh-maw-105', villageId: 'mawsynram', familyHead: 'Rimika Marbaniang', size: 3, status: 'EVACUATED', lastUpdated: new Date().toISOString() },
            // Sohra (2200 population ~ 440 households)
            { id: 'hh-soh-201', villageId: 'sohra', familyHead: 'Dondor Khongwir', size: 5, status: 'EVACUATED', lastUpdated: new Date().toISOString() },
            { id: 'hh-soh-202', villageId: 'sohra', familyHead: 'Clarissa Lyngdoh', size: 4, status: 'NOT_EVACUATED', lastUpdated: new Date().toISOString() },
            { id: 'hh-soh-203', villageId: 'sohra', familyHead: 'Wansuk Mukhim', size: 5, status: 'EVACUATED', lastUpdated: new Date().toISOString() }
        ];
        // 8. Field Reports
        this.data.fieldReports = [
            {
                id: 'rep-1',
                villageId: 'mawsynram',
                reporterName: 'Lalrinkima (Field Volunteer)',
                type: 'SLOPE_MOVEMENT',
                description: 'Tension cracks appearing along the main approach slope of sector 3, approximately 5cm wide.',
                latitude: 25.299,
                longitude: 91.583,
                timestamp: new Date(Date.now() - 120 * 60000).toISOString()
            },
            {
                id: 'rep-2',
                villageId: 'theiriat',
                reporterName: 'Laltlanhlua (Lunglei Patrol)',
                type: 'ROAD_BLOCKAGE',
                description: 'Heavy boulders rolled onto Lunglei-Tlabung Road, completely blocking vehicular movement.',
                latitude: 22.871,
                longitude: 92.752,
                timestamp: new Date(Date.now() - 180 * 60000).toISOString()
            }
        ];
        // 9. Incidents
        this.data.incidents = [
            {
                id: 'inc-1',
                type: 'Minor Landslide',
                severity: 'MEDIUM',
                description: 'Mudslide on the outskirts of Theiriat slopes, no casualties reported.',
                status: 'VERIFIED',
                latitude: 22.878,
                longitude: 92.758,
                timestamp: new Date(Date.now() - 360 * 60000).toISOString()
            }
        ];
        // 10. DataSources / Integrations status list
        this.data.dataSources = [
            { id: 'weather-api', name: 'IMD Meteorological API', type: 'WEATHER', status: 'DEMO_MODE', lastUpdated: new Date().toISOString(), freshness: '15 mins ago', mode: 'DEMO', provider: 'DemoWeatherProvider' },
            { id: 'satellite-api', name: 'Bhuvan Satellite Radar Imagery', type: 'SATELLITE', status: 'DEMO_MODE', lastUpdated: new Date().toISOString(), freshness: '3 hours ago', mode: 'DEMO', provider: 'DemoSatelliteProvider' },
            { id: 'terrain-api', name: 'ISRO DEM Terrain Profile Service', type: 'TERRAIN', status: 'DEMO_MODE', lastUpdated: new Date().toISOString(), freshness: 'Static Cached', mode: 'DEMO', provider: 'DemoTerrainProvider' },
            { id: 'sensor-gateway', name: 'NEIST Soil moisture & Tilt Gateway', type: 'SENSOR', status: 'DEMO_MODE', lastUpdated: new Date().toISOString(), freshness: 'Realtime (5s)', mode: 'DEMO', provider: 'DemoSensorProvider' },
            { id: 'ml-model', name: 'PRAHARI Landslide Risk Prediction Engine', type: 'ML', status: 'DEMO_MODE', lastUpdated: new Date().toISOString(), freshness: 'Realtime on-demand', mode: 'DEMO', provider: 'DemoRiskPredictionProvider' },
            { id: 'sms-gateway', name: 'National Alert NIC Gateway (SMS)', type: 'SMS', status: 'DISCONNECTED', lastUpdated: 'Never', freshness: 'Offline', mode: 'DEMO', provider: 'DemoNotificationProvider' }
        ];
        this.save();
    }
    // Getters
    getUsers() { return this.data.users; }
    getDistricts() { return this.data.districts; }
    getVillages() { return this.data.villages; }
    getShelters() { return this.data.shelters; }
    getRoads() { return this.data.roads; }
    getAlerts() { return this.data.alerts; }
    getHouseholds() { return this.data.households; }
    getFieldReports() { return this.data.fieldReports; }
    getIncidents() { return this.data.incidents; }
    getDataSources() { return this.data.dataSources; }
    // Updaters
    updateVillage(id, updates) {
        const idx = this.data.villages.findIndex(v => v.id === id);
        if (idx === -1)
            return null;
        this.data.villages[idx] = { ...this.data.villages[idx], ...updates };
        this.save();
        return this.data.villages[idx];
    }
    updateShelter(id, updates) {
        const idx = this.data.shelters.findIndex(s => s.id === id);
        if (idx === -1)
            return null;
        this.data.shelters[idx] = { ...this.data.shelters[idx], ...updates };
        this.save();
        return this.data.shelters[idx];
    }
    updateRoad(id, updates) {
        const idx = this.data.roads.findIndex(r => r.id === id);
        if (idx === -1)
            return null;
        this.data.roads[idx] = { ...this.data.roads[idx], ...updates };
        this.save();
        return this.data.roads[idx];
    }
    updateAlert(id, updates) {
        const idx = this.data.alerts.findIndex(a => a.id === id);
        if (idx === -1)
            return null;
        this.data.alerts[idx] = { ...this.data.alerts[idx], ...updates };
        this.save();
        return this.data.alerts[idx];
    }
    addAlert(alert) {
        const newAlert = {
            ...alert,
            id: `alert-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        this.data.alerts.unshift(newAlert);
        this.save();
        return newAlert;
    }
    updateHousehold(id, updates) {
        const idx = this.data.households.findIndex(hh => hh.id === id);
        if (idx === -1)
            return null;
        this.data.households[idx] = { ...this.data.households[idx], ...updates, lastUpdated: new Date().toISOString() };
        this.save();
        return this.data.households[idx];
    }
    addHousehold(hh) {
        const newHh = {
            ...hh,
            id: `hh-${Date.now()}`,
            lastUpdated: new Date().toISOString()
        };
        this.data.households.push(newHh);
        this.save();
        return newHh;
    }
    addFieldReport(rep) {
        const newRep = {
            ...rep,
            id: `rep-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        this.data.fieldReports.unshift(newRep);
        this.save();
        return newRep;
    }
    addIncident(inc) {
        const newInc = {
            ...inc,
            id: `inc-${Date.now()}`,
            timestamp: new Date().toISOString()
        };
        this.data.incidents.unshift(newInc);
        this.save();
        return newInc;
    }
    updateDataSource(id, updates) {
        const idx = this.data.dataSources.findIndex(ds => ds.id === id);
        if (idx === -1)
            return null;
        this.data.dataSources[idx] = { ...this.data.dataSources[idx], ...updates, lastUpdated: new Date().toISOString() };
        this.save();
        return this.data.dataSources[idx];
    }
}
exports.db = new JsonDB();
exports.default = exports.db;
