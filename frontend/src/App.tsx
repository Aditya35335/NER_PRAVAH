import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Map, FileText, Compass, Landmark, 
  Route, Bell, BarChart3, Settings, ShieldAlert, 
  Menu, X, CloudSun, User, Home, Users, Globe, Zap, Activity, CalendarDays,
  KeyRound, LogOut, ShieldCheck, Lock, Database
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
import Forecast from './pages/Forecast';
import AlertSiren from './components/AlertSiren';
import AuthModal, { AuthUser } from './components/AuthModal';
import FirebaseDataViewer from './components/FirebaseDataViewer';
import { 
  subscribeToAlerts, subscribeToVillages, subscribeToShelters, 
  subscribeToRoads, seedFirestoreIfEmpty, initPushNotifications 
} from './firebase';

// Register Service Worker (PWA + offline support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('[SW] Registered, scope:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang] || translations.hi;

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('prahari_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'admin' | 'user'>('admin');
  const [authModalMsg, setAuthModalMsg] = useState<string | undefined>(undefined);

  // Top-level active experience portal (Default to citizen / villager portal for non-admins)
  const [portalMode, setPortalMode] = useState<'authority' | 'villager' | 'volunteer'>(() => {
    try {
      const saved = localStorage.getItem('prahari_auth_user');
      const parsed = saved ? JSON.parse(saved) : null;
      if (parsed?.role === 'SUPER_ADMIN') return 'authority';
      return 'villager';
    } catch {
      return 'villager';
    }
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [systemMode, setSystemMode]   = useState<'LIVE' | 'SIMULATION'>('LIVE');

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
      if (vRes.ok) {
        const vData = await vRes.json();
        setVillages(vData);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setShelters(sData);
      }
      if (rRes.ok) {
        const rData = await rRes.json();
        setRoads(rData);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAlerts(aData);
      }
    } catch (err) {
      console.error('[App] Initial telemetry fetch notice:', err);
    }
  };

  useEffect(() => {
    fetchData();
    initPushNotifications();

    // Firebase Firestore Realtime Listeners
    const unsubAlerts = subscribeToAlerts((fbAlerts) => {
      if (fbAlerts && fbAlerts.length > 0) setAlerts(fbAlerts);
    });

    const unsubVillages = subscribeToVillages((fbVillages) => {
      if (fbVillages && fbVillages.length > 0) setVillages(fbVillages);
    });

    const unsubShelters = subscribeToShelters((fbShelters) => {
      if (fbShelters && fbShelters.length > 0) setShelters(fbShelters);
    });

    const unsubRoads = subscribeToRoads((fbRoads) => {
      if (fbRoads && fbRoads.length > 0) setRoads(fbRoads);
    });

    // WebSocket telemetry listener
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      try {
        const { type } = JSON.parse(event.data);
        if (type === 'DISASTER_SIMULATION_ACTIVE') {
          setSystemMode('SIMULATION');
          fetchData();
        } else if (type === 'ALERT_CREATED' || type === 'VILLAGE_UPDATED') {
          fetchData();
        }
      } catch { /* ignore */ }
    };

    return () => {
      unsubAlerts();
      unsubVillages();
      unsubShelters();
      unsubRoads();
      ws.close();
    };
  }, []);

  // Auto-seed Firestore on initial mount if cloud is empty
  useEffect(() => {
    if (villages.length > 0 && shelters.length > 0 && roads.length > 0) {
      seedFirestoreIfEmpty(villages, shelters, roads);
    }
  }, [villages.length, shelters.length, roads.length]);

  const handleRequestLogin = (tab: 'admin' | 'user' = 'user', msg?: string) => {
    setAuthModalTab(tab);
    setAuthModalMsg(msg);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'SUPER_ADMIN') {
      setPortalMode('authority');
    } else {
      setPortalMode('villager');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('prahari_auth_user');
    setCurrentUser(null);
    setPortalMode('villager');
  };

  const handleSwitchToAuthority = () => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      setPortalMode('authority');
    } else {
      handleRequestLogin(
        'admin', 
        'Incident Commander Portal is restricted. Super Admin credentials (adityanawale200@gmail.com) are required.'
      );
    }
  };

  // Authority Navigation definitions
  const navItems = [
    { id: 'dashboard',   label: 'Overview & Risk Summary', icon: LayoutDashboard },
    { id: 'gis-map',     label: 'GIS Terrain Map',         icon: Map },
    { id: 'forecast',    label: '7-Day Forecast',          icon: CalendarDays },
    { id: 'ai-analysis', label: 'AI Stability & FS',       icon: BarChart3 },
    { id: 'monitoring',  label: 'Sensor Telemetry',        icon: Activity },
    { id: 'alerts',      label: 'Disaster Bulletins',      icon: Bell, count: alerts.length },
    { id: 'evacuation',  label: 'Evacuation & Routing',    icon: Route },
    { id: 'analytics',   label: 'Incident Analytics',      icon: FileText },
    { id: 'firebase',    label: 'Cloud DB (Firebase)',     icon: Database },
    { id: 'settings',    label: 'System Configuration',    icon: Settings },
  ];

  // Route View Engine
  const renderActiveContent = () => {
    if (portalMode === 'villager') {
      return (
        <VillagerPortal 
          villages={villages} 
          shelters={shelters} 
          roads={roads} 
          alerts={alerts} 
          lang={lang} 
          setLang={setLang}
          currentUser={currentUser}
          onRequestLogin={(msg) => handleRequestLogin('user', msg)}
        />
      );
    }
    if (portalMode === 'volunteer') {
      return <VolunteerPortal villages={villages} shelters={shelters} lang={lang} />;
    }

    // Authority Portal (Requires Super Admin)
    if (currentUser?.role !== 'SUPER_ADMIN') {
      return (
        <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Incident Commander Login Required</h3>
          <p className="text-xs text-slate-500">
            Access to evacuation dispatches, road closures, and AI threshold overrides is restricted to authorized super administrators.
          </p>
          <button
            onClick={() => handleRequestLogin('admin', 'Please authenticate as Super Admin to continue.')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Authenticate as Super Admin
          </button>
        </div>
      );
    }

    switch (activePage) {
      case 'gis-map':
        return <RiskMap villages={villages} shelters={shelters} roads={roads} alerts={alerts} emergencyMode={systemMode === 'SIMULATION'} demoMode={systemMode === 'SIMULATION'} />;
      case 'forecast':
        return <Forecast villages={villages} />;
      case 'ai-analysis':
        return <AIAnalysis lang={lang} />;
      case 'monitoring':
        return <RiskMonitoring villages={villages} alerts={alerts} demoMode={systemMode === 'SIMULATION'} />;
      case 'alerts':
        return <AlertCenter alerts={alerts} villages={villages} hasPermission={true} onAlertUpdate={fetchData} />;
      case 'evacuation':
        return <EvacuationCenter villages={villages} shelters={shelters} roads={roads} onSelectPage={setActivePage} hasPermission={true} demoMode={systemMode === 'SIMULATION'} />;
      case 'shelters':
        return <ShelterManagement shelters={shelters} hasPermission={true} onRefresh={fetchData} demoMode={systemMode === 'SIMULATION'} />;
      case 'road-status':
        return <RoadManagement roads={roads} hasPermission={true} onRefresh={fetchData} demoMode={systemMode === 'SIMULATION'} />;
      case 'analytics':
        return <Analytics villages={villages} alerts={alerts} shelters={shelters} roads={roads} />;
      case 'firebase':
        return <FirebaseDataViewer villages={villages} shelters={shelters} roads={roads} alerts={alerts} />;
      case 'settings':
        return (
          <SettingsPage 
            demoMode={systemMode === 'SIMULATION'} 
            onRefresh={fetchData} 
            hasPermission={true}
            villages={villages}
            shelters={shelters}
            roads={roads}
            alerts={alerts}
          />
        );
      default:
        return (
          <Dashboard 
            villages={villages} 
            shelters={shelters} 
            roads={roads} 
            alerts={alerts} 
            emergencyMode={systemMode === 'SIMULATION'} 
            onSelectPage={setActivePage} 
            demoMode={systemMode === 'SIMULATION'} 
            lang={lang} 
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      <AlertSiren 
        alerts={alerts} 
        userVillageId={currentUser?.villageId} 
        portalMode={portalMode} 
      />
      
      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        customMessage={authModalMsg}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 1. Deep Forest Emerald Sidebar */}
      {portalMode === 'authority' && currentUser?.role === 'SUPER_ADMIN' && (
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

          {/* Bottom Commander Card */}
          {sidebarOpen ? (
            <div className="p-3.5 bg-[#123E30] border border-[#1C5A47] rounded-2xl text-center space-y-1.5">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h4 className="font-bold text-xs text-white">Aditya Nawale</h4>
              <p className="text-[10px] text-emerald-200">Incident Commander · Super Admin</p>
            </div>
          ) : null}

        </aside>
      )}

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-surface-border px-6 py-3 flex justify-between items-center z-20">
          
          <div className="flex items-center gap-3">
            {portalMode === 'authority' && currentUser?.role === 'SUPER_ADMIN' && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo when in Villager/Volunteer mode */}
            {(portalMode !== 'authority' || currentUser?.role !== 'SUPER_ADMIN') && (
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
            
            {/* 🟢 LIVE DATA MODE / 🟠 SIMULATION SCENARIO MODE BADGE */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-sm ${
              systemMode === 'LIVE'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-500 text-white border-amber-600 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${systemMode === 'LIVE' ? 'bg-emerald-500 animate-ping' : 'bg-white'}`} />
              <span>{systemMode === 'LIVE' ? '🟢 LIVE DATA' : '🟠 SIMULATION'}</span>
              {systemMode === 'SIMULATION' && (
                <button
                  onClick={() => { setSystemMode('LIVE'); fetchData(); }}
                  className="ml-1 px-1.5 py-0.5 rounded bg-black/20 hover:bg-black/30 text-[10px] text-white"
                  title="Return to Live Data"
                >
                  Exit Drill
                </button>
              )}
            </div>

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
                <option value="as">অসমীया (Assamese)</option>
              </select>
            </div>

            {/* Portal Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={handleSwitchToAuthority}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                  portalMode === 'authority' 
                    ? 'bg-white text-emerald-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.authorityPortal}</span>
                {currentUser?.role !== 'SUPER_ADMIN' && (
                  <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                )}
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

            {/* User Account / Super Admin Login Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
                  currentUser.role === 'SUPER_ADMIN' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.role === 'SUPER_ADMIN' ? <KeyRound className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold block">
                    {currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Resident'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRequestLogin('user', 'Sign in to confirm family safety or report localized hazards.')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In</span>
              </button>
            )}

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
