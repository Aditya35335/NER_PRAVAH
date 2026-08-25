import React, { useState, useEffect } from 'react';
import { Radio, Database, RefreshCw, AlertTriangle, Code, ArrowRight, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { DataSource } from '../types';
import { apiHealthService, ApiHealthReport, ProviderHealthItem } from '../services/apiHealthService';

interface DataSourcesProps {
  dataSources?: DataSource[];
}

export default function DataSources({ dataSources }: DataSourcesProps) {
  const [healthReport, setHealthReport] = useState<ApiHealthReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    const report = await apiHealthService.checkHealth();
    setHealthReport(report);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'FALLBACK_ACTIVE': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'ERROR': return 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
            Real-Time Data Providers & Connectors
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Live diagnostic probing of external authoritative meteorological, elevation, and routing streams.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="px-3 py-1.5 bg-brand-card hover:bg-brand-border border border-brand-border rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Probe Endpoints</span>
        </button>
      </div>

      {/* Live Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthReport?.providers.map((p: ProviderHealthItem) => (
          <div 
            key={p.id}
            className="p-5 bg-brand-card border border-brand-border rounded-xl flex flex-col justify-between hover:border-brand-border/80 transition-all space-y-4 shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="font-bold text-xs text-gray-200 truncate font-orbitron">{p.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase block mt-0.5 font-mono">{p.type}</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${getStatusBadgeColor(p.status)}`}>
                  {p.status}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                {p.details}
              </p>
            </div>

            <div className="border-t border-brand-border/40 pt-3 flex items-center justify-between text-[10px] text-gray-500 font-mono">
              <span>Latency: <b className="text-emerald-400">{p.latencyMs}ms</b></span>
              <span>Updated: <b>{new Date(p.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* Verified Data Integrity Standards */}
      <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-3">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Data Quality & Non-Fabrication Guarantee
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          PRAHARI operates on strict mathematical and sensor integrity principles. All precipitation amounts (mm), volumetric soil moisture indices (%), and terrain elevation data (m) are collected in real-time from open scientific APIs (Open-Meteo, Google Maps Elevation API, NASA EONET) and processed through geotechnical equilibrium models. No sensor values are synthetically manufactured.
        </p>
      </div>

    </div>
  );
}
