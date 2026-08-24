import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Village, Shelter, Alert, Road } from '../types';
import { BarChart3, TrendingUp, Landmark, ShieldAlert } from 'lucide-react';

interface AnalyticsProps {
  villages: Village[];
  alerts: Alert[];
  shelters: Shelter[];
  roads: Road[];
}

export default function Analytics({ villages, alerts, shelters, roads }: AnalyticsProps) {
  
  // 1. Evacuation progress data
  const evacData = villages.map(v => {
    let percent = 0;
    if (v.evacuationStatus === 'COMPLETED') percent = 100;
    else if (v.evacuationStatus === 'MOSTLY_EVACUATED') percent = 85;
    else if (v.evacuationStatus === 'IN_PROGRESS') percent = 48;
    else if (v.evacuationStatus === 'PREPARING') percent = 12;
    
    return {
      name: v.name.split(' ')[0], // short name
      'Evacuation Completion %': percent,
      'Remaining Pop': v.estimatedPopulation - Math.round(v.estimatedPopulation * (percent / 100))
    };
  });

  // 2. Shelter Occupancy Load data
  const shelterData = shelters.map(s => ({
    name: s.name.substring(0, 14) + '...',
    'Occupied Slots': s.occupied,
    'Remaining Capacity': s.capacity - s.occupied
  }));

  // 3. District risk count data
  const districtCounts: Record<string, number> = {};
  villages.forEach(v => {
    districtCounts[v.districtId] = (districtCounts[v.districtId] || 0) + v.riskScore;
  });
  
  const districtData = Object.keys(districtCounts).map(key => {
    const matchingVillages = villages.filter(v => v.districtId === key);
    const avgScore = Math.round(districtCounts[key] / matchingVillages.length);
    return {
      name: key === 'east-khasi-hills' ? 'East Khasi Hills' : key === 'east-sikkim' ? 'East Sikkim' : 'Lunglei',
      'Avg Risk Index %': avgScore
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Command Center Analytics
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Region-wide performance indicators, shelter load balancing analytics, and village metrics comparison.
        </p>
      </div>

      {/* Grid of charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Evacuation progress */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-accent" />
            Evacuation Completeness by Village Sector
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evacData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233050" opacity={0.2} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} />
                <YAxis stroke="#9CA3AF" fontSize={9} domain={[0, 100]} />
                <ChartTooltip contentStyle={{ backgroundColor: '#161D30', borderColor: '#233050', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Evacuation Completion %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Shelter occupied vs capacity */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-emerald-400" />
            Relief Shelter Load Allocation
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shelterData} stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" stroke="#233050" opacity={0.2} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={8} />
                <YAxis stroke="#9CA3AF" fontSize={9} />
                <ChartTooltip contentStyle={{ backgroundColor: '#161D30', borderColor: '#233050', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Occupied Slots" stackId="a" fill="#10B981" />
                <Bar dataKey="Remaining Capacity" stackId="a" fill="#233050" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: District risk averages */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-risk-high" />
            Average Risk Level comparison by District
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#233050" opacity={0.2} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                <YAxis stroke="#9CA3AF" fontSize={9} domain={[0, 100]} />
                <ChartTooltip contentStyle={{ backgroundColor: '#161D30', borderColor: '#233050', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Avg Risk Index %" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick analytics card */}
        <div className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-accent" />
              Regional Structural Metrics
            </h3>
            
            <div className="space-y-3 mt-4 text-xs text-gray-400">
              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span>Active Highway Blockages:</span>
                <span className="font-bold text-risk-critical font-mono">
                  {roads.filter(r => r.status === 'BLOCKED').length} segments
                </span>
              </div>

              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span>Severe Warning Sectors:</span>
                <span className="font-bold text-risk-high font-mono">
                  {villages.filter(v => v.riskLevel === 'HIGH' || v.riskLevel === 'CRITICAL').length} villages
                </span>
              </div>

              <div className="flex justify-between border-b border-brand-border/40 pb-2">
                <span>Average Regional Soil Moisture:</span>
                <span className="font-bold text-brand-accent font-mono">
                  {Math.round(villages.reduce((sum, v) => sum + v.soilMoisture, 0) / villages.length)}% index
                </span>
              </div>

              <div className="flex justify-between">
                <span>Average Regional Slope degrees:</span>
                <span className="font-bold text-gray-200 font-mono">
                  {Math.round(villages.reduce((sum, v) => sum + v.slope, 0) / villages.length)}° gradients
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-brand-dark rounded text-[11px] text-gray-500 leading-relaxed">
            ⚠️ Statistical summaries are aggregated dynamically. These observations help coordinate logistics clears but do not substitute site inspection engineering logs.
          </div>
        </div>

      </div>

    </div>
  );
}
