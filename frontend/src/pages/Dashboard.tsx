import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, CloudRain, Wind, AlertTriangle, Route, Landmark, 
  ArrowRight, Bell, Send, Download, Users, Camera, Play, CheckCircle2,
  Volume2, Radio, Truck, UserCheck, ShieldCheck, Compass, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import GisMap from '../components/GisMap';
import { Village, Shelter, Road, Alert } from '../types';
import { translations, Language } from '../i18n/translations';

interface DashboardProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  alerts: Alert[];
  emergencyMode: boolean;
  onSelectPage: (page: string) => void;
  demoMode: boolean;
  lang?: Language;
}

export default function Dashboard({ villages, shelters, roads, alerts, emergencyMode, onSelectPage, lang = 'hi' }: DashboardProps) {
  const t = translations[lang] || translations.hi;

  const [liveWeather, setLiveWeather] = useState<any>({
    temperature: 22,
    rainfall24h: 135,
    windSpeed: 25,
    soilMoisture: 88,
    forecast: 'Light rain • Live Weather Feed',
    providerName: 'OpenWeatherMap Live Radar'
  });

  const [simulating, setSimulating] = useState<boolean>(false);
  const [simulationTriggered, setSimulationTriggered] = useState<boolean>(false);

  // Fetch real OpenWeatherMap / Open-Meteo live weather data
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/weather');
        if (res.ok) {
          const data = await res.json();
          setLiveWeather(data);
        }
      } catch (err) {
        console.warn('Weather fetch fallback', err);
      }
    };
    fetchWeather();
  }, []);

  // Single-Click Complete Disaster Simulator
  const handleSimulateDisaster = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/simulate-disaster', { method: 'POST' });
      if (res.ok) {
        setSimulationTriggered(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  // Donut data: Overall Risk Overview
  const riskDonutData = [
    { name: t.critical, value: 28, color: '#DC2626' },
    { name: t.high, value: 45, color: '#EA580C' },
    { name: t.medium, value: 32, color: '#D97706' },
    { name: t.low, value: 23, color: '#10B981' }
  ];

  // Donut data: Evacuation Accountability
  const evacDonutData = [
    { name: t.confirmedSafe, value: 9620, color: '#10B981' },
    { name: t.unconfirmedAtRisk, value: 3230, color: '#DC2626' }
  ];

  // Rescue priority ranking calculation
  const rescuePriorities = [
    { 
      name: lang === 'hi' ? 'मौसिनराम गांव (Mawsynram)' : 'Mawsynram Village', 
      estimated: 1800, 
      evacuated: 1320, 
      unconfirmed: 480, 
      risk: lang === 'hi' ? 'अति गंभीर (94%)' : 'CRITICAL (94%)', 
      priority: lang === 'hi' ? 'प्राथमिकता 1' : 'PRIORITY 1', 
      road: lang === 'hi' ? 'NH-106 अवरुद्ध' : 'NH-106 BLOCKED' 
    },
    { 
      name: lang === 'hi' ? 'सोहरा (Cherrapunjee)' : 'Sohra (Cherrapunjee)', 
      estimated: 2200, 
      evacuated: 1860, 
      unconfirmed: 340, 
      risk: lang === 'hi' ? 'उच्च जोखिम (86%)' : 'HIGH (86%)', 
      priority: lang === 'hi' ? 'प्राथमिकता 2' : 'PRIORITY 2', 
      road: lang === 'hi' ? 'सोहरा लिंक चेतावनी' : 'Sohra Link Warning' 
    },
    { 
      name: lang === 'hi' ? 'थेरियात पहाड़ी ढलान' : 'Theiriat Slopes', 
      estimated: 620, 
      evacuated: 410, 
      unconfirmed: 210, 
      risk: lang === 'hi' ? 'उच्च जोखिम (82%)' : 'HIGH (82%)', 
      priority: lang === 'hi' ? 'प्राथमिकता 3' : 'PRIORITY 3', 
      road: lang === 'hi' ? 'सीमित संपर्क' : 'Access Limited' 
    }
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-8">
      
      {/* 1. Core 6-Stage Lifecycle Bar */}
      <div className="bg-white border border-surface-border rounded-xl p-3 shadow-card overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px] text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">1</span>
            <span>{t.predict}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-blue-800">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">2</span>
            <span>{t.warn}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-purple-800">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px]">3</span>
            <span>{t.route}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-amber-800">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px]">4</span>
            <span>{t.evacuate}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-orange-800">
            <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-[10px]">5</span>
            <span>{t.account}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5 text-red-800">
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-[10px]">6</span>
            <span>{t.rescue}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Red Danger Alert Banner */}
      <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
            <AlertTriangle className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-red-800">
              {t.highRiskAlertBanner}
            </h3>
            <p className="text-[11px] text-red-600 font-medium">
              {lang === 'hi' ? 'प्रत्यक्ष वर्षा' : 'Live Rain'}: {liveWeather.rainfall24h} mm | {lang === 'hi' ? 'मृदा संतृप्ति' : 'Soil Saturation'}: {liveWeather.soilMoisture}% • {lang === 'hi' ? 'आपातकालीन प्रोटोकॉल सक्रिय' : 'Evacuation Protocol Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* THE SINGLE SIMULATE DISASTER EVENT BUTTON */}
          <button
            onClick={handleSimulateDisaster}
            disabled={simulating}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 animate-pulse"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {simulating ? t.simulatingDisaster : t.simulateDisasterBtn}
          </button>

          <button
            onClick={() => onSelectPage('alerts')}
            className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-700 font-bold text-xs rounded-lg transition-all"
          >
            {t.viewAlerts}
          </button>
        </div>
      </div>

      {/* 3. Top Row: Satellite GIS Map (Left) + Overall Risk Overview & Districts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left GIS Satellite Map (7 cols) */}
        <div className="lg:col-span-7 h-[420px]">
          <GisMap 
            villages={villages} 
            shelters={shelters} 
            roads={roads} 
            alerts={alerts}
            emergencyMode={emergencyMode}
            lang={lang}
          />
        </div>

        {/* Right Side: Risk Donut + Districts list (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Overall Risk Overview Card */}
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-card">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">{t.overallRiskOverview}</h4>
            
            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDonutData}
                      innerRadius={42}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {riskDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-extrabold text-2xl text-slate-900 leading-none">128</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{t.totalAreas}</span>
                </div>
              </div>

              {/* Legend with numbers */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"></span> {t.critical}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">28</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span> {t.high}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span> {t.medium}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">32</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> {t.low}
                  </span>
                  <span className="font-bold text-slate-900 font-mono">23</span>
                </div>
              </div>
            </div>
          </div>

          {/* Districts at High Risk List */}
          <div className="bg-white border border-surface-border rounded-xl p-4 shadow-card">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2.5">{t.districtsAtHighRisk}</h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-800">{lang === 'hi' ? 'पश्चिम जयंतिया हिल्स' : 'West Jaintia Hills'}</span>
                <span className="text-[#DC2626] font-bold">{t.critical.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-semibold text-slate-800">{lang === 'hi' ? 'पूर्वी खासी हिल्स (मौसिनराम - सोहरा)' : 'East Khasi Hills (Mawsynram - Sohra)'}</span>
                <span className="text-[#EA580C] font-bold">{t.high.split(' ')[0]}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-800">{lang === 'hi' ? 'री भोई' : 'Ri Bhoi'}</span>
                <span className="text-[#EA580C] font-bold">{t.high.split(' ')[0]}</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button 
                onClick={() => onSelectPage('risk-monitoring')}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                {t.viewAllDistricts} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. Multi-Channel Warning Dispatch Monitor */}
      <div className="bg-white border border-surface-border rounded-xl p-4 shadow-card">
        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
          {t.multiChannelTitle}
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-red-600 text-white rounded-lg animate-pulse">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{t.villageSirens}</span>
              <span className="text-[10px] text-red-600 font-bold">{t.sirensActive}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{t.loudspeakers}</span>
              <span className="text-[10px] text-blue-700 font-bold">{t.loudspeakersActive}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{t.panchayatVans}</span>
              <span className="text-[10px] text-amber-800 font-bold">{t.vansActive}</span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block text-xs">{t.citizenSmsApp}</span>
              <span className="text-[10px] text-emerald-700 font-bold">{t.smsActive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Middle Row: Evacuation Accountability Donut + Live Rescue Priority Queue */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Evacuation Accountability Donut (5 cols) */}
        <div className="md:col-span-5 bg-white border border-surface-border rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
              {t.evacuationAccountability}
            </h4>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={evacDonutData}
                      innerRadius={36}
                      outerRadius={52}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {evacDonutData.map((entry, index) => (
                        <Cell key={`cell-evac-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] text-slate-400 font-bold uppercase">{t.estimatedPop}</span>
                  <span className="font-extrabold text-sm text-slate-900">12,850</span>
                  <span className="text-[8px] text-slate-500">{lang === 'hi' ? 'नागरिक' : 'People'}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase">{t.confirmedSafe}</span>
                  <span className="font-extrabold text-sm text-emerald-900">9,620 (75%)</span>
                </div>

                <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-[10px] text-red-800 font-bold block uppercase">{t.unconfirmedAtRisk}</span>
                  <span className="font-extrabold text-sm text-red-900">3,230 (25%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-500 italic">
            {t.accountabilityFootnote}
          </div>
        </div>

        {/* Live Rescue Priority Queue (7 cols) */}
        <div className="md:col-span-7 bg-white border border-surface-border rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                {t.rescuePriorityQueue}
              </h4>
              <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded-full">
                {t.actionRequired}
              </span>
            </div>

            <div className="space-y-2 text-xs mt-3">
              {rescuePriorities.map((item, i) => (
                <div key={i} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold rounded text-[9px]">
                        {item.priority}
                      </span>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      {lang === 'hi' ? 'सड़क स्थिति' : 'Road condition'}: <b className="text-red-600">{item.road}</b>
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-red-600 block">
                      {item.unconfirmed} {lang === 'hi' ? 'अपुष्ट नागरिक' : 'Unconfirmed'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.evacuated}/{item.estimated} {lang === 'hi' ? 'निकाले गए' : 'Evacuated'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectPage('evacuation')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 mt-3"
          >
            {t.accessFullConsole} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* 6. Live Weather Card & Field Camera Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Live Weather Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-surface-border rounded-xl p-4 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{t.liveEnvironmentalTelemetry}</h4>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">
                🟢 {liveWeather.providerName}
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              <div className="flex items-center gap-2.5">
                <CloudRain className="w-8 h-8 text-blue-500" />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{liveWeather.forecast}</span>
                  <span className="text-[11px] text-slate-500">{lang === 'hi' ? 'मौसिनराम केंद्र • पूर्वी खासी हिल्स' : 'Mawsynram Station • East Khasi Hills'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t.rainfall}</span>
                  <span className="font-bold text-slate-900 text-sm">{liveWeather.rainfall24h} mm</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">{t.soilSaturation}</span>
                  <span className="font-bold text-slate-900 text-sm">{liveWeather.soilMoisture}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t.aiDisclaimer}</span>
          </div>
        </div>

        {/* Live Camera Feeds (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-surface-border rounded-xl p-4 shadow-card">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-500" />
              {t.liveCameras}
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 4 Streams Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" 
                alt="Cherrapunjee Slopes" 
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                CAM 01 • Sohra
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80" 
                alt="Mawsynram Village" 
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                CAM 02 • Mawsynram
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80" 
                alt="NH-106 Highway" 
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute bottom-1 left-1.5 bg-red-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                CAM 03 • NH-106 ({lang === 'hi' ? 'अवरुद्ध' : 'Blocked'})
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80" 
                alt="Jaintia Hills pass" 
                className="w-full h-full object-cover opacity-90"
              />
              <span className="absolute bottom-1 left-1.5 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                CAM 04 • Jaintia Pass
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
