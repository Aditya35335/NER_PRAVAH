import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Route, Landmark, 
  Bell, Phone, ArrowRight, MapPin, 
  Home, Map, Radio, User, Check, X, CloudRain, Compass, CheckCircle2, Shield
} from 'lucide-react';
import { Village, Shelter, Road, Alert } from '../types';
import { translations, Language } from '../i18n/translations';
import GisMap from '../components/GisMap';

interface VillagerPortalProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  alerts?: Alert[];
  lang?: Language;
  setLang?: (lang: Language) => void;
}

export default function VillagerPortal({ villages, shelters, roads, alerts = [], lang = 'hi', setLang }: VillagerPortalProps) {
  const t = translations[lang] || translations.hi;

  const [userCoords, setUserCoords] = useState<[number, number]>([25.298, 91.582]);
  const [localCityName, setLocalCityName] = useState<string>('East Khasi Hills / Mawsynram');
  const [localWeather, setLocalWeather] = useState<any>({ rainfall24h: 148, temperature: 22, soilMoisture: 91 });
  const [localRiskScore, setLocalRiskScore] = useState<number>(94);
  const [markedSafe, setMarkedSafe] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showHazardModal, setShowHazardModal] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [hazardType, setHazardType] = useState<string>('Tension Crack on Hill');
  const [hazardDesc, setHazardDesc] = useState<string>('');
  const [hazardSuccess, setHazardSuccess] = useState<boolean>(false);

  // Determine if active alert condition exists (Risk >= 65% or active alert in sector)
  const isAlertActive = localRiskScore >= 65 || alerts.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

  // Automatically detect user's browser GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords([lat, lng]);

          // Fetch live weather & real AI risk prediction for user's actual coordinate
          try {
            const predRes = await fetch(`/api/predict?lat=${lat}&lng=${lng}&name=Current+GPS+Location`);
            if (predRes.ok) {
              const predData = await predRes.json();
              setLocalRiskScore(predData.riskScore);
              setLocalWeather({
                rainfall24h: predData.metrics.rainfall24h,
                temperature: 22,
                soilMoisture: predData.metrics.soilMoisture
              });
            }
          } catch (e) {
            console.warn(e);
          }
        },
        () => {
          // Fallback to Mawsynram
        }
      );
    }
  }, []);

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villageId: 'mawsynram',
          reporterName: 'Local Resident',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl text-slate-900 leading-tight">{t.namaste}</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {t.citizenSafetyPortal}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{localCityName} [{userCoords[0].toFixed(3)}, {userCoords[1].toFixed(3)}]</span>
          </p>
        </div>

        {/* Language selector dropdown */}
        {setLang && (
          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-slate-500 font-bold">भाषा (Language):</span>
            <select
              value={lang}
              onChange={(e: any) => setLang(e.target.value as Language)}
              className="bg-slate-100 border border-slate-200 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="hi">हिंदी (Hindi)</option>
              <option value="en">English</option>
              <option value="as">অসমীয়া (Assamese)</option>
            </select>
          </div>
        )}
      </div>

      {/* 1. Dynamic Alert Banner: Red when Alert Active, Green when Normal */}
      {isAlertActive ? (
        <div className="bg-[#DC2626] text-white rounded-2xl p-6 shadow-elevated space-y-4 relative overflow-hidden animate-slide-in">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl tracking-wide uppercase">
                  {t.highLandslideRiskArea} ({localRiskScore}%)
                </h2>
                <p className="text-xs text-red-100 font-medium mt-0.5">
                  {lang === 'hi' ? `आपके स्थान पर 24 घंटे में वर्षा: ${localWeather.rainfall24h} mm` : `Rainfall at your location: ${localWeather.rainfall24h} mm`}
                </p>
              </div>
            </div>
            <CloudRain className="w-10 h-10 text-red-200" />
          </div>

          <p className="text-xs sm:text-sm text-red-100 leading-relaxed font-medium">
            {t.avoidHighSlopes}
          </p>

          <button
            onClick={() => setShowSafetyModal(true)}
            className="py-3 px-6 bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>{t.viewSafetyInstructions}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-elevated space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-wide uppercase">
                {lang === 'hi' ? 'सामान्य स्थिति • कोई सक्रिय भूस्खलन चेतावनी नहीं' : 'Normal Conditions • No Active Landslide Alert'}
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {lang === 'hi' ? `स्थानीय जोखिम: ${localRiskScore}% (सुरक्षित) • सभी मार्ग खुले हैं` : `Local Risk: ${localRiskScore}% (Normal) • All roads clear`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Evacuation Information Card — DISPLAYED ONLY WHEN ALERT IS ACTIVE */}
      {isAlertActive ? (
        <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4 animate-slide-in">
          <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">{t.evacuationInformation}</h3>
              <span className="text-[11px] text-slate-500">{t.autoCalculatedRoute}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.nearestSafeShelter}</span>
              <span className="font-extrabold text-sm text-slate-900 mt-1 block">{t.govtSchoolCamp}</span>
              <span className="text-[11px] text-emerald-600 font-bold">{t.openSpotsAvailable}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.estimatedWalkingTime}</span>
              <span className="font-extrabold text-sm text-slate-900 mt-1 block">{t.walkingTimeVal}</span>
              <span className="text-[11px] text-slate-500">{t.viaLinkRoad}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.turnByTurnGuidance}</span>
              <button
                onClick={() => setShowMapModal(true)}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                {t.viewRouteMap}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-600 font-medium">
          {lang === 'hi' ? '🛡️ राहत शिविर स्टैंडबाय पर हैं। चेतावनी जारी होने पर निकटतम शिविर का मार्ग स्वतः सक्रिय होगा।' : '🛡️ Relief shelters are on standby. Safe routes will activate automatically if alert triggers.'}
        </div>
      )}

      {/* 3. Six Action Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        
        {/* Tile 1: I Am Safe */}
        <button
          onClick={() => setMarkedSafe(true)}
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

        {/* Tile 2: Report Hazard */}
        <button
          onClick={() => setShowHazardModal(true)}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.reportHazard}</span>
        </button>

        {/* Tile 3: Road Status */}
        <button
          onClick={() => alert(isAlertActive ? (lang === 'hi' ? 'सड़क स्थिति: नोंगस्टोइन के पास NH-106 चट्टान गिरने से अवरुद्ध है।' : 'Road Status: NH-106 near Nongstoin is BLOCKED due to rockfall.') : (lang === 'hi' ? 'सड़क स्थिति: सभी मुख्य सड़कें सामान्य हैं।' : 'Road Status: All highways normal.'))}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Route className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.roadStatus}</span>
        </button>

        {/* Tile 4: Shelters */}
        <button
          onClick={() => alert(lang === 'hi' ? 'सक्रिय राहत शिविर सूची:\n1. शासकीय उच्चतर माध्यमिक विद्यालय - खुला (380 स्थान उपलब्ध)\n2. मौसिनराम खेल परिसर - स्टैंडबाय' : 'Active Shelters:\n1. Govt. High School - OPEN (380 spots)\n2. Mawsynram Sports Complex - STANDBY')}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.shelters}</span>
        </button>

        {/* Tile 5: Alerts */}
        <button
          onClick={() => alert(isAlertActive ? (lang === 'hi' ? 'सक्रिय चेतावनी: अत्यधिक वर्षा के कारण ढलान अस्थिरता। सतर्क रहें।' : 'Active Alert: Critical precipitation saturation on slopes.') : (lang === 'hi' ? 'कोई सक्रिय चेतावनी नहीं है।' : 'No active alerts.'))}
          className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-card hover:bg-slate-50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 text-center">{t.alerts}</span>
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

      {/* 4. Community Update Card */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{t.communityUpdate}</span>
          <p className="font-extrabold text-sm text-slate-900 mt-0.5">{t.familiesEvacuated}</p>
          <span className="text-[11px] text-slate-500">
            {lang === 'hi' ? 'सेक्टर 2 में राहत सामग्री एवं पेयजल की व्यवस्था की गई है।' : 'Relief supplies and drinking water dispatched to Sector 2.'}
          </span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>

      {/* Safety Instructions Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">{lang === 'hi' ? 'आपातकालीन सुरक्षा निर्देश' : 'Emergency Safety Checklist'}</h3>
              <button onClick={() => setShowSafetyModal(false)} className="p-1 text-slate-500 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 font-semibold">
                {lang === 'hi' ? '1. यदि आपको पेड़ों का झुकना, ढलानों पर नई दरारें दिखाई दें, या गड़गड़ाहट सुनाई दे, तो तुरंत खुले ऊंचे स्थान पर जाएं।' : '1. If you notice tilting trees, new cracks on slopes, or hear loud subterranean rumble, evacuate immediately.'}
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {lang === 'hi' ? '2. भारी बारिश के दौरान प्राकृतिक जल निकासी नालों, नदी के किनारों और पुलियों को पार न करें।' : '2. Do not cross river beds, streams, or low-lying road culverts during heavy rainfall.'}
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                {lang === 'hi' ? '3. शासकीय उच्चतर माध्यमिक विद्यालय राहत शिविर की ओर निर्धारित सुरक्षित मार्ग का अनुसरण करें।' : '3. Follow the designated route to Govt. High School shelter.'}
              </div>
            </div>
            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              {lang === 'hi' ? 'मैंने निर्देश समझ लिए हैं' : 'I Understand & Keep Alert'}
            </button>
          </div>
        </div>
      )}

      {/* Hazard Report Modal */}
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

      {/* Map View Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl p-6 flex flex-col space-y-4 animate-slide-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-base text-slate-900">{t.viewRouteMap}</h3>
              <button onClick={() => setShowMapModal(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 h-full min-h-[300px]">
              <GisMap villages={villages} shelters={shelters} roads={roads} alerts={alerts} lang={lang} emergencyMode={isAlertActive} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
