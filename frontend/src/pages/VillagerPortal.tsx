import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Route, Landmark, 
  Bell, Phone, ArrowRight, MapPin, 
  Home, Map, Radio, User, Check, X, CloudRain, Compass, CheckCircle2, Shield,
  Layers, Navigation
} from 'lucide-react';
import { Village, Shelter, Road, Alert } from '../types';
import { translations, Language } from '../i18n/translations';
import GisMap from '../components/GisMap';
import { markHouseholdEvacuatedInFirestore, dispatchSOSInFirestore } from '../firebase';
import { AuthUser } from '../components/AuthModal';

interface VillagerPortalProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  alerts?: Alert[];
  lang?: Language;
  setLang?: (lang: Language) => void;
  currentUser?: AuthUser | null;
  onRequestLogin?: (msg?: string) => void;
}

export default function VillagerPortal({ 
  villages, 
  shelters, 
  roads, 
  alerts = [], 
  lang = 'hi', 
  setLang,
  currentUser,
  onRequestLogin
}: VillagerPortalProps) {
  const t = translations[lang] || translations.hi;

  // 1. Sector / Location selection — defaults to logged in resident's village or first sector
  const [selectedVillageId, setSelectedVillageId] = useState<string>(() => {
    return currentUser?.villageId || villages[0]?.id || 'mawsynram';
  });

  const activeVillage = villages.find(v => v.id === selectedVillageId) || villages[0] || {
    id: 'mawsynram',
    name: 'Mawsynram Village (East Khasi Hills, Meghalaya)',
    latitude: 25.298,
    longitude: 91.582,
    riskScore: 35,
    riskLevel: 'LOW',
    rainfall: 12,
    soilMoisture: 42,
    slope: 28,
    elevation: 1400
  };

  const [userCoords, setUserCoords] = useState<[number, number]>([activeVillage.latitude, activeVillage.longitude]);
  const [localWeather, setLocalWeather] = useState<any>({ 
    rainfall24h: activeVillage.rainfall, 
    temperature: 22, 
    soilMoisture: activeVillage.soilMoisture 
  });
  const [localRiskScore, setLocalRiskScore] = useState<number>(activeVillage.riskScore);
  const [localRiskLevel, setLocalRiskLevel] = useState<string>(activeVillage.riskLevel);

  const [markedSafe, setMarkedSafe] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showEvacModal, setShowEvacModal] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [showHazardModal, setShowHazardModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  
  const [familyHeadName, setFamilyHeadName] = useState<string>(currentUser?.name || '');
  const [familySize, setFamilySize] = useState<number>(4);
  const [sosPhone, setSosPhone] = useState<string>('');
  const [sosNotes, setSosNotes] = useState<string>('');
  const [sosSuccess, setSosSuccess] = useState<boolean>(false);
  const [hazardType, setHazardType] = useState<string>('Tension Crack on Hill');
  const [hazardDesc, setHazardDesc] = useState<string>('');
  const [hazardSuccess, setHazardSuccess] = useState<boolean>(false);

  // Sync user details on login
  useEffect(() => {
    if (currentUser?.name) setFamilyHeadName(currentUser.name);
    if (currentUser?.villageId) setSelectedVillageId(currentUser.villageId);
  }, [currentUser]);

  // Sync coordinates and baseline stats immediately when selected sector changes
  useEffect(() => {
    if (activeVillage) {
      setUserCoords([activeVillage.latitude, activeVillage.longitude]);
      setLocalRiskScore(activeVillage.riskScore);
      setLocalRiskLevel(activeVillage.riskLevel);
      setLocalWeather({ 
        rainfall24h: activeVillage.rainfall, 
        temperature: 22, 
        soilMoisture: activeVillage.soilMoisture 
      });
      
      // Fetch live AI prediction & weather for the resident's selected sector
      let isCurrent = true;
      const fetchSectorData = async () => {
        try {
          const predRes = await fetch(`/api/predict?lat=${activeVillage.latitude}&lng=${activeVillage.longitude}&name=${encodeURIComponent(activeVillage.name)}`);
          if (predRes.ok && isCurrent) {
            const predData = await predRes.json();
            setLocalRiskScore(predData.riskScore);
            setLocalRiskLevel(predData.riskLevel);
            setLocalWeather({
              rainfall24h: predData.metrics.rainfall24h,
              temperature: 22,
              soilMoisture: predData.metrics.soilMoisture
            });
          }
        } catch (e) {
          console.warn('[VillagerPortal] Weather fetch notice:', e);
        }
      };

      fetchSectorData();
      return () => { isCurrent = false; };
    }
  }, [selectedVillageId, activeVillage?.id]);

  // 2. Strict Location Filtering of Alerts (Only alerts for the resident's selected village!)
  const localAlerts = alerts.filter(a => {
    if (!a) return false;
    const matchesVillageId = a.villageId && (
      a.villageId === activeVillage.id || 
      activeVillage.id.includes(a.villageId) ||
      a.villageId.includes(activeVillage.id)
    );
    const shortName = activeVillage.name.split('(')[0].trim().toLowerCase();
    const matchesName = (
      (a.location && a.location.toLowerCase().includes(shortName)) || 
      (a.title && a.title.toLowerCase().includes(shortName))
    );
    return Boolean(matchesVillageId || matchesName);
  });

  const hasCriticalLocalAlert = localAlerts.some(a => (a.severity === 'CRITICAL' || a.severity === 'HIGH') && a.status !== 'RESOLVED');
  const isAlertActive = hasCriticalLocalAlert;
  const activeAlertDetail = localAlerts[0];

  // 3. Strict Location Filtering of Shelters and Roads
  const localShelters = shelters.filter(s => 
    s.id.includes(activeVillage.id) || 
    activeVillage.id.includes(s.id.split('-')[0]) ||
    Math.hypot(s.latitude - activeVillage.latitude, s.longitude - activeVillage.longitude) < 0.8
  );
  const primaryShelter = localShelters[0] || shelters[0];

  const localRoads = roads.filter(r => 
    r.id.includes(activeVillage.id) || 
    activeVillage.id.includes(r.id.split('-')[0]) ||
    Math.hypot(r.latStart - activeVillage.latitude, r.lngStart - activeVillage.longitude) < 0.8
  );
  const isAnyRoadBlocked = localRoads.some(r => r.status === 'BLOCKED');

  const handleEvacSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyHeadName.trim()) return;
    const targetShelterId = primaryShelter?.id || 'relief-center';
    await markHouseholdEvacuatedInFirestore(
      activeVillage.id,
      familyHeadName.trim(),
      familySize,
      targetShelterId
    );
    setMarkedSafe(true);
    setShowEvacModal(false);
  };

  const handleSosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatchSOSInFirestore({
      citizenName: familyHeadName.trim() || 'Citizen at GPS location',
      phone: sosPhone.trim() || 'Not provided',
      latitude: userCoords[0],
      longitude: userCoords[1],
      urgency: 'IMMEDIATE',
      notes: sosNotes.trim() || `Urgent rescue requested near ${activeVillage.name}`
    });
    setSosSuccess(true);
    setTimeout(() => {
      setSosSuccess(false);
      setShowSosModal(false);
    }, 2500);
  };

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villageId: activeVillage.id,
          reporterName: familyHeadName.trim() || 'Local Resident',
          type: 'LANDSLIDE',
          description: `${hazardType}: ${hazardDesc || 'Reported from citizen portal'}`,
          latitude: userCoords[0],
          longitude: userCoords[1]
        })
      });
      setHazardSuccess(true);
      setTimeout(() => {
        setHazardSuccess(false);
        setShowHazardModal(false);
        setHazardDesc('');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const onTileClickSafe = () => {
    if (!currentUser) {
      onRequestLogin?.('Please sign in first to verify and record your family safe evacuation status.');
      return;
    }
    setShowEvacModal(true);
  };

  const onTileClickSos = () => {
    if (!currentUser) {
      onRequestLogin?.('Please sign in first to transmit an official emergency SOS GPS rescue dispatch.');
      return;
    }
    setShowSosModal(true);
  };

  const onTileClickHazard = () => {
    if (!currentUser) {
      onRequestLogin?.('Please sign in first to submit an authentic field hazard / crack incident report.');
      return;
    }
    setShowHazardModal(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* ── 1. Resident Location Bar & Sector Selector ─────────────────────── */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl text-slate-900 leading-tight">{t.namaste}</h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {t.citizenSafetyPortal}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Monitored Sector: <b>{activeVillage.name}</b> [{userCoords[0].toFixed(3)}°N, {userCoords[1].toFixed(3)}°E]</span>
          </p>
        </div>

        {/* Controls: Sector Selector & Language */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          {/* Sector Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 shadow-sm flex-1 md:flex-initial">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {villages.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Language selector */}
          {setLang && (
            <select
              value={lang}
              onChange={(e: any) => setLang(e.target.value as Language)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer shadow-sm"
            >
              <option value="hi">हिंदी (Hindi)</option>
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
            </select>
          )}
        </div>
      </div>

      {/* ── 2. Resident Location-Specific Alert Banner ─────────────────────── */}
      {isAlertActive ? (
        <div className="bg-[#DC2626] text-white rounded-2xl p-6 shadow-elevated space-y-4 relative overflow-hidden animate-slide-in">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl tracking-wide uppercase">
                  🚨 {activeVillage.name.split('(')[0]} · {activeAlertDetail?.title || `${t.highLandslideRiskArea} (${localRiskScore}%)`}
                </h2>
                <p className="text-xs text-red-100 font-medium mt-0.5">
                  {lang === 'hi' ? `24 घंटे में वर्षा: ${localWeather.rainfall24h} mm | मृदा संतृप्ति: ${localWeather.soilMoisture}%` : `24h Rainfall: ${localWeather.rainfall24h} mm | Soil Moisture: ${localWeather.soilMoisture}%`}
                </p>
              </div>
            </div>
            <CloudRain className="w-10 h-10 text-red-200 shrink-0" />
          </div>

          <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
            {activeAlertDetail?.message || t.avoidHighSlopes}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowSafetyModal(true)}
              className="py-2.5 px-5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{t.viewSafetyInstructions}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMapModal(true)}
              className="py-2.5 px-5 bg-white text-red-700 hover:bg-red-50 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Navigation className="w-4 h-4" />
              <span>{t.viewRouteMap}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-elevated space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-wide uppercase">
                {lang === 'hi' ? `सामान्य स्थिति • ${activeVillage.name.split('(')[0]} में कोई सक्रिय भूस्खलन चेतावनी नहीं` : `Normal Conditions in ${activeVillage.name.split('(')[0]} • No Active Alerts`}
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {lang === 'hi' ? `स्थानीय जोखिम: ${localRiskScore}% (सुरक्षित) • 24 घंटे में वर्षा: ${localWeather.rainfall24h} mm` : `Local Risk Index: ${localRiskScore}% (Normal) • 24h Rain: ${localWeather.rainfall24h} mm`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Sector-Specific Relief Shelter & Road Quick Card ────────────── */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Nearest Designated Shelter */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-blue-600" />
              Nearest Relief Shelter
            </span>
            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {primaryShelter ? `${primaryShelter.capacity - primaryShelter.occupied} Spots Free` : 'Standby'}
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">{primaryShelter?.name || 'Local High School Relief Camp'}</h4>
          <p className="text-[11px] text-slate-500">{primaryShelter?.location || activeVillage.name}</p>
        </div>

        {/* Local Road Corridor Status */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Route className="w-3.5 h-3.5 text-purple-600" />
              Local Access Corridor
            </span>
            <span className={`text-[9px] px-2 py-0.5 font-bold rounded-full ${
              isAnyRoadBlocked ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isAnyRoadBlocked ? 'BLOCKED' : 'PASSABLE'}
            </span>
          </div>
          <h4 className="font-extrabold text-sm text-slate-900">
            {localRoads[0]?.name || 'National & District Access Highway'}
          </h4>
          <p className="text-[11px] text-slate-500">
            {isAnyRoadBlocked ? (localRoads.find(r => r.status === 'BLOCKED')?.blockageReason || 'Obstruction reported') : 'Normal vehicular traffic flow.'}
          </p>
        </div>

      </div>

      {/* ── 4. Six Action Tiles Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        
        {/* Tile 1: Mark Family Evacuated / Safe */}
        <button
          onClick={onTileClickSafe}
          className={`p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all ${
            markedSafe ? 'border-emerald-500 bg-emerald-50' : ''
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            markedSafe ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">
            {markedSafe ? t.confirmed : t.iAmSafe}
          </span>
        </button>

        {/* Tile 2: SOS Emergency Dispatch */}
        <button
          onClick={onTileClickSos}
          className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-red-100 transition-all animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-red-700 text-center">SOS Rescue</span>
        </button>

        {/* Tile 3: Report Hazard */}
        <button
          onClick={onTileClickHazard}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.reportHazard}</span>
        </button>

        {/* Tile 4: Shelters */}
        <button
          onClick={() => alert(lang === 'hi' ? `सक्रिय राहत शिविर सूची (${activeVillage.name}):\n1. ${primaryShelter?.name || 'शासकीय उच्चतर माध्यमिक विद्यालय'} - खुला (${primaryShelter ? primaryShelter.capacity - primaryShelter.occupied : 380} स्थान उपलब्ध)` : `Active Shelters in ${activeVillage.name}:\n1. ${primaryShelter?.name || 'Govt High School'} - OPEN (${primaryShelter ? primaryShelter.capacity - primaryShelter.occupied : 380} spots free)`)}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.shelters}</span>
        </button>

        {/* Tile 5: Road Status */}
        <button
          onClick={() => alert(isAnyRoadBlocked ? (lang === 'hi' ? `सड़क स्थिति (${activeVillage.name}): मार्ग पर मलबा आने से अवरोध है। वैकल्पिक मार्ग का उपयोग करें।` : `Road Status (${activeVillage.name}): Route blocked due to debris. Use alternate relief bypass.`) : (lang === 'hi' ? `सड़क स्थिति (${activeVillage.name}): सभी मुख्य सड़कें सामान्य एवं खुली हैं।` : `Road Status (${activeVillage.name}): All primary corridors open.`))}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Route className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.roadStatus}</span>
        </button>

        {/* Tile 6: Helpline */}
        <a
          href="tel:108"
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.helpline}</span>
        </a>

      </div>

        {/* ── 5. Safety Instructions Modal ────────────────────────────────────── */}
        {showSafetyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 animate-slide-in">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-base text-slate-900">
                  {lang === 'hi' ? 'सुरक्षा निर्देश एवं बचाव दिशा-निर्देश' : 'Safety Advisory & Evacuation Guidelines'}
                </h3>
                <button onClick={() => setShowSafetyModal(false)} className="p-1 text-slate-500 hover:text-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">1.</span>
                <span>{lang === 'hi' ? 'खड़ी ढलानों और भारी जलभराव वाले क्षेत्रों से तुरंत दूर रहें।' : 'Move away from steep slopes and waterlogged stream beds.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">2.</span>
                <span>{lang === 'hi' ? 'यदि घरों की दीवारों या जमीन में नई दरारें दिखाई दें तो तुरंत सुरक्षित शिविर में जाएं।' : 'If fresh tension cracks appear in walls or ground, evacuate immediately.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">3.</span>
                <span>{lang === 'hi' ? 'आपातकालीन किट (दवाएं, टॉर्च, पहचान पत्र) साथ रखें।' : 'Keep an emergency kit ready with basic medicines, torch, and documents.'}</span>
              </li>
            </ul>
            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs"
            >
              {lang === 'hi' ? 'समझ गया' : 'Understood'}
            </button>
          </div>
        </div>
      )}

      {/* ── 6. Evacuation / Family Safety Check-In Modal ───────────────────── */}
      {showEvacModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {lang === 'hi' ? 'परिवार सुरक्षा एवं निकासी सत्यापन' : 'Family Safety & Evacuation Verification'}
                </h3>
              </div>
              <button onClick={() => setShowEvacModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEvacSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  {lang === 'hi' ? 'परिवार मुखिया / नाम' : 'Family Head Name'}
                </label>
                <input
                  type="text"
                  required
                  value={familyHeadName}
                  onChange={(e) => setFamilyHeadName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra / Banteilang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  {lang === 'hi' ? 'परिवार के सदस्यों की कुल संख्या' : 'Total Family Member Count'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={familySize}
                  onChange={(e) => setFamilySize(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 border border-emerald-200">
                📍 {lang === 'hi' ? `स्थान: ${activeVillage.name}` : `Sector: ${activeVillage.name}`}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'hi' ? 'सुरक्षित निकासी दर्ज करें' : 'Confirm Safe Evacuation'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. SOS Emergency Dispatch Modal ─────────────────────────────────── */}
      {showSosModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl animate-pulse">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm text-red-700">
                  {lang === 'hi' ? '🚨 आपातकालीन SOS बचाव अनुरोध' : '🚨 Emergency SOS Rescue Dispatch'}
                </h3>
              </div>
              <button onClick={() => setShowSosModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sosSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center text-xs font-bold space-y-1">
                <p className="text-sm">✓ SOS Broadcasted to SDRF / NDRF Teams</p>
                <p className="text-[11px] text-emerald-600">Your GPS Coordinates [{userCoords[0].toFixed(4)}, {userCoords[1].toFixed(4)}] near {activeVillage.name} have been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleSosSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">Contact Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={sosPhone}
                    onChange={(e) => setSosPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">Urgent Situation Details</label>
                  <textarea
                    value={sosNotes}
                    onChange={(e) => setSosNotes(e.target.value)}
                    placeholder="e.g. 4 family members trapped near upper slope; road blocked"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div className="p-2.5 bg-red-50 rounded-xl text-[10px] text-red-700 border border-red-200 font-mono">
                  📍 Automatic GPS broadcast: [{userCoords[0].toFixed(4)}°N, {userCoords[1].toFixed(4)}°E] ({activeVillage.name})
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Dispatch SOS Signal Now</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 8. Hazard Report Modal ──────────────────────────────────────────── */}
      {showHazardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">{t.reportHazard}</h3>
              <button onClick={() => setShowHazardModal(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {hazardSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center text-xs font-bold">
                ✓ {lang === 'hi' ? 'आपकी रिपोर्ट आपदा प्रबंधन नियंत्रण कक्ष को सफलतापूर्वक भेज दी गई है!' : 'Report sent to Disaster Management Command Center!'}
              </div>
            ) : (
              <form onSubmit={handleReportHazard} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-600 font-bold block mb-1">{lang === 'hi' ? 'खतरे का वर्गीकरण' : 'Hazard Classification'}</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  >
                    <option value="Tension Crack on Hill">{lang === 'hi' ? 'ढलान पर दरार (Slope Tension Crack)' : 'Slope Tension Crack'}</option>
                    <option value="Active Mudflow">{lang === 'hi' ? 'सक्रिय मिट्टी का बहाव (Soil Creep)' : 'Active Mudflow / Soil Creep'}</option>
                    <option value="Road Blocked by Boulders">{lang === 'hi' ? 'चट्टान गिरने से सड़क अवरुद्ध (Rockfall)' : 'Road Blocked by Boulders'}</option>
                    <option value="Flooded Stream">{lang === 'hi' ? 'पहाड़ी नाले में बाढ़ (Stream Overflow)' : 'River / Stream Overflow'}</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 font-bold block mb-1">{lang === 'hi' ? 'निरीक्षण का विवरण' : 'Observation Description'}</label>
                  <textarea
                    value={hazardDesc}
                    onChange={(e) => setHazardDesc(e.target.value)}
                    placeholder={lang === 'hi' ? 'उदा. मुख्य सड़क के ऊपरी मोड़ पर 5 सेमी चौड़ी दरार देखी गई है' : 'e.g. 5cm wide crack near curve on upper road'}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <div className="text-[10px] text-slate-500 font-mono">
                  📍 Sector: {activeVillage.name}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs"
                >
                  {lang === 'hi' ? 'प्रशासन को आपातकालीन रिपोर्ट भेजें' : 'Submit Incident to Authorities'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── 9. Map View Modal ───────────────────────────────────────────────── */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl p-6 flex flex-col space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">{t.viewRouteMap} ({activeVillage.name})</h3>
              <button onClick={() => setShowMapModal(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 h-full min-h-[300px]">
              <GisMap villages={[activeVillage]} shelters={localShelters} roads={localRoads} alerts={localAlerts} lang={lang} emergencyMode={isAlertActive} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
