import React, { useState } from 'react';
import { 
  Activity, CloudRain, Droplets, Compass, Landmark, 
  HelpCircle, AlertTriangle, ChevronRight, TrendingUp
} from 'lucide-react';
import { Village, Alert } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

interface RiskMonitoringProps {
  villages: Village[];
  alerts: Alert[];
  demoMode: boolean;
}

export default function RiskMonitoring({ villages, alerts, demoMode }: RiskMonitoringProps) {
  const [selectedVillageId, setSelectedVillageId] = useState<string>(villages[0]?.id || '');
  
  const selectedVillage = villages.find(v => v.id === selectedVillageId);

  // Generate realistic historical charts trend data based on the village risk level
  const generateTrendData = (village: Village | undefined) => {
    if (!village) return [];
    
    // We create a mock historical sequence leading up to the current value
    const base = village.riskScore;
    return [
      { name: '04:00', risk: Math.max(10, Math.round(base * 0.45)), rain: Math.max(2, Math.round(village.rainfall * 0.3)), moisture: Math.max(15, Math.round(village.soilMoisture * 0.5)) },
      { name: '08:00', risk: Math.max(15, Math.round(base * 0.62)), rain: Math.max(5, Math.round(village.rainfall * 0.5)), moisture: Math.max(25, Math.round(village.soilMoisture * 0.65)) },
      { name: '12:00', risk: Math.max(25, Math.round(base * 0.78)), rain: Math.max(10, Math.round(village.rainfall * 0.75)), moisture: Math.max(35, Math.round(village.soilMoisture * 0.82)) },
      { name: '16:00', risk: Math.max(30, Math.round(base * 0.85)), rain: Math.max(15, Math.round(village.rainfall * 0.9)), moisture: Math.max(40, Math.round(village.soilMoisture * 0.95)) },
      { name: '20:00', risk: base, rain: village.rainfall, moisture: village.soilMoisture }
    ];
  };

  const trendData = generateTrendData(selectedVillage);

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-risk-critical text-white';
      case 'HIGH': return 'bg-risk-high text-white';
      case 'MEDIUM': return 'bg-risk-medium text-black';
      default: return 'bg-risk-low text-white';
    }
  };

  // Mathematical logic explanation helper
  const explainRiskLogic = (village: Village | undefined) => {
    if (!village) return '';
    const factors = [];
    if (village.rainfall > 70) factors.push('Severe precipitation overload saturated soil friction');
    else if (village.rainfall > 35) factors.push('Elevated monsoon showers trigger slope fluidization');
    if (village.soilMoisture > 75) factors.push('Subsurface soil moisture saturation reduces sheer strength');
    if (village.slope > 35) factors.push('High relief slope gradient increases gravity load pull');
    
    return factors.join(' and ') || 'Normal background geological parameters.';
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Landslide Risk & Hydrology Monitor
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Early Warning advisory telemetry. Calculations update dynamically based on live sensor streams.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Village Selection Sidebar List */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Select Sector Monitor</h3>
          <div className="space-y-1.5 overflow-y-auto max-h-[500px]">
            {villages.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVillageId(v.id)}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-3 ${
                  selectedVillageId === v.id 
                    ? 'bg-brand-accent/10 border-brand-accent text-gray-100 shadow-sm' 
                    : 'bg-brand-dark/50 border-brand-border hover:bg-brand-card text-gray-400'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block text-gray-200">{v.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">Score: {v.riskScore}%</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  v.riskLevel === 'CRITICAL' ? 'bg-risk-critical/20 text-risk-critical' :
                  v.riskLevel === 'HIGH' ? 'bg-risk-high/20 text-risk-high' :
                  v.riskLevel === 'MEDIUM' ? 'bg-risk-medium/20 text-risk-medium' :
                  'bg-risk-low/20 text-risk-low'
                }`}>
                  {v.riskLevel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Core Monitoring Content */}
        {selectedVillage ? (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sector Summary Card */}
            <div className="p-5 bg-brand-card border border-brand-border rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="border-r border-brand-border/60 pr-2">
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">MONITORED REGION</span>
                <h3 className="font-bold text-lg text-gray-100 mt-1 leading-snug">{selectedVillage.name}</h3>
                <span className="text-[10px] text-brand-accent block mt-1">ID: {selectedVillage.id.toUpperCase()}</span>
              </div>

              <div className="border-r border-brand-border/60 px-2 md:text-center">
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">RISK SCORE</span>
                <div className="text-4xl font-extrabold font-orbitron tracking-tight mt-1 text-gray-200">
                  {selectedVillage.riskScore}%
                </div>
                <span className="text-[9px] text-gray-500">Advisory Index Level</span>
              </div>

              <div className="border-r border-brand-border/60 px-2 md:text-center">
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">CLASSIFICATION</span>
                <div className="mt-2.5">
                  <span className={`px-3 py-1.5 rounded text-xs font-bold ${getRiskBadgeColor(selectedVillage.riskLevel)}`}>
                    {selectedVillage.riskLevel}
                  </span>
                </div>
              </div>

              <div className="px-2">
                <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wider">HISTORIC OVERALL RISK</span>
                <div className="text-sm font-bold text-gray-300 mt-1">Slightly Susceptible</div>
                <span className="text-[9px] text-gray-500">Historical records log: 1 slide incident</span>
              </div>

            </div>

            {/* Recharts Graphical Trends */}
            <div className="p-5 bg-brand-card border border-brand-border rounded-xl">
              <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-accent" />
                24-Hour Telemetry Trend Analysis
              </h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233050" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" fontSize={10} domain={[0, 100]} />
                    <ChartTooltip 
                      contentStyle={{ backgroundColor: '#161D30', borderColor: '#233050', borderRadius: '8px' }}
                      labelStyle={{ color: '#E5E7EB', fontWeight: 'bold' }}
                    />
                    <Area name="Calculated Risk %" type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRisk)" />
                    <Area name="Rainfall (mm)" type="monotone" dataKey="rain" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRain)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Contributing factors grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Rain telemetry */}
              <div className="p-4 bg-brand-card border border-brand-border rounded-xl flex gap-3">
                <div className="w-10 h-10 rounded bg-[#10B981]/10 flex items-center justify-center text-risk-low shrink-0">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">PRECIPITATION INDEX</span>
                  <div className="text-xl font-bold font-mono text-gray-200 mt-0.5">{selectedVillage.rainfall} mm</div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">24-hour total bucket gauges. Saturated soils triggered at 70mm.</p>
                </div>
              </div>

              {/* Moisture telemetry */}
              <div className="p-4 bg-brand-card border border-brand-border rounded-xl flex gap-3">
                <div className="w-10 h-10 rounded bg-brand-accent/10 flex items-center justify-center text-brand-accent shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">SOIL SATURATION</span>
                  <div className="text-xl font-bold font-mono text-gray-200 mt-0.5">{selectedVillage.soilMoisture}%</div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Ground piezometer sensors. Friction reduction triggers at 75%.</p>
                </div>
              </div>

              {/* Slope parameters */}
              <div className="p-4 bg-brand-card border border-brand-border rounded-xl flex gap-3">
                <div className="w-10 h-10 rounded bg-risk-medium/10 flex items-center justify-center text-risk-medium shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase">SLOPE RELIEF</span>
                  <div className="text-xl font-bold font-mono text-gray-200 mt-0.5">{selectedVillage.slope}°</div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Digital elevation radar. Critical gravity shear begins above 35°.</p>
                </div>
              </div>

            </div>

            {/* AI Warning Logic Explanation */}
            <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-3">
              <h4 className="font-bold text-xs uppercase text-gray-300 font-orbitron">AI Risk Engine Advisory Explanation</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Risk score increased because of: <span className="text-gray-200 font-semibold">{explainRiskLogic(selectedVillage)}</span>. 
                Our neural models calculate dynamic weights based on terrain, soil saturation, and local hydrology.
              </p>
              
              <div className="p-4 bg-brand-dark/50 border border-brand-border rounded-lg flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-gray-200 block">Uncertainty Mitigation Statement</span>
                  <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">
                    Landslide warnings calculated via machine learning engines are predictive alerts representing probability, not physical guarantees. Physical observations (cracking sound waves, water discharges) must be cross-verified by village volunteers.
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-3 p-12 text-center border border-dashed border-brand-border rounded-xl">
            <Activity className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-xs text-gray-500">Select a village from the sidebar to load analytical trends.</p>
          </div>
        )}

      </div>

    </div>
  );
}
