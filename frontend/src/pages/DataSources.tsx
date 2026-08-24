import React from 'react';
import { Radio, Database, RefreshCw, AlertTriangle, Code, ArrowRight, ShieldCheck } from 'lucide-react';
import { DataSource } from '../types';

interface DataSourcesProps {
  dataSources: DataSource[];
}

export default function DataSources({ dataSources }: DataSourcesProps) {
  
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'CONNECTED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'DEMO_MODE': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      case 'ERROR': return 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse';
      default: return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    }
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/villages',
      desc: 'Retrieves all regional monitored villages, including current soil moisture, rainfall intensity, and risk score indices.',
      req: 'None',
      res: '[\n  {\n    "id": "mawsynram",\n    "name": "Mawsynram Village",\n    "riskScore": 92,\n    "riskLevel": "CRITICAL",\n    "soilMoisture": 88,\n    "rainfall": 145,\n    "latitude": 25.298,\n    "longitude": 91.582\n  }\n]',
      auth: 'None',
      provider: 'SQLite / JsonDB Server'
    },
    {
      method: 'POST',
      path: '/api/predictions',
      desc: 'Connects to python ML FastAPI microservice. Validates soil parameters to return risk scoring indices and contributing warnings factors.',
      req: '{\n  "rainfall": 82,\n  "soilMoisture": 78,\n  "slope": 42,\n  "elevation": 850,\n  "historicalRisk": 0.72\n}',
      res: '{\n  "riskScore": 87,\n  "riskLevel": "HIGH",\n  "confidence": 0.91,\n  "factors": [\n    "Heavy rainfall",\n    "High soil moisture",\n    "Steep slope"\n  ]\n}',
      auth: 'Admin/API Configured Key',
      provider: 'Tensorflow/Python ML Core'
    },
    {
      method: 'POST',
      path: '/api/notifications/send',
      desc: 'NIC warning broadcast API. Triggers mass text alerts warning citizens of critical risk paths.',
      req: '{\n  "recipient": "+919436XXXXXX",\n  "message": "🚨 CRITICAL LANDSLIDE WARNING: Evacuate immediately to Government School.",\n  "channel": "SMS"\n}',
      res: '{\n  "success": true,\n  "messageId": "live-sms-171345512213",\n  "provider": "LiveNotificationProvider"\n}',
      auth: 'Disaster Officer Role Token',
      provider: 'NIC SMS Gateway / Twilio'
    },
    {
      method: 'GET',
      path: '/api/routing',
      desc: 'OSRM routing engine hook. Synthesizes start/end nodes and blockages list to calculate safe travel coordinate segments.',
      req: 'GET ?startLat=25.29&startLng=91.58&endLat=25.32&endLng=91.61',
      res: '{\n  "coordinates": [[25.298, 91.582], [25.305, 91.590], [25.312, 91.608]],\n  "distance": 3200,\n  "duration": 480,\n  "steps": [\n    { "instruction": "Proceed north-east onto primary evacuation lane", "distance": 1200 }\n  ]\n}',
      auth: 'None (Public advisory)',
      provider: 'OSRM Project Router'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Telemetry & Data Connectors
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Monitor connection health, inspect data freshness timelines, and view server API endpoints mapping.
        </p>
      </div>

      {/* Connection status cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dataSources.map(ds => (
          <div 
            key={ds.id}
            className="p-5 bg-brand-card border border-brand-border rounded-xl flex flex-col justify-between hover:border-brand-border/80 transition-all space-y-4 shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="max-w-[70%]">
                  <h3 className="font-bold text-xs text-gray-200 truncate font-orbitron">{ds.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase block mt-0.5">Type: {ds.type}</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${getStatusBadgeColor(ds.status)}`}>
                  {ds.status.replace('_', ' ')}
                </span>
              </div>

              <div className="text-[11px] text-gray-400 mt-3 space-y-1">
                <div>Data Source Mode: <b className="text-gray-300 font-mono text-[10px]">{ds.mode}</b></div>
                <div>Loaded Provider: <span className="text-gray-400 font-mono text-[10px]">{ds.provider}</span></div>
              </div>
            </div>

            <div className="border-t border-brand-border/40 pt-3 flex items-center justify-between text-[10px] text-gray-500">
              <span>Freshness: <b>{ds.freshness}</b></span>
              <span>Updated: <b>{new Date(ds.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</b></span>
            </div>
          </div>
        ))}
      </div>

      {/* API documentation sub-panel */}
      <div className="bg-brand-card border border-brand-border rounded-xl p-5 space-y-5">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-300 font-orbitron flex items-center gap-1.5 border-b border-brand-border/60 pb-3">
          <Code className="w-4 h-5 text-brand-accent" />
          Technical API Endpoint Documentation
        </h3>

        <div className="space-y-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="p-4 bg-brand-dark/50 border border-brand-border/40 rounded-lg space-y-3">
              
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                    ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-brand-accent/10 text-brand-accent border border-brand-accent/30'
                  }`}>{ep.method}</span>
                  <span className="font-mono text-xs font-bold text-gray-200">{ep.path}</span>
                </div>
                
                <div className="text-[10px] text-gray-500">
                  Authentication: <span className="text-gray-400 font-semibold">{ep.auth}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{ep.desc}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {ep.req !== 'None' && (
                  <div>
                    <span className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Payload Request Example</span>
                    <pre className="p-2.5 bg-brand-dark border border-brand-border rounded text-[9px] font-mono text-gray-400 overflow-x-auto leading-normal">
                      {ep.req}
                    </pre>
                  </div>
                )}
                <div className={ep.req === 'None' ? 'md:col-span-2' : ''}>
                  <span className="text-[9px] text-gray-500 font-bold block uppercase mb-1">Payload Response Example</span>
                  <pre className="p-2.5 bg-brand-dark border border-brand-border rounded text-[9px] font-mono text-gray-400 overflow-x-auto leading-normal">
                    {ep.res}
                  </pre>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
