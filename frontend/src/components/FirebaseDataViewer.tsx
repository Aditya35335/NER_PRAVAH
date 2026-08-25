import React, { useState, useEffect } from 'react';
import { 
  Database, RefreshCw, Users, Mountain, Landmark, Route, 
  AlertTriangle, ShieldCheck, Phone, CheckCircle2, ChevronRight,
  Search, Eye, Layers, Copy, Check, Smartphone, Globe
} from 'lucide-react';
import { 
  firestore, subscribeToUsers, subscribeToVillages, 
  subscribeToShelters, subscribeToRoads, subscribeToAlerts, 
  subscribeToHouseholds, subscribeToSOS, subscribeToFieldReports,
  syncAllDataToFirestore, fetchUsersFromFirestore 
} from '../firebase';
import { Village, Shelter, Road, Alert } from '../types';
import DemoSmsBroadcastModal from './DemoSmsBroadcastModal';

interface FirebaseDataViewerProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  alerts: Alert[];
}

export default function FirebaseDataViewer({ villages, shelters, roads, alerts }: FirebaseDataViewerProps) {
  const [selectedCollection, setSelectedCollection] = useState<string>('users');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [fetchingUsers, setFetchingUsers] = useState<boolean>(false);
  const [userFetchNotice, setUserFetchNotice] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [showSmsModal, setShowSmsModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Cloud Records state
  const [cloudUsers, setCloudUsers] = useState<any[]>([]);
  const [cloudVillages, setCloudVillages] = useState<any[]>([]);
  const [cloudShelters, setCloudShelters] = useState<any[]>([]);
  const [cloudRoads, setCloudRoads] = useState<any[]>([]);
  const [cloudAlerts, setCloudAlerts] = useState<any[]>([]);
  const [cloudHouseholds, setCloudHouseholds] = useState<any[]>([]);
  const [cloudSOS, setCloudSOS] = useState<any[]>([]);
  const [cloudFieldReports, setCloudFieldReports] = useState<any[]>([]);

  useEffect(() => {
    const unsubUsers = subscribeToUsers(setCloudUsers);
    const unsubVillages = subscribeToVillages(setCloudVillages);
    const unsubShelters = subscribeToShelters(setCloudShelters);
    const unsubRoads = subscribeToRoads(setCloudRoads);
    const unsubAlerts = subscribeToAlerts(setCloudAlerts);
    const unsubHouseholds = subscribeToHouseholds(setCloudHouseholds);
    const unsubSOS = subscribeToSOS(setCloudSOS);
    const unsubReports = subscribeToFieldReports(setCloudFieldReports);

    return () => {
      unsubUsers();
      unsubVillages();
      unsubShelters();
      unsubRoads();
      unsubAlerts();
      unsubHouseholds();
      unsubSOS();
      unsubReports();
    };
  }, []);

  const handleManualFetchUsers = async () => {
    setFetchingUsers(true);
    setUserFetchNotice(null);
    try {
      const users = await fetchUsersFromFirestore();
      setCloudUsers(users);
      const androidCount = users.filter(u => u.source === 'ANDROID_APP').length;
      setUserFetchNotice(`✓ Synchronized ${users.length} live users from Cloud Firestore (${androidCount} from Android App)!`);
      setTimeout(() => setUserFetchNotice(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    const success = await syncAllDataToFirestore(villages, shelters, roads, alerts);
    setSyncing(false);
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    }
  };

  const collections = [
    { id: 'users', label: 'Registered Users', icon: Users, count: cloudUsers.length, data: cloudUsers, color: 'text-blue-500 bg-blue-50 border-blue-200' },
    { id: 'villages', label: '18 Sectors / Villages', icon: Mountain, count: cloudVillages.length || villages.length, data: cloudVillages.length > 0 ? cloudVillages : villages, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
    { id: 'shelters', label: 'Relief Shelters', icon: Landmark, count: cloudShelters.length || shelters.length, data: cloudShelters.length > 0 ? cloudShelters : shelters, color: 'text-purple-500 bg-purple-50 border-purple-200' },
    { id: 'roads', label: 'Road Corridors', icon: Route, count: cloudRoads.length || roads.length, data: cloudRoads.length > 0 ? cloudRoads : roads, color: 'text-indigo-500 bg-indigo-50 border-indigo-200' },
    { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle, count: cloudAlerts.length, data: cloudAlerts, color: 'text-red-500 bg-red-50 border-red-200' },
    { id: 'households', label: 'Evacuated Families', icon: ShieldCheck, count: cloudHouseholds.length, data: cloudHouseholds, color: 'text-amber-500 bg-amber-50 border-amber-200' },
    { id: 'sos_dispatches', label: 'SOS GPS Rescue', icon: Phone, count: cloudSOS.length, data: cloudSOS, color: 'text-rose-500 bg-rose-50 border-rose-200' },
    { id: 'field_reports', label: 'Hazard Field Reports', icon: Layers, count: cloudFieldReports.length, data: cloudFieldReports, color: 'text-teal-500 bg-teal-50 border-teal-200' }
  ];

  const activeCol = collections.find(c => c.id === selectedCollection) || collections[0];

  const filteredData = activeCol.data.filter((item: any) => {
    if (!searchTerm) return true;
    const str = JSON.stringify(item).toLowerCase();
    return str.includes(searchTerm.toLowerCase());
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card space-y-6">
      
      {/* ── Top Header & Actions ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                Firebase Firestore Realtime Cloud Database
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-300">
                  LIVE (nreprahva)
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                All cloud collections, registered user accounts, field telemetry, and relief logistics.
              </p>
            </div>
          </div>
        </div>

        {/* Actions Button */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleManualFetchUsers}
            disabled={fetchingUsers}
            className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingUsers ? 'animate-spin' : ''}`} />
            <span>{fetchingUsers ? 'Fetching...' : 'Fetch Users from Cloud'}</span>
          </button>

          <button
            onClick={() => setShowSmsModal(true)}
            className="py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Broadcast SMS & Push</span>
          </button>

          <button
            onClick={handleForceSync}
            disabled={syncing}
            className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Force Sync All'}</span>
          </button>
        </div>
      </div>

      <DemoSmsBroadcastModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        villages={villages}
        shelters={shelters}
      />

      {userFetchNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{userFetchNotice}</span>
        </div>
      )}

      {syncSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ Complete dataset (Users, 18 Sectors, Shelters, Roads, Alerts) successfully committed to Cloud Firestore!</span>
        </div>
      )}

      {/* ── Collection Metrics Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {collections.map(col => {
          const Icon = col.icon;
          const isSelected = selectedCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => { setSelectedCollection(col.id); setSearchTerm(''); }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                isSelected 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {col.count}
                </span>
              </div>
              <span className="text-[11px] font-bold truncate leading-tight mt-1">{col.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Collection Explorer & Search ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
              Collection: <span className="text-blue-600">/{activeCol.id}</span> ({filteredData.length} records)
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search in ${activeCol.label}...`}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        {/* Records Display List */}
        {filteredData.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium space-y-2">
            <p>No documents found in collection <b>`/{activeCol.id}`</b>.</p>
            <p className="text-[11px]">Click "Fetch Users from Cloud" or "Force Sync All" to retrieve or populate data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredData.map((item: any, idx: number) => {
              const docId = item.id || `doc-${idx}`;
              const isAndroid = item.source === 'ANDROID_APP' || Boolean(item.fcmToken || item.device_id || item.platform === 'android');
              return (
                <div 
                  key={docId}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        ID: {docId}
                      </span>
                      {isAndroid ? (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> Android App
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Web Portal
                        </span>
                      )}
                      {item.role && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                          {item.role}
                        </span>
                      )}
                      {item._cloudCollection && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                          /{item._cloudCollection}
                        </span>
                      )}
                      {item.riskLevel && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          item.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                          item.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.riskLevel} ({item.riskScore}%)
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(JSON.stringify(item, null, 2), docId)}
                      title="Copy Document JSON"
                      className="p-1 rounded bg-white hover:bg-slate-200 text-slate-500 text-xs border border-slate-200"
                    >
                      {copiedId === docId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Summary Attributes */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {item.name && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Name / Citizen</span>
                        <span className="font-extrabold text-slate-800 truncate block">{item.name}</span>
                      </div>
                    )}
                    {item.phone && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Mobile Phone</span>
                        <span className="font-mono text-[11px] font-extrabold text-emerald-700 truncate block">{item.phone}</span>
                      </div>
                    )}
                    {item.email && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Email</span>
                        <span className="font-mono text-[11px] text-slate-700 truncate block">{item.email}</span>
                      </div>
                    )}
                    {item.villageName && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Assigned Sector</span>
                        <span className="font-bold text-slate-800 truncate block">{item.villageName}</span>
                      </div>
                    )}
                    {item.rainfall != null && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Rainfall (24h)</span>
                        <span className="font-bold text-slate-800">{item.rainfall} mm</span>
                      </div>
                    )}
                    {item.soilMoisture != null && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Soil Saturation</span>
                        <span className="font-bold text-slate-800">{item.soilMoisture}%</span>
                      </div>
                    )}
                    {item.familyHead && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Family Head</span>
                        <span className="font-bold text-slate-800">{item.familyHead} ({item.size} members)</span>
                      </div>
                    )}
                    {item.citizenName && (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Citizen SOS</span>
                        <span className="font-bold text-rose-700">{item.citizenName} ({item.phone})</span>
                      </div>
                    )}
                    {item.lastLogin && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block font-bold">Last Activity</span>
                        <span className="text-[11px] font-mono text-slate-500">{new Date(item.lastLogin).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
