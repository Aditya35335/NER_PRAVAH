import React, { useState } from 'react';
import { 
  Users, CheckCircle2, Landmark, Compass, Navigation, 
  MapPin, HelpCircle, AlertTriangle, ArrowRight, Route,
  ShieldAlert, ShieldCheck, Flame, Send
} from 'lucide-react';
import { Village, Shelter, Road } from '../types';
import { issueEvacuationOrderInFirestore } from '../firebase';

interface EvacuationCenterProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  onSelectPage: (page: string) => void;
  hasPermission: boolean;
  demoMode: boolean;
}

export default function EvacuationCenter({ villages, shelters, roads, onSelectPage, hasPermission, demoMode }: EvacuationCenterProps) {
  const [routeStartVillage, setRouteStartVillage] = useState<string>(villages[0]?.id || 'mawsynram');
  const [routeEndShelter, setRouteEndShelter] = useState<string>(shelters[0]?.id || 'mawsynram-relief');
  const [calculatedRoute, setCalculatedRoute] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState<boolean>(false);
  const [orderingVillageId, setOrderingVillageId] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Evacuation Status styling
  const getStatusBadge = (v: Village) => {
    const isUnderOrder = v.evacuationStatus === 'IN_PROGRESS' || (v as any).evacuationOrderActive;
    if (isUnderOrder) return 'bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse';
    if (v.evacuationStatus === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    return 'bg-slate-800 text-slate-400 border border-slate-700';
  };

  const handleIssueEvacOrder = async (villageId: string, villageName: string) => {
    setOrderingVillageId(villageId);
    setOrderSuccess(null);
    try {
      await issueEvacuationOrderInFirestore(
        villageId,
        'Aditya Nawale (Incident Commander)',
        'Severe rainfall and unstable factor of safety threshold breach'
      );
      setOrderSuccess(`Official Evacuation Order issued for ${villageName}. Cloud alerts dispatched.`);
    } catch (e) {
      console.warn(e);
    } finally {
      setOrderingVillageId(null);
    }
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
      const res = await fetch(`/api/routing?startLat=${startVillageObj.latitude}&startLng=${startVillageObj.longitude}&shelterId=${endShelterObj.id}`);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
            Emergency Evacuation & Route Modeler
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time turn-by-turn road navigation via Google Directions & OSRM with automatic landslide hazard detour solving.
          </p>
        </div>
      </div>

      {orderSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{orderSuccess}</span>
        </div>
      )}

      {/* Main Grid: Sector Status (Left) + Google Directions Route Modeler (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sector Status & Shelter Occupancy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Sectors Table */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron flex items-center justify-between">
              <span>Monitored Sectors & Evacuation Readiness</span>
              <span className="text-[10px] text-gray-500 font-mono">{villages.length} Sectors</span>
            </h3>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {villages.map(v => {
                const isUnderOrder = v.evacuationStatus === 'IN_PROGRESS' || (v as any).evacuationOrderActive;
                return (
                  <div 
                    key={v.id}
                    className="p-3.5 bg-brand-dark border border-brand-border/80 rounded-xl flex items-center justify-between gap-3 hover:border-brand-border transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-200">{v.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${getStatusBadge(v)}`}>
                          {isUnderOrder ? '🚨 EVACUATION ORDER ACTIVE' : 'SURVEILLANCE'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">
                        Pop: <b>{v.estimatedPopulation || 0}</b> • Slope: <b>{v.slope}°</b> • Rain: <b>{v.rainfall}mm</b>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isUnderOrder ? (
                        <button
                          onClick={() => handleIssueEvacOrder(v.id, v.name)}
                          disabled={orderingVillageId === v.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold shadow-sm transition-all"
                        >
                          {orderingVillageId === v.id ? 'Issuing...' : 'Issue Evac Order'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Order Issued
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Relief Shelters List */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron">
              Designated District Relief Shelters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {shelters.map(s => {
                const avail = Math.max(0, s.capacity - s.occupied);
                const pct = Math.round((s.occupied / s.capacity) * 100);
                return (
                  <div key={s.id} className="p-3 bg-brand-dark border border-brand-border rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-gray-200 truncate">{s.name}</h4>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">{avail} Spots Free</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-500 flex justify-between font-mono">
                      <span>Occ: {s.occupied}/{s.capacity}</span>
                      <span>{s.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Google Directions Route Solver (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
              <Route className="w-4 h-4 text-blue-400" />
              <span>Google Maps Evacuation Router</span>
            </h3>

            <form onSubmit={handleCalculateRoute} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Starting Danger Sector</label>
                <select
                  value={routeStartVillage}
                  onChange={(e) => setRouteStartVillage(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.riskLevel} Risk)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Target Relief Shelter</label>
                <select
                  value={routeEndShelter}
                  onChange={(e) => setRouteEndShelter(e.target.value)}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl py-2 px-3 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
                >
                  {shelters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.capacity - s.occupied} available)</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingRoute}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4" />
                <span>{loadingRoute ? 'Querying Road Network...' : 'Compute Safe Evacuation Route'}</span>
              </button>
            </form>

            {/* Calculated Turn-by-Turn Route Results */}
            {calculatedRoute && (
              <div className="mt-4 pt-4 border-t border-brand-border/80 space-y-3 text-xs animate-fade-in">
                <div className="p-3 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Total Distance</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {(calculatedRoute.distance / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block">Est. Travel Time</span>
                    <span className="text-base font-extrabold text-emerald-400 font-mono">
                      {Math.round(calculatedRoute.duration / 60)} mins
                    </span>
                  </div>
                </div>

                {/* Step-by-Step Maneuvers */}
                {calculatedRoute.steps && calculatedRoute.steps.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Turn-by-Turn Safe Maneuvers
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {calculatedRoute.steps.map((step: any, i: number) => (
                        <div key={i} className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-300 flex items-start gap-2">
                          <span className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p>{step.instruction}</p>
                            <span className="text-[9px] text-slate-500 font-mono">{step.distance}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
