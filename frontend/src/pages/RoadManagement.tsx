import React, { useState } from 'react';
import { Route, Edit2, ShieldAlert, Check, X, AlertOctagon } from 'lucide-react';
import { Road } from '../types';

interface RoadManagementProps {
  roads: Road[];
  hasPermission: boolean;
  onRefresh: () => void;
  demoMode: boolean;
}

export default function RoadManagement({ roads, hasPermission, onRefresh, demoMode }: RoadManagementProps) {
  const [editingRoad, setEditingRoad] = useState<Road | null>(null);
  const [editStatus, setEditStatus] = useState<any>('SAFE');
  const [editReason, setEditReason] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const startEditing = (r: Road) => {
    setEditingRoad(r);
    setEditStatus(r.status);
    setEditReason(r.blockageReason || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoad) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/roads/${editingRoad.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          blockageReason: editStatus === 'SAFE' ? '' : editReason
        })
      });
      if (res.ok) {
        setEditingRoad(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Failed to update road status:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Highway & Corridor Administration
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Monitor transportation routes, report mudslips or blocks, and control variables used in routing coordinates.
        </p>
      </div>

      {/* Editing Panel Form Overlay */}
      {editingRoad && (
        <div className="p-5 bg-brand-card border border-brand-accent/30 rounded-xl animate-slide-in space-y-4">
          <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
            <h3 className="font-bold text-sm uppercase text-gray-200 font-orbitron flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-brand-accent" />
              Adjust Corridor Parameters: {editingRoad.name}
            </h3>
            <button onClick={() => setEditingRoad(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Route Status</label>
              <select 
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="SAFE">SAFE (No restrictions)</option>
                <option value="WARNING">WARNING (Slippery mud / caution)</option>
                <option value="BLOCKED">BLOCKED (Active landslide rockfall)</option>
                <option value="UNKNOWN">UNKNOWN / Telemetry Offline</option>
              </select>
            </div>

            {editStatus !== 'SAFE' && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Obstruction Reason Details</label>
                <input 
                  type="text" 
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  placeholder="e.g. Major mud slurry or rockfall blockages near milestone 22"
                  className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                  required
                />
              </div>
            )}

            <div className="md:col-span-2 flex gap-2 justify-end pt-2 border-t border-brand-border/60">
              <button 
                type="button" 
                onClick={() => setEditingRoad(null)} 
                className="px-4 py-2 bg-transparent hover:bg-[#1E293B] border border-brand-border text-gray-400 rounded text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded text-xs font-bold shadow-glow"
              >
                {saving ? 'Applying updates...' : 'Save Corridor Status'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Roads List */}
      <div className="space-y-4">
        {roads.map(road => (
          <div 
            key={road.id} 
            className="p-5 bg-brand-card border border-brand-border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-border/80 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  road.status === 'SAFE' ? 'bg-risk-low' :
                  road.status === 'WARNING' ? 'bg-risk-high animate-pulse' :
                  'bg-risk-critical animate-ping'
                }`}></span>
                <h3 className="font-bold text-sm text-gray-200 font-orbitron">{road.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                  road.status === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                  road.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                  'bg-red-500/10 text-red-500 border-red-500/30'
                }`}>
                  {road.status}
                </span>
              </div>
              
              {road.blockageReason && (
                <p className="text-xs text-amber-500 mt-2 bg-amber-500/5 p-2 border border-amber-500/10 rounded">
                  ⚠️ Blockage Details: {road.blockageReason}
                </p>
              )}
              
              <div className="text-[10px] text-gray-500 mt-2 font-mono">
                Segment bounds: [{road.latStart.toFixed(3)}, {road.lngStart.toFixed(3)}] to [{road.latEnd.toFixed(3)}, {road.lngEnd.toFixed(3)}]
              </div>
            </div>

            {hasPermission && (
              <button 
                onClick={() => startEditing(road)}
                className="px-3 py-1.5 bg-[#1E293B] hover:bg-brand-border rounded text-[10px] font-bold text-gray-300 hover:text-white flex items-center gap-1 transition-colors shrink-0 align-self-start md:align-self-center"
              >
                <Edit2 className="w-3.5 h-3.5 text-brand-accent" />
                Change Blockage Status
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
