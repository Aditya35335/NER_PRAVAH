import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Route, Landmark, 
  Bell, Phone, ArrowRight, MapPin, ChevronDown, 
  Home, Map, Radio, User, Check, X, ShieldAlert, CloudRain
} from 'lucide-react';
import { Village, Shelter, Road } from '../types';

interface MobileEmergencyProps {
  user: any;
  onExit?: () => void;
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
}

export default function MobileEmergency({ user, onExit, villages, shelters, roads }: MobileEmergencyProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'updates' | 'profile'>('home');
  const [language, setLanguage] = useState<'as' | 'hi' | 'en'>('as');
  const [markedSafe, setMarkedSafe] = useState<boolean>(false);
  const [showSafetyModal, setShowSafetyModal] = useState<boolean>(false);
  const [showHazardModal, setShowHazardModal] = useState<boolean>(false);
  const [hazardType, setHazardType] = useState<string>('Tension Crack on Hill');
  const [hazardDesc, setHazardDesc] = useState<string>('');
  const [hazardSuccess, setHazardSuccess] = useState<boolean>(false);

  // Active village is Mawsynram / Sohra
  const activeVillage = villages.find(v => v.id === 'mawsynram') || villages[0];

  const handleMarkSafe = () => {
    setMarkedSafe(true);
  };

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/field-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          villageId: activeVillage?.id || 'mawsynram',
          reporterName: 'Local Resident',
          type: 'LANDSLIDE',
          description: `${hazardType}: ${hazardDesc || 'Reported from mobile app'}`,
          latitude: 25.298,
          longitude: 91.582
        })
      });
      setHazardSuccess(true);
      setTimeout(() => {
        setHazardSuccess(false);
        setShowHazardModal(false);
        setHazardDesc('');
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-[#F8FAFC] min-h-screen text-slate-800 flex flex-col font-sans relative border border-slate-200 shadow-2xl rounded-3xl overflow-hidden my-4">
      
      {/* Top Status Bar (Phone frame notch & time) */}
      <div className="bg-white px-5 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-700 border-b border-slate-100">
        <span>9:41</span>
        <div className="w-20 h-4 bg-black rounded-full"></div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span>5G</span>
          <span>100%</span>
        </div>
      </div>

      {/* Main App Header */}
      <header className="bg-white px-5 py-3 flex justify-between items-center border-b border-slate-100">
        <div>
          <h1 className="font-bold text-xl text-slate-900 leading-tight">Namaste!</h1>
          <p className="text-xs text-slate-500 font-medium">Stay safe, stay alert</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e: any) => setLanguage(e.target.value)}
              className="bg-slate-100 border border-slate-200 text-xs font-semibold rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="as">অসমীয়া</option>
              <option value="hi">हिंदी</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Alert Bell */}
          <div className="relative p-1.5 bg-slate-100 rounded-full text-slate-600">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 p-4 space-y-3.5 overflow-y-auto">

        {/* 1. Large High Landslide Risk Warning Banner (Matching screenshot) */}
        <div className="bg-[#DC2626] text-white rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wide">HIGH LANDSLIDE RISK</h2>
                <p className="text-[11px] text-red-100 font-medium">in your area (Mawsynram - Sohra)</p>
              </div>
            </div>
            <CloudRain className="w-7 h-7 text-red-200" />
          </div>

          <p className="text-[11px] text-red-100 leading-tight">
            Avoid high slopes • Follow official instructions • Keep emergency bags ready
          </p>

          <button
            onClick={() => setShowSafetyModal(true)}
            className="w-full py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Safety Instructions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Evacuation Information Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700">
              <Route className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs uppercase tracking-wide">Evacuation Information</h3>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Nearest Shelter</span>
              <span className="font-bold text-sm text-slate-900">Govt. High School</span>
            </div>
            <span className="font-bold text-emerald-600 text-sm">1.2 km</span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Estimated Time</span>
              <span className="font-bold text-xs text-slate-700">15 min</span>
            </div>
            <button
              onClick={() => alert('Safe evacuation route active! Bypassing blocked NH-106 via Village Link Road to Govt. High School.')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              View Map
            </button>
          </div>
        </div>

        {/* 3. Six Action Tiles Grid (Matching screenshot) */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* I Am Safe */}
          <button
            onClick={handleMarkSafe}
            className={`p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all ${
              markedSafe ? 'border-emerald-500 bg-emerald-50' : ''
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              markedSafe ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-600'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">
              {markedSafe ? '✓ Safe' : 'I Am Safe'}
            </span>
          </button>

          {/* Report Hazard */}
          <button
            onClick={() => setShowHazardModal(true)}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Report Hazard</span>
          </button>

          {/* Road Status */}
          <button
            onClick={() => alert('Road Status: NH-106 near Nongstoin is BLOCKED due to rockfall. Use East Khasi Highway corridor.')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Road Status</span>
          </button>

          {/* Shelters */}
          <button
            onClick={() => alert('Active Open Shelters:\n1. Govt. High School (1.2 km) - OPEN (380 spots)\n2. Mawsynram Relief Camp (3.4 km) - OPEN')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Shelters</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() => alert('Recent Local Alerts:\n• Critical Rain: 148mm recorded in past 24 hrs\n• Slope Creep warning issued for Sector 3')}
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Alerts</span>
          </button>

          {/* Helpline */}
          <a
            href="tel:108"
            className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-card hover:bg-slate-50 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800">Helpline</span>
          </a>
        </div>

        {/* 4. Community Update Card (Matching screenshot) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold uppercase">Community Update</span>
            <p className="font-bold text-xs text-slate-800 mt-0.5">320 families evacuated from Upper Village</p>
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

      </main>

      {/* Safety Instructions Modal */}
      {showSafetyModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Emergency Safety Protocols</h3>
              <button onClick={() => setShowSafetyModal(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold">
                1. If you hear cracking trees or rolling boulders, evacuate immediately to high open grounds.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                2. Stay clear of natural drainage channels and valley slopes where mudslides channel.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                3. Follow the designated safe route towards Govt. High School shelter.
              </div>
            </div>
            <button
              onClick={() => setShowSafetyModal(false)}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Report Hazard Modal */}
      {showHazardModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-slide-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Report Mountain Hazard</h3>
              <button onClick={() => setShowHazardModal(false)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {hazardSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-center text-xs font-bold">
                ✓ Report sent to Disaster Management Command Center!
              </div>
            ) : (
              <form onSubmit={handleReportHazard} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Hazard Type</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                  >
                    <option value="Tension Crack on Hill">Slope Tension Crack</option>
                    <option value="Active Mudflow">Active Mudflow / Soil Creep</option>
                    <option value="Road Blocked by Boulders">Road Blocked by Boulders</option>
                    <option value="Flooded Stream">River / Stream Overflow</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1">Observation Description</label>
                  <textarea
                    value={hazardDesc}
                    onChange={(e) => setHazardDesc(e.target.value)}
                    placeholder="e.g. 5cm wide crack near curve on upper road"
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl text-xs"
                >
                  Submit Emergency Report
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar (Matching screenshot) */}
      <nav className="bg-white border-t border-slate-100 px-6 py-2 flex justify-between items-center text-slate-400">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'map' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-bold">Map</span>
        </button>

        <button 
          onClick={() => setActiveTab('updates')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'updates' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold">Updates</span>
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'profile' ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

    </div>
  );
}
