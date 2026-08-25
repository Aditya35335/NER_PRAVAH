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
        // 1. Districts across India
        this.data.districts = [
            { id: 'east-khasi-hills', name: 'East Khasi Hills, Meghalaya', riskLevel: 'CRITICAL' },
            { id: 'west-jaintia-hills', name: 'West Jaintia Hills, Meghalaya', riskLevel: 'HIGH' },
            { id: 'east-sikkim', name: 'East Sikkim, Sikkim', riskLevel: 'MEDIUM' },
            { id: 'dima-hasao', name: 'Dima Hasao, Assam', riskLevel: 'HIGH' },
            { id: 'papum-pare', name: 'Papum Pare, Arunachal Pradesh', riskLevel: 'MEDIUM' },
            { id: 'shimla', name: 'Shimla, Himachal Pradesh', riskLevel: 'HIGH' },
            { id: 'kullu', name: 'Kullu, Himachal Pradesh', riskLevel: 'HIGH' },
            { id: 'mandi', name: 'Mandi, Himachal Pradesh', riskLevel: 'MEDIUM' },
            { id: 'chamoli', name: 'Chamoli (Joshimath), Uttarakhand', riskLevel: 'CRITICAL' },
            { id: 'rudraprayag', name: 'Rudraprayag (Kedarnath), Uttarakhand', riskLevel: 'HIGH' },
            { id: 'ramban', name: 'Ramban, Jammu & Kashmir', riskLevel: 'HIGH' },
            { id: 'wayanad', name: 'Wayanad, Kerala', riskLevel: 'CRITICAL' },
            { id: 'idukki', name: 'Idukki, Kerala', riskLevel: 'HIGH' },
            { id: 'raigad', name: 'Raigad / Mahabaleshwar, Maharashtra', riskLevel: 'HIGH' },
            { id: 'nilgiris', name: 'Nilgiris, Tamil Nadu', riskLevel: 'MEDIUM' },
            { id: 'kodagu', name: 'Kodagu (Coorg), Karnataka', riskLevel: 'MEDIUM' }
        ];
        // 2. 18 Monitored Real Landslide Sectors
        // 2. 18 Monitored Real Landslide Sectors (Baseline Surveillance)
        this.data.villages = [
            {
                id: 'mawsynram',
                name: 'Mawsynram Village (Meghalaya)',
                districtId: 'east-khasi-hills',
                estimatedPopulation: 1800,
                riskScore: 32,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'mawsynram-relief',
                roadStatus: 'SAFE',
                soilMoisture: 38,
                rainfall: 14,
                slope: 42,
                elevation: 1400,
                latitude: 25.298,
                longitude: 91.582
            },
            {
                id: 'sohra',
                name: 'Sohra / Cherrapunjee (Meghalaya)',
                districtId: 'east-khasi-hills',
                estimatedPopulation: 2200,
                riskScore: 28,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'sohra-school',
                roadStatus: 'SAFE',
                soilMoisture: 35,
                rainfall: 12,
                slope: 38,
                elevation: 1430,
                latitude: 25.270,
                longitude: 91.730
            },
            {
                id: 'jowai',
                name: 'Jowai Hill Sector (Meghalaya)',
                districtId: 'west-jaintia-hills',
                estimatedPopulation: 1650,
                riskScore: 25,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'jowai-complex',
                roadStatus: 'SAFE',
                soilMoisture: 30,
                rainfall: 8,
                slope: 34,
                elevation: 1380,
                latitude: 25.440,
                longitude: 92.200
            },
            {
                id: 'gangtok',
                name: 'Gangtok East Ridge (Sikkim)',
                districtId: 'east-sikkim',
                estimatedPopulation: 3100,
                riskScore: 22,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'gangtok-stadium',
                roadStatus: 'SAFE',
                soilMoisture: 28,
                rainfall: 6,
                slope: 35,
                elevation: 1650,
                latitude: 27.331,
                longitude: 88.613
            },
            {
                id: 'pakyong',
                name: 'Pakyong Corridor (Sikkim)',
                districtId: 'east-sikkim',
                estimatedPopulation: 1200,
                riskScore: 20,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'pakyong-center',
                roadStatus: 'SAFE',
                soilMoisture: 25,
                rainfall: 5,
                slope: 24,
                elevation: 1120,
                latitude: 27.225,
                longitude: 88.588
            },
            {
                id: 'dimahasao',
                name: 'Haflong (Dima Hasao, Assam)',
                districtId: 'dima-hasao',
                estimatedPopulation: 1950,
                riskScore: 30,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'haflong-hall',
                roadStatus: 'SAFE',
                soilMoisture: 36,
                rainfall: 15,
                slope: 41,
                elevation: 960,
                latitude: 25.180,
                longitude: 93.020
            },
            {
                id: 'arunachal',
                name: 'Itanagar Hills (Arunachal Pradesh)',
                districtId: 'papum-pare',
                estimatedPopulation: 2400,
                riskScore: 24,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'itanagar-indoor',
                roadStatus: 'SAFE',
                soilMoisture: 30,
                rainfall: 10,
                slope: 32,
                elevation: 750,
                latitude: 27.084,
                longitude: 93.607
            },
            {
                id: 'shimla',
                name: 'Shimla Ridge & Slopes (Himachal Pradesh)',
                districtId: 'shimla',
                estimatedPopulation: 4500,
                riskScore: 34,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'shimla-indira',
                roadStatus: 'SAFE',
                soilMoisture: 38,
                rainfall: 12,
                slope: 44,
                elevation: 2200,
                latitude: 31.104,
                longitude: 77.173
            },
            {
                id: 'kullu',
                name: 'Manali & Beas Valley (Himachal Pradesh)',
                districtId: 'kullu',
                estimatedPopulation: 2800,
                riskScore: 31,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'manali-club',
                roadStatus: 'SAFE',
                soilMoisture: 36,
                rainfall: 14,
                slope: 48,
                elevation: 2050,
                latitude: 31.957,
                longitude: 77.109
            },
            {
                id: 'mandi',
                name: 'Mandi Valley Escarpment (Himachal Pradesh)',
                districtId: 'mandi',
                estimatedPopulation: 1900,
                riskScore: 26,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'mandi-seri',
                roadStatus: 'SAFE',
                soilMoisture: 32,
                rainfall: 9,
                slope: 36,
                elevation: 1040,
                latitude: 31.708,
                longitude: 76.932
            },
            {
                id: 'joshimath',
                name: 'Joshimath Subsidence Zone (Uttarakhand)',
                districtId: 'chamoli',
                estimatedPopulation: 2100,
                riskScore: 38,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'joshimath-relief',
                roadStatus: 'SAFE',
                soilMoisture: 42,
                rainfall: 16,
                slope: 46,
                elevation: 1890,
                latitude: 30.556,
                longitude: 79.566
            },
            {
                id: 'kedarnath',
                name: 'Rudraprayag / Mandakini (Uttarakhand)',
                districtId: 'rudraprayag',
                estimatedPopulation: 1400,
                riskScore: 33,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'rudraprayag-hall',
                roadStatus: 'SAFE',
                soilMoisture: 39,
                rainfall: 14,
                slope: 52,
                elevation: 1750,
                latitude: 30.735,
                longitude: 79.067
            },
            {
                id: 'ramban',
                name: 'Ramban NH-44 Sector (Jammu & Kashmir)',
                districtId: 'ramban',
                estimatedPopulation: 1700,
                riskScore: 35,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'ramban-camp',
                roadStatus: 'SAFE',
                soilMoisture: 40,
                rainfall: 18,
                slope: 47,
                elevation: 1150,
                latitude: 33.242,
                longitude: 75.241
            },
            {
                id: 'wayanad',
                name: 'Meppadi / Chooralmala (Wayanad, Kerala)',
                districtId: 'wayanad',
                estimatedPopulation: 3400,
                riskScore: 36,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'wayanad-poly',
                roadStatus: 'SAFE',
                soilMoisture: 44,
                rainfall: 20,
                slope: 45,
                elevation: 980,
                latitude: 11.550,
                longitude: 76.130
            },
            {
                id: 'idukki',
                name: 'Munnar & High Ranges (Idukki, Kerala)',
                districtId: 'idukki',
                estimatedPopulation: 2600,
                riskScore: 29,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'munnar-tea-hall',
                roadStatus: 'SAFE',
                soilMoisture: 38,
                rainfall: 16,
                slope: 43,
                elevation: 1530,
                latitude: 10.088,
                longitude: 77.059
            },
            {
                id: 'raigad',
                name: 'Mahabaleshwar & Ghats (Maharashtra)',
                districtId: 'raigad',
                estimatedPopulation: 2100,
                riskScore: 27,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'mahabaleshwar-camp',
                roadStatus: 'SAFE',
                soilMoisture: 33,
                rainfall: 11,
                slope: 39,
                elevation: 1350,
                latitude: 17.923,
                longitude: 73.658
            },
            {
                id: 'nilgiris',
                name: 'Ooty & Nilgiris Slopes (Tamil Nadu)',
                districtId: 'nilgiris',
                estimatedPopulation: 2900,
                riskScore: 23,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'ooty-hadfield',
                roadStatus: 'SAFE',
                soilMoisture: 29,
                rainfall: 8,
                slope: 37,
                elevation: 2240,
                latitude: 11.410,
                longitude: 76.703
            },
            {
                id: 'coorg',
                name: 'Madikeri / Coorg (Karnataka)',
                districtId: 'kodagu',
                estimatedPopulation: 2200,
                riskScore: 21,
                riskLevel: 'LOW',
                evacuationStatus: 'NOT_STARTED',
                shelterId: 'madikeri-stadium',
                roadStatus: 'SAFE',
                soilMoisture: 26,
                rainfall: 7,
                slope: 33,
                elevation: 1150,
                latitude: 12.421,
                longitude: 75.740
            }
        ];
        // 3. Real District Relief Shelters
        this.data.shelters = [
            {
                id: 'mawsynram-relief',
                name: 'Mawsynram Block Relief Complex',
                location: 'Bazar Area, Mawsynram',
                capacity: 1200,
                occupied: 780,
                status: 'OPEN',
                latitude: 25.305,
                longitude: 91.590,
                facilities: ['Emergency Medical Wing', 'High-Capacity Generators', 'Water Purifier Station', 'Helipad Access']
            },
            {
                id: 'sohra-school',
                name: 'Sohra Government Higher Secondary Camp',
                location: 'Sohra Market Road',
                capacity: 1000,
                occupied: 620,
                status: 'OPEN',
                latitude: 25.280,
                longitude: 91.738,
                facilities: ['Drinking Water', 'Medical Station', 'Food Supplies']
            },
            {
                id: 'jowai-complex',
                name: 'Jowai District Sports Complex Shelter',
                location: 'Ladthalaboh, Jowai',
                capacity: 1400,
                occupied: 450,
                status: 'OPEN',
                latitude: 25.450,
                longitude: 92.210,
                facilities: ['Indoor Beds', 'First Aid', 'Backup Power']
            },
            {
                id: 'gangtok-stadium',
                name: 'Paljor Stadium Relief Shelter',
                location: 'Gangtok Central',
                capacity: 2500,
                occupied: 890,
                status: 'OPEN',
                latitude: 27.338,
                longitude: 88.618,
                facilities: ['Large Indoor Hall', 'Hospital Link', 'Food Storage']
            },
            {
                id: 'pakyong-center',
                name: 'Pakyong Community Center',
                location: 'Near Pakyong Airport Road',
                capacity: 800,
                occupied: 180,
                status: 'OPEN',
                latitude: 27.230,
                longitude: 88.590,
                facilities: ['Basic Medical Aid', 'Potable Water']
            },
            {
                id: 'haflong-hall',
                name: 'Haflong Town Hall Disaster Camp',
                location: 'Haflong Lake Road',
                capacity: 1100,
                occupied: 710,
                status: 'OPEN',
                latitude: 25.188,
                longitude: 93.028,
                facilities: ['Shelter Beds', 'Hot Kitchen', 'Wireless Sat-Link']
            },
            {
                id: 'itanagar-indoor',
                name: 'Itanagar Indoor Stadium Relief Base',
                location: 'Chimpu, Itanagar',
                capacity: 1800,
                occupied: 420,
                status: 'OPEN',
                latitude: 27.090,
                longitude: 93.615,
                facilities: ['Emergency Medical Team', 'Power Generator', 'Water Tankers']
            },
            {
                id: 'shimla-indira',
                name: 'Indira Gandhi Sports Complex Camp',
                location: 'The Mall, Shimla',
                capacity: 2000,
                occupied: 1150,
                status: 'OPEN',
                latitude: 31.110,
                longitude: 77.180,
                facilities: ['Heated Halls', 'Medical Unit', 'SDRF Base']
            },
            {
                id: 'manali-club',
                name: 'Manali Disaster Response Base',
                location: 'Aleo, Manali',
                capacity: 1500,
                occupied: 980,
                status: 'OPEN',
                latitude: 31.965,
                longitude: 77.118,
                facilities: ['NDRF Team on Site', 'Ambulance Unit', 'Satellite Comms']
            },
            {
                id: 'mandi-seri',
                name: 'Seri Manch Community Relief Camp',
                location: 'Mandi Town Center',
                capacity: 1200,
                occupied: 540,
                status: 'OPEN',
                latitude: 31.715,
                longitude: 76.940,
                facilities: ['Clean Water', 'First Aid Center']
            },
            {
                id: 'joshimath-relief',
                name: 'Joshimath High Altitude Safe Zone Camp',
                location: 'Auli Road Safe Ridge',
                capacity: 1600,
                occupied: 1320,
                status: 'NEAR_CAPACITY',
                latitude: 30.565,
                longitude: 79.575,
                facilities: ['Geotechnical Field Lab', 'Army Medical Team', 'Emergency Food Drops']
            },
            {
                id: 'rudraprayag-hall',
                name: 'Rudraprayag Government Relief Center',
                location: 'Badrinath Highway Safe Node',
                capacity: 1300,
                occupied: 890,
                status: 'OPEN',
                latitude: 30.742,
                longitude: 79.075,
                facilities: ['Helipad Rescue Station', 'Hospital Link']
            },
            {
                id: 'ramban-camp',
                name: 'Ramban District Administration Camp',
                location: 'Maitra, Ramban',
                capacity: 1400,
                occupied: 950,
                status: 'OPEN',
                latitude: 33.250,
                longitude: 75.250,
                facilities: ['Highway Rescue Vehicles', 'Medical Ward']
            },
            {
                id: 'wayanad-poly',
                name: 'Meppadi Polytechnic Emergency Camp',
                location: 'Meppadi High Grounds',
                capacity: 2200,
                occupied: 1850,
                status: 'NEAR_CAPACITY',
                latitude: 11.558,
                longitude: 76.138,
                facilities: ['Indian Army Medical Base', 'Search Dog Squad Base', 'Community Kitchen']
            },
            {
                id: 'munnar-tea-hall',
                name: 'Munnar Community Welfare Camp',
                location: 'Old Munnar Safe Ridge',
                capacity: 1500,
                occupied: 920,
                status: 'OPEN',
                latitude: 10.095,
                longitude: 77.068,
                facilities: ['Medical Aid', 'Food Supplies', 'Power Generator']
            },
            {
                id: 'mahabaleshwar-camp',
                name: 'Mahabaleshwar Municipal Relief Hall',
                location: 'Panchgani Road',
                capacity: 1300,
                occupied: 610,
                status: 'OPEN',
                latitude: 17.930,
                longitude: 73.668,
                facilities: ['Shelter Beds', 'First Aid', 'Water Tanker']
            },
            {
                id: 'ooty-hadfield',
                name: 'Ooty Hadfield Community Camp',
                location: 'Charring Cross, Ooty',
                capacity: 1700,
                occupied: 580,
                status: 'OPEN',
                latitude: 11.418,
                longitude: 76.712,
                facilities: ['Warm Blankets', 'Hot Kitchen', 'Doctor on Call']
            },
            {
                id: 'madikeri-stadium',
                name: 'General Thimmaiah Stadium Relief Camp',
                location: 'Madikeri, Kodagu',
                capacity: 1600,
                occupied: 490,
                status: 'OPEN',
                latitude: 12.428,
                longitude: 75.748,
                facilities: ['Drinking Water', 'Bedding', 'Telecom Post']
            }
        ];
        // 4. Real National & State Highway Corridors
        this.data.roads = [
            {
                id: 'nh-106-mawsynram',
                name: 'NH-106 (Mawsynram - Shillong Highway)',
                status: 'WARNING',
                riskLevel: 'HIGH',
                blockageReason: 'Slumping debris at km 28; single lane passable',
                latStart: 25.298,
                lngStart: 91.582,
                latEnd: 25.305,
                lngEnd: 91.590
            },
            {
                id: 'sohra-shella',
                name: 'Sohra - Shella Mountain Corridor',
                status: 'WARNING',
                riskLevel: 'MEDIUM',
                blockageReason: 'Gravel slippage, cautionary slow driving',
                latStart: 25.270,
                lngStart: 91.730,
                latEnd: 25.280,
                lngEnd: 91.738
            },
            {
                id: 'nh-10-sikkim',
                name: 'NH-10 (Siliguri - Gangtok Lifeline)',
                status: 'SAFE',
                riskLevel: 'LOW',
                latStart: 27.225,
                lngStart: 88.588,
                latEnd: 27.331,
                lngEnd: 88.613
            },
            {
                id: 'nh-27-dimahasao',
                name: 'NH-27 (Lumding - Haflong Pass)',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Major track slump and mud avalanche across both lanes',
                latStart: 25.180,
                lngStart: 93.020,
                latEnd: 25.188,
                lngEnd: 93.028
            },
            {
                id: 'nh-5-shimla',
                name: 'NH-5 (Hindustan - Tibet Road)',
                status: 'WARNING',
                riskLevel: 'HIGH',
                blockageReason: 'Rockfall hazard active near Taradevi',
                latStart: 31.104,
                lngStart: 77.173,
                latEnd: 31.110,
                lngEnd: 77.180
            },
            {
                id: 'nh-3-manali',
                name: 'NH-3 (Chandigarh - Manali Highway)',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Beas River flash surge inundated lower roadbed',
                latStart: 31.957,
                lngStart: 77.109,
                latEnd: 31.965,
                lngEnd: 77.118
            },
            {
                id: 'nh-58-joshimath',
                name: 'NH-58 (Rishikesh - Badrinath Corridor)',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Crown subsidence and road fissuring near Helang',
                latStart: 30.556,
                lngStart: 79.566,
                latEnd: 30.565,
                lngEnd: 79.575
            },
            {
                id: 'nh-44-ramban',
                name: 'NH-44 (Jammu - Srinagar Highway Ramban Sector)',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Shooting stones & landslide debris at Mehar & Cafeteria Morh',
                latStart: 33.242,
                lngStart: 75.241,
                latEnd: 33.250,
                lngEnd: 75.250
            },
            {
                id: 'sh-59-wayanad',
                name: 'SH-59 (Meppadi - Chooralmala Route)',
                status: 'BLOCKED',
                riskLevel: 'CRITICAL',
                blockageReason: 'Vellarmala bridge washed away; Bailey bridge under construction',
                latStart: 11.550,
                lngStart: 76.130,
                latEnd: 11.558,
                lngEnd: 76.138
            },
            {
                id: 'nh-85-munnar',
                name: 'NH-85 (Kochi - Dhanushkodi Gap Road)',
                status: 'WARNING',
                riskLevel: 'HIGH',
                blockageReason: 'Soil displacement on upper cut slope',
                latStart: 10.088,
                lngStart: 77.059,
                latEnd: 10.095,
                lngEnd: 77.068
            },
            {
                id: 'nh-181-ooty',
                name: 'NH-181 (Coimbatore - Ooty Nilgiri Ghat)',
                status: 'SAFE',
                riskLevel: 'LOW',
                latStart: 11.410,
                lngStart: 76.703,
                latEnd: 11.418,
                lngEnd: 76.712
            },
            {
                id: 'nh-275-coorg',
                name: 'NH-275 (Mangalore - Madikeri Highway)',
                status: 'SAFE',
                riskLevel: 'LOW',
                latStart: 12.421,
                lngStart: 75.740,
                latEnd: 12.428,
                lngEnd: 75.748
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
