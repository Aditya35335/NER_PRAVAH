import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, ShieldCheck, Play, RefreshCw, 
  HelpCircle, AlertTriangle, Cpu, Sliders, CheckCircle2 
} from 'lucide-react';

interface SettingsPageProps {
  demoMode: boolean;
  onRefresh: () => void;
  hasPermission: boolean;
}

export default function SettingsPage({ demoMode, onRefresh, hasPermission }: SettingsPageProps) {
  // Key state variables
  const [keys, setKeys] = useState<any>({
    IMD_API_KEY: '',
    WEATHER_API_KEY: '',
    SATELLITE_API_KEY: '',
    BHUVAN_API_KEY: '',
    MAP_API_KEY: '',
    ROUTING_API_KEY: '',
    SMS_API_KEY: '',
    FIREBASE_CONFIG: '',
    ML_API_URL: '',
  });

  const [maskedKeys, setMaskedKeys] = useState<any>({});
  const [providers, setProviders] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'demo' | 'api'>('demo');
  
  // Custom demo variables
  const [selectedVillageId, setSelectedVillageId] = useState<string>('sohra');
  const [customRain, setCustomRain] = useState<number>(35);
  const [customMoisture, setCustomMoisture] = useState<number>(55);
  const [riskSimulationLoading, setRiskSimulationLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');

  const [savingKeys, setSavingKeys] = useState<boolean>(false);
  const [togglingMode, setTogglingMode] = useState<boolean>(false);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setMaskedKeys(data.keys);
        setProviders(data.providers);
      }
    } catch (e) {
      console.error('Failed to query config variables:', e);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({
      ...keys,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingKeys(true);
    try {
      // Keep only filled fields to not overwrite existing keys with empty strings
      const payload: Record<string, string> = {};
      Object.keys(keys).forEach(k => {
        if (keys[k]) payload[k] = keys[k];
      });

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchConfig();
        setKeys({
          IMD_API_KEY: '',
          WEATHER_API_KEY: '',
          SATELLITE_API_KEY: '',
          BHUVAN_API_KEY: '',
          MAP_API_KEY: '',
          ROUTING_API_KEY: '',
          SMS_API_KEY: '',
          FIREBASE_CONFIG: '',
          ML_API_URL: '',
        });
        setTestResult('Credentials saved successfully. Test connection to verify APIs.');
      }
    } catch (err) {
      console.error(err);
      setTestResult('Failed to save API parameters.');
    } finally {
      setSavingKeys(false);
    }
  };

  // Toggle Live vs. Demo mode (The One-Click Live Mode Activation)
  const handleToggleLiveMode = async (activate: boolean) => {
    setTogglingMode(true);
    setTestResult('');
    try {
      const res = await fetch('/api/config/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activate })
      });
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers);
        onRefresh();
        
        if (activate) {
          const successes = Object.keys(data.providers).filter(k => data.providers[k].connected);
          const failures = Object.keys(data.providers).filter(k => !data.providers[k].connected);
          setTestResult(
            `Connection test run: ${successes.length} APIs successfully connected, ${failures.length} fallbacks remaining in Demo mode.`
          );
        } else {
          setTestResult('Deactivated Live mode. All streams set back to Simulated/Demo data.');
        }
      }
    } catch (e) {
      setTestResult('Connection handshake failed.');
    } finally {
      setTogglingMode(false);
    }
  };

  // Preset Trigger Simulation
  const triggerPreset = async (presetType: 'normal' | 'medium' | 'high' | 'critical') => {
    setRiskSimulationLoading(true);
    let rain = 15;
    let moisture = 40;
    
    if (presetType === 'medium') {
      rain = 48;
      moisture = 60;
    } else if (presetType === 'high') {
      rain = 85;
      moisture = 76;
    } else if (presetType === 'critical') {
      rain = 145;
      moisture = 89;
    }

    setCustomRain(rain);
    setCustomMoisture(moisture);

    try {
      const res = await fetch(`/api/villages/${selectedVillageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall: rain,
          soilMoisture: moisture
        })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRiskSimulationLoading(false);
    }
  };

  // Custom sliders modifier
  const applyCustomAdvisory = async () => {
    setRiskSimulationLoading(true);
    try {
      const res = await fetch(`/api/villages/${selectedVillageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall: Number(customRain),
          soilMoisture: Number(customMoisture)
        })
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRiskSimulationLoading(false);
    }
  };

  const activeProvidersList = Object.keys(providers);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          System Control & Integrations
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Perform API handshakes, toggle active data streams, or run the hackathon presentation controller.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 border-b border-brand-border/60 pb-px">
        <button 
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'demo' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Hackathon Simulator Controller
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'api' ? 'border-b-2 border-brand-accent text-brand-accent' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Key className="w-4 h-4" />
          API Credential management
        </button>
      </div>

      {/* Tab: Hackathon Simulator */}
      {activeTab === 'demo' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Preset Buttons */}
          <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl p-5 space-y-6">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-2">
                Hackathon Presentation flow simulator
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Step through simulated weather events. Raising rainfall parameters triggers AI warning logs, creates critical overlays on the GIS maps, and automatically models bypass routes.
              </p>
            </div>

            {/* Select Village target */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Simulator Village</label>
              <select 
                value={selectedVillageId} 
                onChange={(e) => setSelectedVillageId(e.target.value)}
                className="w-full max-w-sm bg-brand-dark border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="sohra">Sohra (Cherrapunjee)</option>
                <option value="mawsynram">Mawsynram Village</option>
                <option value="pakyong">Pakyong Foothills</option>
                <option value="rongli">Rongli Valley</option>
                <option value="theiriat">Theiriat Slopes</option>
              </select>
            </div>

            {/* Preset grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Normal */}
              <button 
                onClick={() => triggerPreset('normal')}
                disabled={riskSimulationLoading}
                className="p-4 bg-brand-dark hover:bg-brand-card border border-brand-border rounded-lg text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-emerald-400">1. Normal Conditions</span>
                  <span className="text-[9px] px-1 bg-emerald-500/10 text-emerald-400 rounded">LOW RISK</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Sets Rain: 15mm, Moisture: 40%. Status: Stable conditions.</p>
              </button>

              {/* Medium */}
              <button 
                onClick={() => triggerPreset('medium')}
                disabled={riskSimulationLoading}
                className="p-4 bg-brand-dark hover:bg-brand-card border border-brand-border rounded-lg text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-amber-500">2. Trigger Rain Spike</span>
                  <span className="text-[9px] px-1 bg-amber-500/10 text-amber-500 rounded">MEDIUM RISK</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Sets Rain: 48mm, Moisture: 60%. Status: Watch active.</p>
              </button>

              {/* High */}
              <button 
                onClick={() => triggerPreset('high')}
                disabled={riskSimulationLoading}
                className="p-4 bg-brand-dark hover:bg-brand-card border border-brand-border rounded-lg text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-orange-500">3. Surge High Danger</span>
                  <span className="text-[9px] px-1 bg-orange-500/10 text-orange-500 rounded">HIGH RISK</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Sets Rain: 85mm, Moisture: 76%. Triggers: Warning Alert, Evac Preps.</p>
              </button>

              {/* Critical */}
              <button 
                onClick={() => triggerPreset('critical')}
                disabled={riskSimulationLoading}
                className="p-4 bg-brand-dark hover:bg-brand-card border border-brand-border rounded-lg text-left transition-all hover:scale-[1.01] shadow-glow-red/20"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-red-500">4. Activate Critical Slide Risk</span>
                  <span className="text-[9px] px-1 bg-red-500/10 text-red-500 rounded">CRITICAL RISK</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Sets Rain: 145mm, Moisture: 89%. Actions: Broadcast, force Emergency Mode.</p>
              </button>

            </div>

            {/* Custom Sliders for manual presenters */}
            <div className="border-t border-brand-border/60 pt-4 space-y-4">
              <h4 className="font-bold text-xs text-gray-300 font-orbitron">Interactive Variable Sliders</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-400">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Precipitation (mm):</span>
                    <span className="font-bold text-gray-200">{customRain} mm</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={customRain} 
                    onChange={(e) => setCustomRain(Number(e.target.value))}
                    className="w-full accent-brand-accent bg-[#1E293B] h-1 rounded-full cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span>Soil moisture Index (%):</span>
                    <span className="font-bold text-gray-200">{customMoisture}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={customMoisture} 
                    onChange={(e) => setCustomMoisture(Number(e.target.value))}
                    className="w-full accent-brand-accent bg-[#1E293B] h-1 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={applyCustomAdvisory}
                  disabled={riskSimulationLoading}
                  className="px-5 py-2 bg-brand-accent hover:bg-blue-600 disabled:bg-gray-700 text-white font-bold rounded text-xs transition-all shadow-glow"
                >
                  {riskSimulationLoading ? 'Simulating sensor triggers...' : 'Broadcast custom variables'}
                </button>
              </div>
            </div>

          </div>

          {/* Sidebar Status of active layers */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-4">
                Telemetry Handshakes
              </h3>

              <div className="space-y-3">
                {activeProvidersList.map((pKey) => {
                  const p = providers[pKey];
                  return (
                    <div key={pKey} className="flex justify-between items-center text-xs pb-2 border-b border-brand-border/40">
                      <div>
                        <span className="font-semibold text-gray-300 block">{p.name}</span>
                        <span className="text-[9px] font-mono text-gray-500">Provider: {p.source === 'LIVE' ? 'Live' : 'Demo'}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${
                        demoMode ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        p.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {demoMode ? 'DEMO' : (p.connected ? 'LIVE' : 'OFFLINE')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 bg-brand-dark border border-brand-border rounded-lg text-xs leading-relaxed text-gray-500 mt-6">
              💡 Presentation Tip: Select **Mawsynram** or **Sohra**, hit the **Critical** warning button, and open the Map or Mobile view to see warning animations.
            </div>
          </div>

        </div>
      )}

      {/* Tab: API Credentials Management */}
      {activeTab === 'api' && (
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-6">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-2">
              Credentials Override Panel
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Administrators can configure connection credentials. When a key is present and passes connection checks, the portal automatically promotes its source layer to LIVE. Masked tags are displayed for safety.
            </p>
          </div>

          {/* Test results alert */}
          {testResult && (
            <div className="p-4 bg-brand-dark/50 border border-brand-accent/20 rounded-lg flex items-start gap-2.5 text-xs text-gray-300 animate-slide-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Buttons to Activate Live Data */}
          <div className="flex flex-wrap gap-3 p-4 bg-brand-dark/30 border border-brand-border rounded-lg">
            {demoMode ? (
              <button 
                onClick={() => handleToggleLiveMode(true)}
                disabled={togglingMode}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-white font-bold text-xs rounded transition-all shadow-glow-green"
              >
                {togglingMode ? 'Validating API handshakes...' : 'ACTIVATE LIVE DATA'}
              </button>
            ) : (
              <button 
                onClick={() => handleToggleLiveMode(false)}
                disabled={togglingMode}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 text-white font-bold text-xs rounded transition-all shadow-glow-yellow"
              >
                {togglingMode ? 'Deactivating live streams...' : 'REVERT TO DEMO MODE'}
              </button>
            )}
            
            <div className="text-[10px] text-gray-500 flex items-center">
              Current state: <b className={`ml-1 font-mono uppercase ${demoMode ? 'text-amber-500' : 'text-emerald-500'}`}>{demoMode ? 'Demo Mode On' : 'Live mode active'}</b>
            </div>
          </div>

          {/* Credentials Form */}
          {hasPermission ? (
            <form onSubmit={handleSaveKeys} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">IMD_API_KEY (Indian Meteorology)</label>
                <input 
                  type="password" 
                  name="IMD_API_KEY" 
                  value={keys.IMD_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.IMD_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">WEATHER_API_KEY (OpenWeather)</label>
                <input 
                  type="password" 
                  name="WEATHER_API_KEY" 
                  value={keys.WEATHER_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.WEATHER_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">SATELLITE_API_KEY (Copernicus)</label>
                <input 
                  type="password" 
                  name="SATELLITE_API_KEY" 
                  value={keys.SATELLITE_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.SATELLITE_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">BHUVAN_API_KEY (ISRO)</label>
                <input 
                  type="password" 
                  name="BHUVAN_API_KEY" 
                  value={keys.BHUVAN_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.BHUVAN_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">MAP_API_KEY (OSM/Mapbox tiles)</label>
                <input 
                  type="password" 
                  name="MAP_API_KEY" 
                  value={keys.MAP_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.MAP_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ROUTING_API_KEY (OSRM Engine)</label>
                <input 
                  type="password" 
                  name="ROUTING_API_KEY" 
                  value={keys.ROUTING_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.ROUTING_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">SMS_API_KEY (NIC Government SMS)</label>
                <input 
                  type="password" 
                  name="SMS_API_KEY" 
                  value={keys.SMS_API_KEY} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.SMS_API_KEY || 'Enter new key...'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ML_API_URL (Python FastAPI prediction URL)</label>
                <input 
                  type="text" 
                  name="ML_API_URL" 
                  value={keys.ML_API_URL} 
                  onChange={handleKeyChange}
                  placeholder={maskedKeys.ML_API_URL || 'e.g. http://127.0.0.1:8000'}
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingKeys}
                  className="px-5 py-2.5 bg-brand-accent hover:bg-blue-600 text-white font-bold rounded text-xs transition-all shadow-glow"
                >
                  {savingKeys ? 'Saving overridden parameters...' : 'Override API Parameters'}
                </button>
              </div>

            </form>
          ) : (
            <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-lg text-xs leading-relaxed text-gray-500">
              ⚠️ Role restricted. Only accounts carrying **SUPER ADMIN** or **DISTRICT AUTHORITY** configurations are authorized to modify production API credentials. Use the header swap menu to switch roles.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
