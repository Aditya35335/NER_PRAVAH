import React, { useState } from 'react';
import { Landmark, Edit2, ShieldAlert, Check, X, ShieldCheck, Home } from 'lucide-react';
import { Shelter } from '../types';

interface ShelterManagementProps {
  shelters: Shelter[];
  hasPermission: boolean;
  onRefresh: () => void;
  demoMode: boolean;
}

export default function ShelterManagement({ shelters, hasPermission, onRefresh, demoMode }: ShelterManagementProps) {
  const [editingShelter, setEditingShelter] = useState<Shelter | null>(null);
  const [editOccupied, setEditOccupied] = useState<number>(0);
  const [editCapacity, setEditCapacity] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<any>('OPEN');
  const [saving, setSaving] = useState<boolean>(false);

  const startEditing = (s: Shelter) => {
    setEditingShelter(s);
    setEditOccupied(s.occupied);
    setEditCapacity(s.capacity);
    setEditStatus(s.status);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShelter) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/shelters/${editingShelter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          occupied: Number(editOccupied),
          capacity: Number(editCapacity),
          status: editStatus
        })
      });
      if (res.ok) {
        setEditingShelter(null);
        onRefresh();
      }
    } catch (e) {
      console.error('Failed to update shelter status:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
          Relief Shelter Allocation
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Monitor shelter capacity limits, track active occupied counts, and list infrastructure amenities.
        </p>
      </div>

      {/* Editing Panel Form Overlay */}
      {editingShelter && (
        <div className="p-5 bg-brand-card border border-brand-accent/30 rounded-xl animate-slide-in space-y-4">
          <div className="flex justify-between items-center border-b border-brand-border/60 pb-2">
            <h3 className="font-bold text-sm uppercase text-gray-200 font-orbitron flex items-center gap-1.5">
              <Edit2 className="w-4 h-4 text-brand-accent" />
              Adjust Shelter Parameters: {editingShelter.name}
            </h3>
            <button onClick={() => setEditingShelter(null)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Max capacity</label>
              <input 
                type="number" 
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Current Occupied count</label>
              <input 
                type="number" 
                value={editOccupied}
                onChange={(e) => setEditOccupied(Number(e.target.value))}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 block mb-1">Facility Status</label>
              <select 
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
              >
                <option value="OPEN">OPEN (Receiving evacuees)</option>
                <option value="NEAR_CAPACITY">NEAR CAPACITY (Warnings active)</option>
                <option value="FULL">FULL (Route redirects active)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Facility offline)</option>
              </select>
            </div>

            <div className="md:col-span-3 flex gap-2 justify-end pt-2 border-t border-brand-border/60">
              <button 
                type="button" 
                onClick={() => setEditingShelter(null)} 
                className="px-4 py-2 bg-transparent hover:bg-[#1E293B] border border-brand-border text-gray-400 rounded text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2 bg-brand-accent hover:bg-blue-600 text-white rounded text-xs font-bold shadow-glow"
              >
                {saving ? 'Saving adjustments...' : 'Apply Shelter Updates'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Shelter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shelters.map(shelter => {
          const occupancy = Math.round((shelter.occupied / shelter.capacity) * 100);
          return (
            <div 
              key={shelter.id} 
              className="p-5 bg-brand-card border border-brand-border rounded-xl flex flex-col justify-between hover:border-brand-border/80 transition-all space-y-4 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-gray-200 font-orbitron">{shelter.name}</h3>
                    <span className="text-[10px] text-gray-500 uppercase block mt-0.5">Location: {shelter.location}</span>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                    shelter.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                    shelter.status === 'NEAR_CAPACITY' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                    'bg-red-500/10 text-red-500 border-red-500/30'
                  }`}>
                    {shelter.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mt-4">
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Occupancy Allocation</span>
                    <span>{shelter.occupied} / {shelter.capacity} people ({occupancy}%)</span>
                  </div>
                  <div className="w-full bg-brand-border h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        occupancy >= 90 ? 'bg-risk-critical' :
                        occupancy >= 75 ? 'bg-risk-high' :
                        'bg-brand-accent'
                      }`}
                      style={{ width: `${occupancy}%` }}
                    ></div>
                  </div>
                </div>

                {/* Facilities tags */}
                <div className="mt-4 pt-4 border-t border-brand-border/40">
                  <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider mb-2">Amenities checklist</span>
                  <div className="flex flex-wrap gap-1.5">
                    {shelter.facilities.map((fac, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 bg-brand-dark border border-brand-border rounded text-gray-400">
                        ✓ {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit actions */}
              {hasPermission && (
                <div className="pt-2 border-t border-brand-border/40 flex justify-end">
                  <button 
                    onClick={() => startEditing(shelter)}
                    className="px-2.5 py-1 bg-[#1E293B] hover:bg-brand-border rounded text-[10px] font-bold text-gray-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3 text-brand-accent" />
                    Configure Shelter Parameters
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
