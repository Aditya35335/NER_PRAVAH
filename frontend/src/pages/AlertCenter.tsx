import React, { useState } from 'react';
import { 
  Bell, AlertTriangle, ShieldCheck, Check, Clock, 
  MapPin, Eye, Compass, BellRing, Volume2, Radio, CheckCircle2, Smartphone, Send
} from 'lucide-react';
import { Alert, Village, Shelter } from '../types';
import { dispatchTargetedSirenSignal } from '../firebase';
import DemoSmsBroadcastModal from '../components/DemoSmsBroadcastModal';

interface AlertCenterProps {
  alerts: Alert[];
  villages: Village[];
  shelters?: Shelter[];
  hasPermission: boolean;
  onAlertUpdate: () => void;
}

export default function AlertCenter({ alerts, villages, shelters = [], hasPermission, onAlertUpdate }: AlertCenterProps) {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Custom alert creator form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [newAlertVillage, setNewAlertVillage] = useState<string>('');
  const [newAlertSeverity, setNewAlertSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('CRITICAL');
  const [newAlertTitle, setNewAlertTitle] = useState<string>('');
  const [newAlertMessage, setNewAlertMessage] = useState<string>('');
  const [soundSirenOption, setSoundSirenOption] = useState<boolean>(true);
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  const updateAlertStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onAlertUpdate();
      }
    } catch (e) {
      console.error('Failed to update alert state:', e);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertVillage || !newAlertTitle) return;

    setDispatching(true);
    const selectedVillageObj = villages.find(v => v.id === newAlertVillage);
    const riskScore = selectedVillageObj ? selectedVillageObj.riskScore : 85;
    const villageName = selectedVillageObj ? selectedVillageObj.name : newAlertVillage;

    try {
      // 1. Dispatch 5-second siren signal directly to Cloud Firestore
      if (soundSirenOption) {
        await dispatchTargetedSirenSignal({
          targetSectorId: newAlertVillage,
          targetSectorName: villageName,
          severity: newAlertSeverity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          title: newAlertTitle,
          message: newAlertMessage,
          durationSeconds: 5,
          targetCoordinates: selectedVillageObj ? [selectedVillageObj.latitude, selectedVillageObj.longitude] : undefined,
          radiusKm: 15,
          dispatchedBy: 'Incident Commander Aditya Nawale'
        });
      }

      // 2. Local Backend API Sync
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: newAlertSeverity,
          title: newAlertTitle,
          message: newAlertMessage,
          status: 'NEW',
          villageId: newAlertVillage,
          riskScore,
          reason: 'Targeted Emergency Siren Broadcast Dispatched'
        })
      });

      if (res.ok) {
        setDispatchNotice(`✓ 5-Second Siren Signal & Emergency Alert successfully targeted to ${villageName}!`);
        setTimeout(() => setDispatchNotice(null), 5000);
        setShowAddForm(false);
        setNewAlertTitle('');
        setNewAlertMessage('');
        onAlertUpdate();
      }
    } catch (e) {
      console.error('Failed to create manual alert:', e);
    } finally {
      setDispatching(false);
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const sevMatch = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    const statMatch = filterStatus === 'ALL' || alert.status === filterStatus;
    return sevMatch && statMatch;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-risk-critical/20 text-risk-critical border-risk-critical/30';
      case 'HIGH': return 'bg-risk-high/20 text-risk-high border-risk-high/30';
      case 'MEDIUM': return 'bg-risk-medium/20 text-risk-medium border-risk-medium/30';
      default: return 'bg-risk-low/20 text-risk-low border-risk-low/30';
    }
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'IN_RESPONSE': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'ACKNOWLEDGED': return 'bg-amber-500/10 text-amber-500 border border-amber-500/30';
      default: return 'bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-orbitron tracking-wide text-gray-200">
            Emergency Warning Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Dispatch early warnings, coordinate command logs, and track alert lifecycle events.
          </p>
        </div>

        {hasPermission && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSmsModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              📱 Broadcast Risk SMS to Citizens
            </button>

            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-brand-accent hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-glow"
            >
              <BellRing className="w-4 h-4" />
              DISPATCH MANUAL WARNING
            </button>
          </div>
        )}
      </div>

      {/* Demo SMS Broadcast Modal */}
      <DemoSmsBroadcastModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        villages={villages}
        shelters={shelters}
      />

      {/* Manual Dispatch Modal Form overlay */}
      {showAddForm && (
        <div className="p-5 bg-brand-card border border-brand-border rounded-xl animate-slide-in">
          <h3 className="font-bold text-sm uppercase text-gray-200 font-orbitron mb-3">Broadcast Emergency Early-Warning</h3>
          <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Target Village Sector</label>
              <select 
                value={newAlertVillage} 
                onChange={(e) => setNewAlertVillage(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs"
                required
              >
                <option value="">-- Choose Target Village --</option>
                {villages.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.riskLevel} Risk)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Warning Level Severity</label>
              <select 
                value={newAlertSeverity} 
                onChange={(e: any) => setNewAlertSeverity(e.target.value)}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs"
              >
                <option value="LOW">LOW (Preparedness check)</option>
                <option value="MEDIUM">MEDIUM (Watch active)</option>
                <option value="HIGH">HIGH (Preparedness warning)</option>
                <option value="CRITICAL">CRITICAL (Immediate Evac Order)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Warning Header / Title</label>
              <input 
                type="text" 
                value={newAlertTitle} 
                onChange={(e) => setNewAlertTitle(e.target.value)}
                placeholder="e.g. Extreme Rainfall Risk - Immediate Action Requested"
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Detailed Warning Message Instructions</label>
              <textarea 
                value={newAlertMessage} 
                onChange={(e) => setNewAlertMessage(e.target.value)}
                placeholder="Specify directions, route clearances, and nearest safe shelter instructions for residents."
                rows={3}
                className="w-full bg-[#1E293B] border border-brand-border rounded py-2 px-3 focus:outline-none focus:border-brand-accent text-xs text-gray-200"
                required
              ></textarea>
            </div>

            {/* Preset template buttons */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 block">Quick Situational Templates:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewAlertSeverity('CRITICAL');
                    setNewAlertTitle('🚨 IMMEDIATE SLOPE EVACUATION REQUIRED');
                    setNewAlertMessage('Intense cloudburst rainfall exceeding 120mm/24h detected with 85%+ pore soil saturation. Move all family members immediately to the designated hillside relief shelter.');
                  }}
                  className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-red-200 rounded-lg text-[11px] font-bold"
                >
                  ⚡ Extreme Flash Rain & Slope Failure
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewAlertSeverity('HIGH');
                    setNewAlertTitle('⚠️ TENSION CRACKS & ROAD PASSAGE WARNING');
                    setNewAlertMessage('Active hillside soil creep and surface tension cracks detected along the main transport corridor. Heavy vehicles restricted. Follow designated bypass routes.');
                  }}
                  className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 text-amber-200 rounded-lg text-[11px] font-bold"
                >
                  🚧 Soil Creep & Highway Blockage
                </button>
              </div>
            </div>

            {/* Siren Toggle Checkbox */}
            <div className="md:col-span-2 bg-red-950/30 border border-red-800/40 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-white">Targeted 5-Second Warning Siren</h4>
                  <p className="text-[10px] text-red-300">
                    Sounds a 5-second synthesized alert siren ONLY on citizen devices located within the target danger zone.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundSirenOption}
                onChange={(e) => setSoundSirenOption(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded bg-slate-900 border-red-500 focus:ring-red-500 cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="px-4 py-2 bg-transparent hover:bg-[#1E293B] border border-brand-border text-gray-400 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={dispatching}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
              >
                <Radio className={`w-4 h-4 ${dispatching ? 'animate-spin' : 'animate-pulse'}`} />
                <span>{dispatching ? 'Dispatching Targeted Siren...' : '🚨 Broadcast 5-Second Siren Signal'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Dispatch Notice Banner */}
      {dispatchNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{dispatchNotice}</span>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 bg-brand-card/50 border border-brand-border p-3 rounded-lg">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Filters:</span>
        
        {/* Severity filter */}
        <select 
          value={filterSeverity} 
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="bg-brand-dark border border-brand-border text-xs rounded py-1 px-2.5 focus:outline-none focus:border-brand-accent text-gray-200"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">🔴 CRITICAL</option>
          <option value="HIGH">⚠️ HIGH</option>
          <option value="MEDIUM">🟡 MEDIUM</option>
          <option value="LOW">🟢 LOW</option>
        </select>

        {/* Status filter */}
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-brand-dark border border-brand-border text-xs rounded py-1 px-2.5 focus:outline-none focus:border-brand-accent text-gray-200"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New (Unacknowledged)</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="IN_RESPONSE">In Response</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        
        <span className="text-xs text-gray-500 ml-auto font-mono">Showing {filteredAlerts.length} records</span>
      </div>

      {/* Warning Logs list */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => {
            const matchVillage = villages.find(v => v.id === alert.villageId);
            return (
              <div 
                key={alert.id}
                className="p-5 bg-brand-card border border-brand-border rounded-xl space-y-4 hover:border-brand-border/80 transition-all shadow-sm"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusLabelColor(alert.status)}`}>
                      {alert.status}
                    </span>
                    <h3 className="font-bold text-sm text-gray-200 font-orbitron">{alert.title}</h3>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">
                    Logged: {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">LOCATION</span>
                    <span className="font-semibold text-gray-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                      {matchVillage ? matchVillage.name : 'Unknown Village'}
                    </span>
                    <span className="text-[10px] text-gray-500 block">District: East Khasi Hills</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">TRIGGER READINGS</span>
                    <div className="text-gray-300 font-semibold">Risk Index: {alert.riskScore}%</div>
                    <span className="text-[10px] text-gray-500 block leading-tight">Reasoning: {alert.reason}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold block uppercase">RECOMMENDED PROTOCOLS</span>
                    <div className="text-emerald-400 font-semibold">
                      {alert.severity === 'CRITICAL' ? 'Begin absolute evacuation immediately' : 'Preparedness checks and route clearance'}
                    </div>
                  </div>
                </div>

                {/* Warning message text */}
                <div className="p-3 bg-brand-dark/50 border border-brand-border/40 rounded text-xs text-gray-400 leading-relaxed">
                  {alert.message}
                </div>

                {/* Action buttons (District officers/Admins only) */}
                {hasPermission && alert.status !== 'RESOLVED' && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-brand-border/30">
                    
                    {alert.status === 'NEW' && (
                      <button 
                        onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                        className="px-3 py-1.5 bg-[#1E293B] hover:bg-[#2A3950] border border-brand-border text-gray-300 rounded text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                        Acknowledge Dispatch
                      </button>
                    )}

                    {(alert.status === 'NEW' || alert.status === 'ACKNOWLEDGED') && (
                      <button 
                        onClick={() => updateAlertStatus(alert.id, 'IN_RESPONSE')}
                        className="px-3 py-1.5 bg-brand-accent hover:bg-blue-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow-glow"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        Trigger Response Protocol
                      </button>
                    )}

                    {alert.status === 'IN_RESPONSE' && (
                      <button 
                        onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-all shadow-glow-green"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Mark Warning Resolved
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 border border-dashed border-brand-border rounded-xl text-center bg-brand-card/25">
            <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-xs text-gray-500">No warnings matched the selected filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
