import React, { useState } from 'react';
import { Home, Edit2, ShieldAlert, Check, HelpCircle, X, Info } from 'lucide-react';
import { Village, Shelter } from '../types';

interface VillageManagementProps {
  villages: Village[];
  shelters: Shelter[];
  hasPermission: boolean;
  onRefresh: () => void;
  demoMode: boolean;
}

export default function VillageManagement({ villages, shelters, hasPermission, onRefresh, demoMode }: VillageManagementProps) {
  const [editingVillage, setEditingVillage] = useState<Village | null>(null);
  const [editPopulation, setEditPopulation] = useState<number>(0);
  const [editShelterId, setEditShelterId] = useState<string>('');
  const [editEvacuation, setEditEvacuation] = useState<any>('NOT_STARTED');
  const [editRoadStatus, setEditRoadStatus] = useState<any>('SAFE');
  const [saving, setSaving] = useState<boolean>(false);

  const startEditing = (v: Village) => {
    setEditingVillage(v);
    setEditPopulation(v.estimatedPopulation);
    setEditShelterId(v.shelterId || '');
    setEditEvacuation(v.evacuationStatus);
    setEditRoadStatus(v.roadStatus);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVillage) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/villages/${editingVillage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimatedPopulation: Number(editPopulation),
          shelterId: editShelterId || undefined,
          evacuationStatus: editEvacuation,
          roadStatus: editRoadStatus
        })
      });
      if (res.ok) {
        setEditingVillage(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Failed to save village data:', e);
    } finally {
      setSaving(false);
    }
  };

  const getRiskColorClass = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-risk-critical';
      case 'HIGH': return 'text-risk-high';
      case 'MEDIUM': return 'text-risk-medium';
      default: return 'text-risk-low';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Village Sector Administration
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Monitor village risk states, update population parameters, and configure evacuation shelter assignments.
        </p>
      </div>

      {/* Editing Form Overlay */}
      {editingVillage && (
        <div className="p-5 bg-brand-card border border-brand-accent/30 rounded-xl animate-slide-in space-y-4">
          <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
            <h3 className="font-bold text-sm uppercase text-gray-200 font-orbitron flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-brand-accent" />
              Modify Village Sector: {editingVillage.name}
            </h3>
            <button onClick={() => setEditingVillage(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Estimated Population</label>
              <input 
                type="number" 
                value={editPopulation}
                onChange={(e) => setEditPopulation(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Assigned Evacuation Shelter</label>
              <select 
                value={editShelterId}
                onChange={(e) => setEditShelterId(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="">-- No shelter assigned --</option>
                {shelters.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.occupied}/{s.capacity})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Evacuation Status</label>
              <select 
                value={editEvacuation}
                onChange={(e) => setEditEvacuation(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="PREPARING">Preparing Protocols</option>
                <option value="IN_PROGRESS">In Progress (Active)</option>
                <option value="MOSTLY_EVACUATED">Mostly Evacuated</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Road Network Connectivity</label>
              <select 
                value={editRoadStatus}
                onChange={(e) => setEditRoadStatus(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="SAFE">SAFE (No clearance issues)</option>
                <option value="WARNING">WARNING (Slippery / Debris)</option>
                <option value="BLOCKED">BLOCKED (Active landslide blockage)</option>
                <option value="UNKNOWN">UNKNOWN / Telemetry Offline</option>
              </select>
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end pt-2 border-t border-brand-border/60">
              <button 
                type="button" 
                onClick={() => setEditingVillage(null)} 
                className="px-4 py-2 bg-transparent hover:bg-[#1E293B] border border-brand-border text-gray-400 rounded text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded text-xs font-bold shadow-glow"
              >
                {saving ? 'Saving overrides...' : 'Apply Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Villages List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {villages.map(village => (
          <div 
            key={village.id} 
            className="p-5 bg-brand-card border border-brand-border rounded-xl flex flex-col justify-between hover:border-brand-border/80 transition-all space-y-4 shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-gray-200 font-orbitron">{village.name}</h3>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">District ID: {village.districtId}</span>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  village.riskLevel === 'CRITICAL' ? 'bg-risk-critical/20 text-risk-critical' :
                  village.riskLevel === 'HIGH' ? 'bg-risk-high/20 text-risk-high' :
                  village.riskLevel === 'MEDIUM' ? 'bg-risk-medium/20 text-risk-medium' :
                  'bg-risk-low/20 text-risk-low'
                }`}>
                  {village.riskLevel}
                </span>
              </div>

              {/* Stats column */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mt-4">
                <div>Risk score: <b className="text-gray-200">{village.riskScore}%</b></div>
                <div>Population: <b className="text-gray-200">{village.estimatedPopulation}</b></div>
                <div>Road Status: <b className={`font-semibold ${
                  village.roadStatus === 'SAFE' ? 'text-risk-low' :
                  village.roadStatus === 'WARNING' ? 'text-risk-high' :
                  'text-risk-critical'
                }`}>{village.roadStatus}</b></div>
                <div className="truncate">Shelter: <b className="text-brand-accent">{shelters.find(s => s.id === village.shelterId)?.name || 'None'}</b></div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-brand-border/40 pt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                Evac Phase: <b className="text-gray-300 font-semibold">{village.evacuationStatus.replace('_', ' ')}</b>
              </span>
              
              {hasPermission ? (
                <button 
                  onClick={() => startEditing(village)}
                  className="px-2.5 py-1 bg-[#1E293B] hover:bg-brand-border rounded text-[10px] font-bold text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3 text-brand-accent" />
                  Edit Settings
                </button>
              ) : (
                <span className="text-[9px] text-gray-500 italic flex items-center gap-0.5">
                  <Info className="w-3 h-3 text-gray-600" /> Read-only mode
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
