import React, { useState, useEffect, useRef } from 'react';
import {
  Zap, Mountain, Globe, AlertTriangle, CheckCircle2,
  CloudRain, Droplets, RefreshCw, Activity, TrendingDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Language } from '../i18n/translations';

interface SectorResult {
  sectorId: string;
  locationName: string;
  stateName: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metrics: { rainfall24h: number; soilMoisture: number; slopeAngle: number; elevation: number };
  fsParameters: {
    c_prime: number;
    gamma: number;
    gamma_w: number;
    z: number;
    h_w: number;
    theta_deg: number;
    phi_prime: number;
    FS: number;
  };
  triggerReason: string;
  recommendation: string;
  calculatedAt: string;
}

interface AIAnalysisProps {
  lang?: Language;
}

const RISK_COLOR: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH:     '#EA580C',
  MEDIUM:   '#D97706',
  LOW:      '#10B981'
};

const RISK_BG: Record<string, string> = {
  CRITICAL: 'bg-red-50 border-red-200',
  HIGH:     'bg-orange-50 border-orange-200',
  MEDIUM:   'bg-amber-50 border-amber-200',
  LOW:      'bg-emerald-50 border-emerald-200'
};

export default function AIAnalysis({ lang = 'en' }: AIAnalysisProps) {
  const [scanResults, setScanResults]       = useState<SectorResult[]>([]);
  const [loading, setLoading]               = useState(true);
  const [lastScan, setLastScan]             = useState<Date>(new Date());
  const [selectedSector, setSelectedSector] = useState<SectorResult | null>(null);
  const [history, setHistory]               = useState<any[]>([]);
  const intervalRef                         = useRef<ReturnType<typeof setInterval> | null>(null);

  // Kick off pan-India scan — auto-refresh every 30s
  const runScan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/india-scan');
      if (res.ok) {
        const data: SectorResult[] = await res.json();
        setScanResults(data);
        setLastScan(new Date());

        // Auto-select the worst sector
        const sorted = [...data].sort((a, b) => b.riskScore - a.riskScore);
        if (sorted.length > 0 && (!selectedSector || selectedSector.sectorId !== sorted[0].sectorId)) {
          setSelectedSector(sorted[0]);
        }
      }
    } catch (e) {
      console.error('[AIAnalysis] India scan failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
    intervalRef.current = setInterval(runScan, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Track history of the selected sector
  useEffect(() => {
    if (!selectedSector) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistory(prev => {
      const next = [...prev, {
        time: timeStr,
        riskScore: selectedSector.riskScore,
        FS: selectedSector.fsParameters.FS,
        rainfall: selectedSector.metrics.rainfall24h,
        soilMoisture: selectedSector.metrics.soilMoisture
      }];
      return next.slice(-15);
    });
  }, [selectedSector?.locationName, lastScan.getTime()]);

  // Only show sectors with MEDIUM or higher risk (skip quiet / plains areas)
  const riskyResults = scanResults.filter(s => s.riskScore >= 40).sort((a, b) => b.riskScore - a.riskScore);
  const safeCount    = scanResults.filter(s => s.riskScore < 40).length;

  const fs = selectedSector?.fsParameters;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900">Pan-India AI Landslide Risk Scanner</h1>
            <p className="text-xs text-slate-500 font-medium">
              Scanning 18 landslide-prone districts across India using real Open-Meteo precipitation + infinite slope FS model
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live pulse */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`}></span>
            {loading ? 'Scanning India…' : `Scanned ${scanResults.length} sectors • ${lastScan.toLocaleTimeString()}`}
          </div>

          <button
            onClick={runScan}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* India-wide status summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(level => {
          const count = scanResults.filter(s => s.riskLevel === level).length;
          return (
            <div key={level} className={`p-3.5 rounded-2xl border ${RISK_BG[level]} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{level}</span>
                <span className="text-2xl font-extrabold" style={{ color: RISK_COLOR[level] }}>{count}</span>
                <span className="text-[11px] text-slate-500 block">district{count !== 1 ? 's' : ''}</span>
              </div>
              {level === 'CRITICAL' && <AlertTriangle className="w-6 h-6 text-red-500" />}
              {level === 'HIGH'     && <Activity       className="w-6 h-6 text-orange-500" />}
              {level === 'MEDIUM'   && <CloudRain      className="w-6 h-6 text-amber-500" />}
              {level === 'LOW'      && <CheckCircle2   className="w-6 h-6 text-emerald-500" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Risky Sectors List — only shows riskScore >= 40 */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">
              🔴 At-Risk Sectors ({riskyResults.length})
            </h2>
            {safeCount > 0 && (
              <span className="text-[11px] text-emerald-600 font-bold">
                ✓ {safeCount} sectors clear
              </span>
            )}
          </div>

          {loading && riskyResults.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Globe className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
              Querying real weather data for 18 Indian sectors…
            </div>
          )}

          {riskyResults.map(sector => (
            <button
              key={sector.sectorId}
              onClick={() => setSelectedSector(sector)}
              className={`w-full text-left p-4 rounded-2xl border transition-all shadow-sm ${
                selectedSector?.sectorId === sector.sectorId
                  ? 'ring-2 ring-offset-1 ring-amber-400 ' + RISK_BG[sector.riskLevel]
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{sector.locationName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{sector.stateName}</p>
                </div>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white shrink-0"
                  style={{ backgroundColor: RISK_COLOR[sector.riskLevel] }}
                >
                  {sector.riskScore}%
                </span>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                <div className="bg-white/60 rounded-lg p-1.5 border border-slate-100">
                  <span className="text-slate-400 block">24h Rain</span>
                  <span className="font-bold text-slate-800">{sector.metrics.rainfall24h} mm</span>
                </div>
                <div className="bg-white/60 rounded-lg p-1.5 border border-slate-100">
                  <span className="text-slate-400 block">Soil Sat.</span>
                  <span className="font-bold text-slate-800">{sector.metrics.soilMoisture}%</span>
                </div>
                <div className={`rounded-lg p-1.5 border ${sector.fsParameters.FS < 1.0 ? 'bg-red-100 border-red-200' : 'bg-white/60 border-slate-100'}`}>
                  <span className="text-slate-400 block">FS</span>
                  <span className={`font-extrabold ${sector.fsParameters.FS < 1.0 ? 'text-red-700' : sector.fsParameters.FS < 1.3 ? 'text-orange-700' : 'text-emerald-700'}`}>
                    {sector.fsParameters.FS}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {!loading && riskyResults.length === 0 && (
            <div className="text-center py-10 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-emerald-700">All 18 sectors within safe parameters</p>
              <p className="text-xs text-emerald-500 mt-1">No active landslide risk detected across India right now</p>
            </div>
          )}
        </div>

        {/* RIGHT: Detail panel for selected sector */}
        <div className="lg:col-span-8 space-y-5">
          {selectedSector ? (
            <>
              {/* FS Parameters Card — shows REAL values not formulaic placeholders */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Mountain className="w-4 h-4 text-emerald-600" />
                      Infinite Slope Factor of Safety — {selectedSector.locationName}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Real computed parameters from Open-Meteo weather + GSI terrain data
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Computed: {new Date(selectedSector.calculatedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Formula */}
                <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] sm:text-xs overflow-x-auto">
                  <span className="text-slate-500">{'// Infinite Slope FS Model (NDMA standard)'}</span><br/>
                  <span>FS = [c' + (γ·z − γ_w·h_w)·cos²(θ)·tan(φ')] / [γ·z·sin(θ)·cos(θ)]</span>
                </div>

                {/* Real computed parameter values */}
                {fs && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Cohesion c'</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.c_prime} kPa</span>
                      <span className="text-[10px] text-slate-500">Colluvial soil</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Slope Angle θ</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.theta_deg}°</span>
                      <span className="text-[10px] text-slate-500">GSI terrain profile</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Friction Angle φ'</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.phi_prime}°</span>
                      <span className="text-[10px] text-slate-500">Soil friction</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Pore Water h_w</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.h_w} m</span>
                      <span className="text-[10px] text-slate-500">From {selectedSector.metrics.soilMoisture}% saturation</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Bulk Weight γ</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.gamma} kN/m³</span>
                      <span className="text-[10px] text-slate-500">Saturated laterite</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Failure Depth z</span>
                      <span className="font-extrabold text-base text-slate-900">{fs.z} m</span>
                      <span className="text-[10px] text-slate-500">Shallow translational</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">24h Rainfall</span>
                      <span className="font-extrabold text-base text-slate-900">{selectedSector.metrics.rainfall24h} mm</span>
                      <span className="text-[10px] text-slate-500">Open-Meteo real data</span>
                    </div>
                    <div className={`p-3 rounded-xl border ${fs.FS < 1.0 ? 'bg-red-50 border-red-200' : fs.FS < 1.3 ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Factor of Safety</span>
                      <span className={`font-extrabold text-2xl ${fs.FS < 1.0 ? 'text-red-700' : fs.FS < 1.3 ? 'text-orange-700' : 'text-emerald-700'}`}>
                        {fs.FS}
                      </span>
                      <span className={`text-[10px] font-bold ${fs.FS < 1.0 ? 'text-red-600' : fs.FS < 1.3 ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {fs.FS < 1.0 ? '⚠ FAILURE IMMINENT' : fs.FS < 1.1 ? 'CRITICAL MARGIN' : fs.FS < 1.3 ? 'HIGH RISK' : fs.FS < 1.5 ? 'MODERATE' : '✓ STABLE'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Trigger reason from real data */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">AI Trigger Reason (real data):</span>
                  {selectedSector.triggerReason}
                </div>
              </div>

              {/* Live history charts for selected sector */}
              {history.length > 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="font-bold text-xs text-slate-800 mb-3">Risk Score over time — {selectedSector.locationName}</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                          <defs>
                            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35}/>
                              <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                          <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8"/>
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94A3B8"/>
                          <Tooltip formatter={(v: any) => [`${v}%`, 'Risk Score']}/>
                          <Area type="monotone" dataKey="riskScore" stroke="#DC2626" strokeWidth={2.5} fill="url(#rg)" dot={false}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="font-bold text-xs text-slate-800 mb-3">Rainfall & Soil Moisture — Live Open-Meteo</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={history}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9"/>
                          <XAxis dataKey="time" tick={{ fontSize: 9 }} stroke="#94A3B8"/>
                          <YAxis tick={{ fontSize: 9 }} stroke="#94A3B8"/>
                          <Tooltip/>
                          <Bar dataKey="rainfall"    fill="#3B82F6" radius={[3,3,0,0]} name="Rainfall (mm)"/>
                          <Bar dataKey="soilMoisture" fill="#EA580C" radius={[3,3,0,0]} name="Soil Moisture (%)"/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white border border-slate-200 rounded-2xl">
              <div className="text-center text-slate-400">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30"/>
                <p className="text-sm font-medium">Select a sector to view detailed FS analysis</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
