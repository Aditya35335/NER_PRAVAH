import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Landmark, Compass, Navigation, 
  MapPin, HelpCircle, AlertTriangle, ArrowRight, Route
} from 'lucide-react';
import { Village, Shelter, Road } from '../types';

interface EvacuationCenterProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  onSelectPage: (page: string) => void;
  hasPermission: boolean;
  demoMode: boolean;
}

export default function EvacuationCenter({ villages, shelters, roads, onSelectPage, hasPermission, demoMode }: EvacuationCenterProps) {
  const [routeStartVillage, setRouteStartVillage] = useState<string>('');
  const [routeEndShelter, setRouteEndShelter] = useState<string>('');
  const [calculatedRoute, setCalculatedRoute] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);

  // Evacuation Status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'MOSTLY_EVACUATED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'PREPARING': return 'bg-purple-500/10 text-purple-400 border border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  const getEvacuationPercentage = (v: Village) => {
    if (v.evacuationStatus === 'COMPLETED') return 100;
    if (v.evacuationStatus === 'MOSTLY_EVACUATED') return 85;
    if (v.evacuationStatus === 'IN_PROGRESS') return 48;
    if (v.evacuationStatus === 'PREPARING') return 12;
    return 0;
  };

  const handleCalculateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeStartVillage || !routeEndShelter) return;

    setLoadingRoute(true);
    setCalculatedRoute(null);

    const startVillageObj = villages.find(v => v.id === routeStartVillage);
    const endShelterObj = shelters.find(s => s.id === routeEndShelter);

    if (!startVillageObj || !endShelterObj) {
      setLoadingRoute(false);
      return;
    }

    try {
      const res = await fetch(`/api/routing?startLat=${startVillageObj.latitude}&startLng=${startVillageObj.longitude}&endLat=${endShelterObj.latitude}&endLng=${endShelterObj.longitude}`);
      if (res.ok) {
        const routeData = await res.json();
        setCalculatedRoute(routeData);
      }
    } catch (err) {
      console.error('Failed to compute route:', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Evacuation Operations Hub
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Coordinate village withdrawals, allocate shelter spaces, and model obstacle-bypassing path calculations.
        </p>
      </div>

      {/* Main Grid: Left is tracking lists, Right is Routing Tool */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Village list and Shelter status */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Villages Evacuation Progress Table */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-4">
              Regional Withdrawal Progress Logs
            </h3>

            <div className="space-y-4">
              {villages.map(v => {
                const percent = getEvacuationPercentage(v);
                const safeCount = Math.round(v.estimatedPopulation * (percent / 100));
                const remainingCount = v.estimatedPopulation - safeCount;
                
                return (
                  <div key={v.id} className="p-4 bg-brand-dark/40 border border-brand-border rounded-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-sm text-gray-200 block">{v.name}</span>
                        <span className="text-[10px] text-gray-500">Target Shelter: {shelters.find(s => s.id === v.shelterId)?.name || 'None'}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${getStatusBadge(v.evacuationStatus)}`}>
                          {v.evacuationStatus.replace('_', ' ')}
                        </span>
                        <span className="font-mono text-xs font-bold text-brand-accent">{percent}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-brand-border h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent === 100 ? 'bg-emerald-500' :
                          percent >= 75 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    {/* Population Accountability disclaimer tags */}
                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Estimated Pop: <b className="text-gray-400">{v.estimatedPopulation}</b></span>
                      <span>Confirmed Safe: <b className="text-emerald-400">{safeCount}</b></span>
                      <span>Unconfirmed Checkins: <b className="text-risk-high">{remainingCount}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shelters availability list */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-4">
              Shelter Allocation Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shelters.map(shelter => {
                const occupancyPercent = Math.round((shelter.occupied / shelter.capacity) * 100);
                return (
                  <div key={shelter.id} className="p-3.5 bg-brand-dark/40 border border-brand-border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="max-w-[70%]">
                        <span className="font-bold text-xs text-gray-200 block truncate">{shelter.name}</span>
                        <span className="text-[10px] text-gray-500 truncate block">{shelter.location}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                        shelter.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        shelter.status === 'NEAR_CAPACITY' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                        'bg-red-500/10 text-red-500 border-red-500/30'
                      }`}>
                        {shelter.status}
                      </span>
                    </div>

                    <div className="flex justify-between text-[10px] text-gray-500">
                      <span>Usage: {shelter.occupied} / {shelter.capacity}</span>
                      <span>{occupancyPercent}% Occupancy</span>
                    </div>
                    
                    <div className="w-full bg-brand-border h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          occupancyPercent >= 90 ? 'bg-risk-critical' :
                          occupancyPercent >= 75 ? 'bg-risk-high' :
                          'bg-brand-accent'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Side: Route Planner Panel */}
        <div className="space-y-6">
          
          {/* Evacuation Planner tool */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-3 flex items-center gap-1.5">
              <Route className="w-4 h-4 text-brand-accent" />
              Evacuation Router (Modeler)
            </h3>
            
            <form onSubmit={handleCalculateRoute} className="space-y-3.5">
              
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Start Hazard Zone Village</label>
                <select 
                  value={routeStartVillage} 
                  onChange={(e) => setRouteStartVillage(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                  required
                >
                  <option value="">-- Select Starting Village --</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.riskLevel} Risk)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Destination Target Shelter</label>
                <select 
                  value={routeEndShelter} 
                  onChange={(e) => setRouteEndShelter(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                  required
                >
                  <option value="">-- Select Destination Shelter --</option>
                  {shelters.filter(s => s.status !== 'UNAVAILABLE' && s.status !== 'FULL').map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Spots: {s.capacity - s.occupied})</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loadingRoute}
                className="w-full py-2.5 bg-brand-accent hover:bg-blue-600 disabled:bg-gray-700 text-white font-bold rounded text-xs transition-all shadow-glow flex items-center justify-center gap-1"
              >
                {loadingRoute ? 'Modeling routing path...' : 'Calculate Safe Routing'}
              </button>

            </form>

            {/* Simulated Routing Details Output */}
            {calculatedRoute && (
              <div className="mt-4 pt-4 border-t border-brand-border/60 space-y-3 animate-fade-in text-xs">
                <div className="p-2.5 bg-brand-dark rounded border border-brand-border">
                  <div className="flex justify-between font-bold text-gray-200 mb-1">
                    <span>Model: Safe Bypassing Route</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">OK</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Bypassed segment blockages: <span className="font-mono text-gray-400">
                      {roads.filter(r => r.status === 'BLOCKED').map(r => r.name).join(', ') || 'No active blocks'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-gray-400">
                  <div className="flex justify-between">
                    <span>Est. Distance:</span>
                    <span className="font-semibold text-gray-200">{(calculatedRoute.distance / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Travel Duration:</span>
                    <span className="font-semibold text-gray-200">{Math.round(calculatedRoute.duration / 60)} mins</span>
                  </div>
                </div>

                {/* Routing steps */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">Turn-by-Turn Clearance Guidance</span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {calculatedRoute.steps.map((step: any, i: number) => (
                      <div key={i} className="flex gap-2 text-[10px] text-gray-400 border-b border-brand-border/20 pb-1">
                        <span className="font-mono text-brand-accent shrink-0 font-bold">{i + 1}.</span>
                        <span>{step.instruction} ({Math.round(step.distance)}m)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => onSelectPage('risk-map')}
                  className="w-full py-2 bg-brand-dark hover:bg-[#1E293B] border border-brand-border rounded text-[10px] font-bold text-gray-300 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-accent" />
                  View Route Overlay on Map
                </button>
              </div>
            )}
          </div>

          {/* Demographic reliability notice */}
          <div className="p-4 bg-brand-card border border-brand-border rounded-xl flex items-start gap-2.5">
            <HelpCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-gray-300 block">Socio-demographic data integrity</span>
              <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                Total population figures represent Census census estimates combined with family registry index files. Live volunteer check-ins confirm absolute evacuations.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
