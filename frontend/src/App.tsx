import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map, FileText, Compass, Landmark, 
  Route, Bell, BarChart3, Settings, ShieldAlert, 
  Menu, X, CloudSun, User, Home, Users, Globe, Zap, Activity
} from 'lucide-react';
import { Village, Shelter, Road, Alert } from './types';
import { translations, Language } from './i18n/translations';

// Portals & Pages
import Dashboard from './pages/Dashboard';
import VillagerPortal from './pages/VillagerPortal';
import VolunteerPortal from './pages/VolunteerPortal';
import AIAnalysis from './pages/AIAnalysis';
import RiskMap from './pages/RiskMap';
import RiskMonitoring from './pages/RiskMonitoring';
import AlertCenter from './pages/AlertCenter';
import EvacuationCenter from './pages/EvacuationCenter';
import ShelterManagement from './pages/ShelterManagement';
import RoadManagement from './pages/RoadManagement';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang] || translations.hi;

  // Top-level active experience portal
  const [portalMode, setPortalMode] = useState<'authority' | 'villager' | 'volunteer'>('authority');
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Live Database States
  const [villages, setVillages] = useState<Village[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Telemetry Fetch
  const fetchData = async () => {
    try {
      const [vRes, sRes, rRes, aRes] = await Promise.all([
        fetch('/api/villages'),
        fetch('/api/shelters'),
        fetch('/api/roads'),
        fetch('/api/alerts')
      ]);
      if (vRes.ok) setVillages(await vRes.json());
      if (sRes.ok) setShelters(await sRes.json());
      if (rRes.ok) setRoads(await rRes.json());
      if (aRes.ok) setAlerts(await aRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    // WebSocket telemetry listener
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      if (type === 'DISASTER_SIMULATION_ACTIVE' || type === 'ALERT_CREATED' || type === 'VILLAGE_UPDATED') {
        fetchData();
      }
    };

    return () => ws.close();
  }, []);

  const navItems = [
    { id: 'dashboard', label: lang === 'hi' ? 'डैशबोर्ड (Dashboard)' : lang === 'as' ? 'ডেশ্বব’ৰ্ড' : 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-analysis', label: lang === 'hi' ? 'AI भू-वैज्ञानिक विश्लेषण' : lang === 'as' ? 'AI বিশ্লেষণ' : 'AI Analysis & Telemetry', icon: Zap },
    { id: 'risk-map', label: lang === 'hi' ? 'जोखिम मानचित्र (Risk Map)' : lang === 'as' ? 'মানচিত্ৰ' : 'Risk Map', icon: Map },
    { id: 'reports', label: lang === 'hi' ? 'आपदा रिपोर्ट (Reports)' : lang === 'as' ? 'প্ৰতিবেদন' : 'Reports', icon: FileText },
    { id: 'evacuation', label: lang === 'hi' ? 'निकासी संचालन (Evacuation)' : lang === 'as' ? 'স্থানান্তৰ' : 'Evacuation', icon: Compass, count: 12 },
    { id: 'shelters', label: lang === 'hi' ? 'राहत शिविर (Shelters)' : lang === 'as' ? 'আশ্ৰয় শিবিৰ' : 'Shelters', icon: Landmark },
    { id: 'road-status', label: lang === 'hi' ? 'सड़क मार्ग स्थिति (Roads)' : lang === 'as' ? 'পথৰ অৱস্থা' : 'Road Status', icon: Route },
    { id: 'alerts', label: lang === 'hi' ? 'अलर्ट एवं लॉग (Alerts)' : lang === 'as' ? 'সতৰ্কবাৰ্তা' : 'Alerts & Logs', icon: Bell },
    { id: 'analytics', label: lang === 'hi' ? 'डेटा विश्लेषण (Analytics)' : lang === 'as' ? 'বিশ্লেষণ' : 'Analytics', icon: BarChart3 },
    { id: 'settings', label: lang === 'hi' ? 'सेटिंग्स (Settings)' : lang === 'as' ? 'ছেটিংছ' : 'Settings', icon: Settings },
  ];

  const renderActiveContent = () => {
    if (portalMode === 'villager') {
      return <VillagerPortal villages={villages} shelters={shelters} roads={roads} lang={lang} setLang={setLang} />;
    }

    if (portalMode === 'volunteer') {
      return <VolunteerPortal villages={villages} shelters={shelters} lang={lang} />;
    }

    // Authority Portal Views
    switch (activePage) {
      case 'dashboard':
        return <Dashboard villages={villages} shelters={shelters} roads={roads} alerts={alerts} emergencyMode={true} onSelectPage={setActivePage} demoMode={false} lang={lang} />;
      case 'ai-analysis':
        return <AIAnalysis lang={lang} />;
      case 'risk-map':
      case 'reports':
        return <RiskMap villages={villages} shelters={shelters} roads={roads} alerts={alerts} emergencyMode={true} demoMode={false} />;
      case 'risk-monitoring':
        return <RiskMonitoring villages={villages} alerts={alerts} demoMode={false} />;
      case 'alerts':
        return <AlertCenter alerts={alerts} villages={villages} hasPermission={true} onAlertUpdate={fetchData} />;
      case 'evacuation':
        return <EvacuationCenter villages={villages} shelters={shelters} roads={roads} onSelectPage={setActivePage} hasPermission={true} demoMode={false} />;
      case 'shelters':
        return <ShelterManagement shelters={shelters} hasPermission={true} onRefresh={fetchData} demoMode={false} />;
      case 'road-status':
        return <RoadManagement roads={roads} hasPermission={true} onRefresh={fetchData} demoMode={false} />;
      case 'analytics':
        return <Analytics villages={villages} alerts={alerts} shelters={shelters} roads={roads} />;
      case 'settings':
        return <SettingsPage demoMode={false} onRefresh={fetchData} hasPermission={true} />;
      default:
        return <Dashboard villages={villages} shelters={shelters} roads={roads} alerts={alerts} emergencyMode={true} onSelectPage={setActivePage} demoMode={false} lang={lang} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      
      {/* 1. Deep Forest Emerald Sidebar */}
      {portalMode === 'authority' && (
        <aside className={`bg-[#0B2E23] text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
          sidebarOpen ? 'w-64 p-4' : 'w-20 p-3 items-center'
        }`}>
          
          {/* Brand Header */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center text-white shadow-md shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-extrabold text-sm tracking-wide leading-tight">{t.appTitle}</h1>
                  <span className="text-[10px] text-emerald-300 font-medium tracking-tight block">{t.appSubtitle}</span>
                </div>
              )}
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#10B981] text-white shadow-sm' 
                        : 'text-emerald-100 hover:bg-[#154637] hover:text-white'
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && item.count && (
                      <span className="ml-auto px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Banner Card */}
          {sidebarOpen ? (
            <div className="p-3.5 bg-[#123E30] border border-[#1C5A47] rounded-2xl text-center space-y-1.5">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                📢
              </div>
              <h4 className="font-bold text-xs text-white">{t.earlyWarningSavesLives}</h4>
              <p className="text-[10px] text-emerald-200">{t.bePrepared}</p>
            </div>
          ) : null}

        </aside>
      )}

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-surface-border px-6 py-3 flex justify-between items-center z-20">
          
          <div className="flex items-center gap-3">
            {portalMode === 'authority' && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo when in Villager/Volunteer mode */}
            {portalMode !== 'authority' && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-sm text-slate-900">{t.appTitle}</span>
              </div>
            )}

            <span className="font-bold text-xs text-slate-700 hidden lg:inline">
              {t.hubTitle}
            </span>
          </div>

          {/* PORTAL SWITCHER & GLOBAL LANGUAGE SELECTOR */}
          <div className="flex items-center gap-3 text-xs">
            
            {/* GLOBAL LANGUAGE SELECTOR */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-2.5 py-1 text-emerald-900 font-bold shadow-sm">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <select
                value={lang}
                onChange={(e: any) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-emerald-900 focus:outline-none cursor-pointer"
              >
                <option value="hi">हिंदी (Hindi)</option>
                <option value="en">English</option>
                <option value="as">অসমীয়া (Assamese)</option>
              </select>
            </div>

            {/* Portal Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setPortalMode('authority')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                  portalMode === 'authority' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.authorityPortal}</span>
              </button>

              <button
                onClick={() => setPortalMode('villager')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                  portalMode === 'villager' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.villagerPortal}</span>
              </button>

              <button
                onClick={() => setPortalMode('volunteer')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                  portalMode === 'volunteer' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>{t.volunteerPortal}</span>
              </button>
            </div>

            {/* Weather pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-[11px]">22°C</span>
                <span className="text-[10px] text-slate-400 block leading-none">Live Telemetry</span>
              </div>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-xs text-slate-900 block leading-none">
                  {portalMode === 'authority' ? t.adminRole.split('-')[0] : portalMode === 'villager' ? 'नागरिक' : 'स्वयंसेवक'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {portalMode === 'authority' ? 'कमान केंद्र' : 'पूर्वी खासी हिल्स'}
                </span>
              </div>
            </div>

          </div>

        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderActiveContent()}
        </main>

      </div>

    </div>
  );
}
