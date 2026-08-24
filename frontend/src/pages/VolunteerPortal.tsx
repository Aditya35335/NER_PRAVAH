import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Wifi, WifiOff, RefreshCw, Send, Landmark
} from 'lucide-react';
import { Village, Shelter, Household } from '../types';
import { translations, Language } from '../i18n/translations';

interface VolunteerPortalProps {
  villages: Village[];
  shelters: Shelter[];
  lang?: Language;
}

export default function VolunteerPortal({ villages, shelters, lang = 'hi' }: VolunteerPortalProps) {
  const t = translations[lang] || translations.hi;

  const [selectedVillageId, setSelectedVillageId] = useState<string>('mawsynram');
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [offline, setOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<Record<string, string>>({});

  // Field Report form
  const [reportType, setReportType] = useState<string>('SLOPE_MOVEMENT');
  const [reportDesc, setReportDesc] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<string>('');

  const activeVillage = villages.find(v => v.id === selectedVillageId) || villages[0];

  const fetchHouseholds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/households?villageId=${selectedVillageId}`);
      if (res.ok) {
        setHouseholds(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, [selectedVillageId]);

  const updateStatus = async (id: string, status: 'EVACUATED' | 'NOT_EVACUATED' | 'UNKNOWN') => {
    setHouseholds(prev => prev.map(h => h.id === id ? { ...h, status } : h));

    if (offline) {
      setOfflineQueue(prev => ({ ...prev, [id]: status }));
    } else {
      try {
        await fetch(`/api/households/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleOffline = async () => {
    if (offline) {
      setOffline(false);
      const keys = Object.keys(offlineQueue);
      for (const id of keys) {
        await fetch(`/api/households/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: offlineQueue[id] })
        });
      }
      setOfflineQueue({});
      fetchHouseholds();
    } else {
      setOffline(true);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc) return;

    try {
      await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villageId: selectedVillageId,
          reporterName: 'Field Operations Volunteer Team',
          type: reportType,
          description: reportDesc,
          latitude: activeVillage ? activeVillage.latitude : 25.298,
          longitude: activeVillage ? activeVillage.longitude : 91.582
        })
      });
      setReportSuccess(lang === 'hi' ? 'रिपोर्ट जिला आपदा नियंत्रण कक्ष को सफलतापूर्वक भेज दी गई है!' : 'Report dispatched to District Magistrate Emergency Console!');
      setReportDesc('');
      setTimeout(() => setReportSuccess(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPeople = households.reduce((sum, h) => sum + h.size, 0);
  const evacuatedPeople = households.filter(h => h.status === 'EVACUATED').reduce((sum, h) => sum + h.size, 0);
  const percent = totalPeople > 0 ? Math.round((evacuatedPeople / totalPeople) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Header Bar */}
      <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-2xl text-slate-900 leading-tight">{t.volunteerOpsTitle}</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
              {t.groundTeamConsole}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {lang === 'hi' ? 'घर-घर परिवार सत्यापन एवं मार्ग अवरोध रिपोर्टिंग' : 'Track door-to-door household status & report road blockages'}
          </p>
        </div>

        {/* Offline Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={handleToggleOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              offline 
                ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {offline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{offline ? `${t.offlineMode} (${Object.keys(offlineQueue).length} कतार में)` : t.onlineSyncActive}</span>
          </button>
        </div>
      </div>

      {/* Sector Overview & Progress Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-card space-y-2">
          <label className="text-[10px] text-slate-400 font-bold uppercase block">{t.monitoredSector}</label>
          <select
            value={selectedVillageId}
            onChange={(e) => setSelectedVillageId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-800 focus:outline-none"
          >
            {villages.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.riskLevel === 'CRITICAL' ? (lang === 'hi' ? 'अति गंभीर' : 'Critical') : v.riskLevel === 'HIGH' ? (lang === 'hi' ? 'उच्च' : 'High') : (lang === 'hi' ? 'मध्यम' : 'Medium')})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-card space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.sectorEvacProgress}</span>
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-xl text-slate-900">{percent}%</span>
            <span className="text-xs font-bold text-emerald-600">
              {evacuatedPeople} / {totalPeople} {lang === 'hi' ? 'नागरिक सुरक्षित' : 'People Safe'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="bg-white border border-surface-border rounded-2xl p-4 shadow-card space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">{t.assignedShelter}</span>
          <span className="font-extrabold text-sm text-slate-900 block mt-1">
            {shelters.find(s => s.id === activeVillage?.shelterId)?.name || t.govtSchoolCamp}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold">{lang === 'hi' ? 'खुला है • नागरिक आ रहे हैं' : 'Open & Receiving Families'}</span>
        </div>

      </div>

      {/* Main Grid: Household Checklist (Left) & Hazard Reporter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Household Registry Checklist (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
                {t.householdChecklist}
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-bold">{households.length} {t.householdsLogged}</span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 font-bold">
                {lang === 'hi' ? 'परिवार सूची लोड हो रही है...' : 'Loading household registry...'}
              </div>
            ) : households.length > 0 ? (
              households.map(hh => (
                <div key={hh.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{hh.familyHead}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {hh.size} {lang === 'hi' ? 'परिवार सदस्य' : 'Family Members'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateStatus(hh.id, 'EVACUATED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        hh.status === 'EVACUATED'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'hi' ? '✓ सुरक्षित' : '✓ Safe'}
                    </button>
                    <button
                      onClick={() => updateStatus(hh.id, 'NOT_EVACUATED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        hh.status === 'NOT_EVACUATED'
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {lang === 'hi' ? 'असुरक्षित' : 'Not Safe'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                {lang === 'hi' ? 'इस क्षेत्र के लिए कोई परिवार पंजीकृत नहीं है।' : 'No households registered for this sector.'}
              </div>
            )}
          </div>
        </div>

        {/* Hazard Field Reporter (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-surface-border rounded-2xl p-5 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900">
              {t.submitFieldReport}
            </h3>
          </div>

          {reportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
              ✓ {reportSuccess}
            </div>
          )}

          <form onSubmit={handleSendReport} className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-600 font-bold block mb-1">{t.observationType}</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium"
              >
                <option value="CRACK">{lang === 'hi' ? 'पहाड़ी ढलान पर दरार (Tension Crack)' : 'Slope Tension Crack'}</option>
                <option value="SLOPE_MOVEMENT">{lang === 'hi' ? 'मिट्टी का बहाव / भू-खिसकाव (Soil Creep)' : 'Slope Creep / Soil Slippage'}</option>
                <option value="LANDSLIDE">{lang === 'hi' ? 'बड़ा भूस्खलन / चट्टान गिरना (Landslide)' : 'Major Landslide / Rockfall'}</option>
                <option value="ROAD_BLOCKAGE">{lang === 'hi' ? 'राजमार्ग मार्ग अवरोध (Road Block)' : 'Road Highway Blockage'}</option>
                <option value="FLOODING">{lang === 'hi' ? 'पहाड़ी नाले में बाढ़ (Flooding)' : 'Stream Overflow / Flooding'}</option>
              </select>
            </div>

            <div>
              <label className="text-slate-600 font-bold block mb-1">{t.fieldDesc}</label>
              <textarea
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder={lang === 'hi' ? 'दरार की लंबाई, मिट्टी खिसकने की गति, और प्रभावित सड़क किमी का विवरण दें...' : 'Describe crack length, slide movement rate, and affected road kilometers...'}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                required
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 font-medium">
              📍 {lang === 'hi' ? 'GPS स्थिति' : 'GPS Tag'}: <b className="text-slate-700 font-mono">[{activeVillage.latitude.toFixed(3)}, {activeVillage.longitude.toFixed(3)}]</b>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{t.broadcastReport}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
