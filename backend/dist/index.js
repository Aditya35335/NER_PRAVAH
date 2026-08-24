"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./db/database");
const apiConfig_1 = require("./config/apiConfig");
const providers_1 = require("./services/dataProviders/providers");
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ── WebSocket Server ────────────────────────────────────────────────────────
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ noServer: true });
const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: 'SYSTEM_STATUS', data: { timestamp: new Date().toISOString() } }));
    ws.on('close', () => clients.delete(ws));
});
server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
function broadcast(type, data) {
    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    clients.forEach(c => { if (c.readyState === ws_1.WebSocket.OPEN)
        c.send(payload); });
}
// ═══════════════════════════════════════════════════════════════════════════
// LIVE DATA ENRICHMENT
// On startup AND every 15 minutes: fetch real Open-Meteo 24h rainfall +
// volumetric soil moisture + OWM fallback for every village coordinate,
// overwrite the static seeded values, raise alerts if thresholds breached.
// ═══════════════════════════════════════════════════════════════════════════
async function enrichAllVillagesWithLiveWeather() {
    console.log('[LiveEnrich] ── Fetching real weather for all villages ──');
    const villages = database_1.db.getVillages();
    for (const v of villages) {
        try {
            const pred = await providers_1.providers.getAIPredictor()
                .predictLandslideRisk(v.latitude, v.longitude, v.name);
            // Overwrite the seeded static values with real live API data
            database_1.db.updateVillage(v.id, {
                rainfall: pred.metrics.rainfall24h,
                soilMoisture: pred.metrics.soilMoisture,
                riskScore: pred.riskScore,
                riskLevel: pred.riskLevel,
            });
            console.log(`  [${v.name}] rain=${pred.metrics.rainfall24h}mm ` +
                `soil=${pred.metrics.soilMoisture}% FS=${pred.fsParameters.FS} ` +
                `→ ${pred.riskScore}% (${pred.riskLevel})`);
            // Auto-raise alert if HIGH/CRITICAL and no recent alert exists
            if (pred.riskScore >= 65) {
                const recentAlert = database_1.db.getAlerts().find(a => a.villageId === v.id &&
                    (a.severity === 'CRITICAL' || a.severity === 'HIGH') &&
                    Date.now() - new Date(a.timestamp).getTime() < 30 * 60 * 1000);
                if (!recentAlert) {
                    const alert = database_1.db.addAlert({
                        severity: pred.riskScore >= 85 ? 'CRITICAL' : 'HIGH',
                        title: `${pred.riskLevel} Risk — ${v.name}`,
                        message: pred.triggerReason,
                        status: 'NEW',
                        villageId: v.id,
                        riskScore: pred.riskScore,
                        reason: pred.triggerReason
                    });
                    broadcast('ALERT_CREATED', alert);
                    console.log(`  ⚠ Auto-raised ${alert.severity} alert for ${v.name}`);
                }
            }
            broadcast('VILLAGE_UPDATED', database_1.db.getVillages().find(x => x.id === v.id));
            // 800ms gap between villages to stay within free-tier API rate limits
            await new Promise(r => setTimeout(r, 800));
        }
        catch (err) {
            console.warn(`  [LiveEnrich] Failed for ${v.name}:`, err);
        }
    }
    console.log('[LiveEnrich] ✓ Done — all villages updated with live weather data');
}
// Run immediately on server startup
enrichAllVillagesWithLiveWeather().catch(console.error);
// Re-run every 15 minutes
setInterval(() => enrichAllVillagesWithLiveWeather().catch(console.error), 15 * 60 * 1000);
// ═══════════════════════════════════════════════════════════════════════════
// 30-SECOND THRESHOLD MONITOR
// Only re-checks HIGH/CRITICAL villages to avoid hammering the API.
// If a village just crossed 85% it generates an immediate critical alert.
// ═══════════════════════════════════════════════════════════════════════════
setInterval(async () => {
    try {
        for (const v of database_1.db.getVillages()) {
            if (v.riskLevel !== 'HIGH' && v.riskLevel !== 'CRITICAL')
                continue;
            const pred = await providers_1.providers.getAIPredictor()
                .predictLandslideRisk(v.latitude, v.longitude, v.name);
            database_1.db.updateVillage(v.id, {
                riskScore: pred.riskScore,
                riskLevel: pred.riskLevel,
                rainfall: pred.metrics.rainfall24h,
                soilMoisture: pred.metrics.soilMoisture
            });
            if (pred.riskScore >= 85 && v.riskScore < 85) {
                const alert = database_1.db.addAlert({
                    severity: 'CRITICAL',
                    title: `⚠ Threshold Breached — ${v.name}`,
                    message: `Rain ${pred.metrics.rainfall24h}mm · Soil ${pred.metrics.soilMoisture}% · FS=${pred.fsParameters.FS}`,
                    status: 'NEW',
                    villageId: v.id,
                    riskScore: pred.riskScore,
                    reason: pred.triggerReason
                });
                broadcast('ALERT_CREATED', alert);
                broadcast('VILLAGE_UPDATED', database_1.db.getVillages().find(x => x.id === v.id));
            }
            await new Promise(r => setTimeout(r, 500));
        }
    }
    catch (err) {
        console.warn('[ThresholdMonitor]', err);
    }
}, 30_000);
// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// 1. Live weather for any coordinate
app.get('/api/weather', async (req, res) => {
    const lat = parseFloat(req.query.lat) || 25.298;
    const lng = parseFloat(req.query.lng) || 91.582;
    res.json(await providers_1.providers.getWeatherProvider().getWeather(lat, lng));
});
// 2. Single-coordinate AI prediction
app.get('/api/predict', async (req, res) => {
    const lat = parseFloat(req.query.lat) || 25.298;
    const lng = parseFloat(req.query.lng) || 91.582;
    const name = req.query.name || 'Searched Coordinate';
    res.json(await providers_1.providers.getAIPredictor().predictLandslideRisk(lat, lng, name));
});
// 3. Pan-India parallel scan (18 sectors simultaneously)
const INDIA_SECTORS = [
    { id: 'mawsynram', name: 'Mawsynram, Meghalaya', lat: 25.298, lng: 91.582 },
    { id: 'sohra', name: 'Sohra (Cherrapunjee), Meghalaya', lat: 25.270, lng: 91.730 },
    { id: 'jowai', name: 'Jowai, West Jaintia Hills', lat: 25.440, lng: 92.200 },
    { id: 'gangtok', name: 'Gangtok, Sikkim', lat: 27.331, lng: 88.613 },
    { id: 'pakyong', name: 'Pakyong, East Sikkim', lat: 27.240, lng: 88.580 },
    { id: 'dimahasao', name: 'Dima Hasao, Assam', lat: 25.180, lng: 93.020 },
    { id: 'arunachal', name: 'Itanagar, Arunachal Pradesh', lat: 27.084, lng: 93.607 },
    { id: 'shimla', name: 'Shimla, Himachal Pradesh', lat: 31.104, lng: 77.173 },
    { id: 'kullu', name: 'Kullu / Manali, Himachal Pradesh', lat: 31.957, lng: 77.109 },
    { id: 'mandi', name: 'Mandi, Himachal Pradesh', lat: 31.708, lng: 76.932 },
    { id: 'joshimath', name: 'Joshimath, Uttarakhand', lat: 30.556, lng: 79.566 },
    { id: 'kedarnath', name: 'Kedarnath / Rudraprayag', lat: 30.735, lng: 79.067 },
    { id: 'ramban', name: 'Ramban, Jammu & Kashmir', lat: 33.242, lng: 75.241 },
    { id: 'wayanad', name: 'Wayanad (Meppadi), Kerala', lat: 11.550, lng: 76.130 },
    { id: 'idukki', name: 'Idukki (Munnar), Kerala', lat: 10.088, lng: 77.059 },
    { id: 'raigad', name: 'Raigad / Mahabaleshwar, MH', lat: 17.923, lng: 73.658 },
    { id: 'nilgiris', name: 'Nilgiris (Ooty), Tamil Nadu', lat: 11.410, lng: 76.703 },
    { id: 'coorg', name: 'Kodagu (Coorg), Karnataka', lat: 12.421, lng: 75.740 },
];
app.get('/api/india-scan', async (_req, res) => {
    try {
        const results = await Promise.all(INDIA_SECTORS.map(s => providers_1.providers.getAIPredictor()
            .predictLandslideRisk(s.lat, s.lng, s.name)
            .then(p => ({ ...p, sectorId: s.id }))
            .catch(() => null)));
        res.json(results.filter(Boolean));
    }
    catch {
        res.status(500).json({ error: 'India scan failed' });
    }
});
// 4. Indian geocoding search
app.get('/api/geocode', async (req, res) => {
    const q = req.query.q;
    if (!q)
        return res.json([]);
    res.json(await providers_1.providers.getGeocoder().searchLocation(q));
});
// 5. Intelligent shelter routing
app.get('/api/routing', async (req, res) => {
    const startLat = parseFloat(req.query.startLat) || 25.298;
    const startLng = parseFloat(req.query.startLng) || 91.582;
    const shelterId = req.query.shelterId;
    res.json(await providers_1.providers.getRoutingProvider().findSafestShelterAndRoute(startLat, startLng, shelterId));
});
// 6. Disaster simulation button
app.post('/api/simulate-disaster', async (_req, res) => {
    console.log('[Sim] Triggering NER landslide scenario…');
    // Override with realistic monsoon-peak values
    database_1.db.updateVillage('mawsynram', { riskScore: 94, riskLevel: 'CRITICAL', rainfall: 148, soilMoisture: 91, evacuationStatus: 'IN_PROGRESS', roadStatus: 'WARNING' });
    database_1.db.updateVillage('sohra', { riskScore: 86, riskLevel: 'HIGH', rainfall: 125, soilMoisture: 84, evacuationStatus: 'IN_PROGRESS', roadStatus: 'WARNING' });
    database_1.db.updateVillage('theiriat', { riskScore: 82, riskLevel: 'HIGH', rainfall: 110, soilMoisture: 80, evacuationStatus: 'IN_PROGRESS', roadStatus: 'BLOCKED' });
    database_1.db.updateRoad('mawsynram-shillong', { status: 'BLOCKED', blockageReason: 'Landslide debris & rockfall — road impassable' });
    database_1.db.updateRoad('lunglei-tlabung', { status: 'BLOCKED', blockageReason: 'Major rockfall at Milestone 24' });
    const alert = database_1.db.addAlert({
        severity: 'CRITICAL',
        title: 'Cloudburst Landslide Alert — East Khasi Hills & Lunglei',
        message: '148mm rainfall in 24h with 91% saturated soil on 42° slope. Immediate evacuation required.',
        status: 'NEW',
        villageId: 'mawsynram',
        riskScore: 94,
        reason: 'Cloudburst + saturated soil + steep terrain → FS < 1.0'
    });
    const payload = {
        event: 'NORTHEAST_LANDSLIDE_SIM',
        villages: database_1.db.getVillages(),
        roads: database_1.db.getRoads(),
        shelters: database_1.db.getShelters(),
        alert,
        evacuationSummary: { totalEstimated: 4670, evacuated: 2420, remaining: 1450, notAccounted: 800, percent: 52 }
    };
    broadcast('DISASTER_SIMULATION_ACTIVE', payload);
    res.json({ success: true, data: payload });
});
// ── CRUD Endpoints ──────────────────────────────────────────────────────────
app.get('/api/villages', (_r, res) => res.json(database_1.db.getVillages()));
app.put('/api/villages/:id', (req, res) => {
    const u = database_1.db.updateVillage(req.params.id, req.body);
    u ? (broadcast('VILLAGE_UPDATED', u), res.json(u)) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/shelters', (_r, res) => res.json(database_1.db.getShelters()));
app.put('/api/shelters/:id', (req, res) => {
    const u = database_1.db.updateShelter(req.params.id, req.body);
    u ? (broadcast('SHELTER_UPDATED', u), res.json(u)) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/roads', (_r, res) => res.json(database_1.db.getRoads()));
app.put('/api/roads/:id', (req, res) => {
    const u = database_1.db.updateRoad(req.params.id, req.body);
    u ? (broadcast('ROAD_UPDATED', u), res.json(u)) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/alerts', (_r, res) => res.json(database_1.db.getAlerts()));
app.post('/api/alerts', (req, res) => {
    const a = database_1.db.addAlert(req.body);
    broadcast('ALERT_CREATED', a);
    res.json(a);
});
app.get('/api/households', (_r, res) => res.json(database_1.db.getHouseholds()));
app.put('/api/households/:id', (req, res) => {
    const u = database_1.db.updateHousehold(req.params.id, req.body);
    u ? (broadcast('HOUSEHOLD_UPDATED', u), res.json(u)) : res.status(404).json({ error: 'Not found' });
});
app.get('/api/field-reports', (_r, res) => res.json(database_1.db.getFieldReports()));
app.post('/api/field-reports', (req, res) => {
    const r = database_1.db.addFieldReport(req.body);
    broadcast('FIELD_REPORT_CREATED', r);
    res.json(r);
});
app.get('/api/config', (_r, res) => res.json({
    keys: apiConfig_1.apiConfig.getMaskedKeys(),
    liveDataSources: {
        weather: 'Open-Meteo (24h accumulated) + OWM fallback',
        routing: 'OSRM (real road network)',
        geocoding: 'Nominatim (OpenStreetMap India)',
        satellite: 'ESRI World Imagery + OWM radar tiles',
        soilData: 'Open-Meteo soil_moisture_0_to_7cm (volumetric)'
    }
}));
server.listen(port, () => {
    console.log(`\n[PRAHARI] ✓ Server → http://localhost:${port}`);
    console.log(`[PRAHARI] ✓ WebSocket → ws://localhost:${port}`);
    console.log(`[PRAHARI] Live weather enrichment started for ${database_1.db.getVillages().length} villages\n`);
});
