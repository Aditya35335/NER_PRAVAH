import React from 'react';
import { Shield, Map, Activity, PhoneCall, Wifi, Database, Code, Play, AlertTriangle } from 'lucide-react';

interface LandingPageProps {
  onExplore: () => void;
}

export default function LandingPage({ onExplore }: LandingPageProps) {
  return (
    <div className="bg-[#0B0F19] text-gray-100 min-h-screen font-sans">
      
      {/* Premium Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 flex flex-col items-center text-center overflow-hidden border-b border-brand-border">
        {/* Background Glowing Orb Effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-risk-critical/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-risk-critical flex items-center justify-center shadow-glow-red mb-6 animate-pulse">
            <Shield className="w-9 h-9 text-white" />
          </div>
          
          <h1 className="font-orbitron font-extrabold text-4xl sm:text-6xl tracking-wider uppercase leading-tight">
            PRAHARI
          </h1>
          <p className="text-risk-critical font-bold text-xs sm:text-sm tracking-[0.25em] uppercase mt-2">
            Predictive Risk & Hazard Alert for Rapid Action & Incident Response
          </p>
          
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-300 mt-6 max-w-2xl leading-relaxed">
            AI-Powered Landslide Early Warning, Evacuation & Disaster Response Platform for the North Eastern Region of India.
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full sm:w-auto">
            <button 
              onClick={onExplore}
              className="px-8 py-4 bg-brand-accent hover:bg-blue-600 text-white font-bold rounded-lg shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-md"
            >
              <Play className="w-5 h-5 fill-current" />
              EXPLORE LIVE DEMO
            </button>
            <a 
              href="#how-it-works"
              className="px-8 py-4 bg-transparent hover:bg-brand-card border border-brand-border text-gray-300 font-bold rounded-lg transition-all flex items-center justify-center text-md"
            >
              HOW IT WORKS
            </a>
          </div>
        </div>
      </section>

      {/* How it Works / Core Features */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl tracking-wide uppercase">Core Capabilities</h2>
          <p className="text-gray-400 mt-2">Full-stack early warning and response coordination workflow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 bg-brand-card border border-brand-border rounded-xl flex flex-col h-full hover:border-brand-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-brand-accent/15 flex items-center justify-center text-brand-accent mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">AI Risk Early Warning</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow leading-relaxed">
              Synthesizes real-time rainfall, telemetry soil moisture, digital elevation slope degrees, and historical databases to calculate landslide risk indexes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-brand-card border border-brand-border rounded-xl flex flex-col h-full hover:border-brand-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-risk-critical/15 flex items-center justify-center text-risk-critical mb-4">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">GIS Command Map</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow leading-relaxed">
              Provides interactive geographic visualization. Renders risk boundaries, evacuation shelter capacities, blocked road statuses, and safe pathways overlay.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-brand-card border border-brand-border rounded-xl flex flex-col h-full hover:border-brand-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-risk-medium/15 flex items-center justify-center text-risk-medium mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">Evacuation Accountability</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow leading-relaxed">
              Combines estimated population parameters with field volunteer confirmation checks and shelter logs. Flags unevacuated and isolated households.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-brand-card border border-brand-border rounded-xl flex flex-col h-full hover:border-brand-accent/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-100">Offline-First Mobile View</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow leading-relaxed">
              Mobile portal designed for villagers and field volunteers. Runs offline when cell towers go down, queueing local changes to sync immediately upon reconnection.
            </p>
          </div>

        </div>
      </section>

      {/* Dynamic API Architecture Highlight */}
      <section className="bg-brand-card/50 border-y border-brand-border py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl tracking-wide uppercase">
              Production-Ready API Abstraction
            </h2>
            <p className="text-gray-400 mt-4 leading-relaxed">
              Unlike static prototypes, PRAHARI operates using a backend service layer. All connections (IMD Weather, ISRO DEM, Bhuvan radar, NIC SMS alerts) communicate via backend proxy services. No secret tokens are exposed on the client side.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#1E293B] flex items-center justify-center text-brand-accent shrink-0 font-mono font-bold">1</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Interactive Telemetry Sync</h4>
                  <p className="text-xs text-gray-400 mt-1">Real-time WebSockets push warnings, route blockages, and check-ins without dashboard refreshing.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#1E293B] flex items-center justify-center text-brand-accent shrink-0 font-mono font-bold">2</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Dynamic Live Fallback</h4>
                  <p className="text-xs text-gray-400 mt-1">Performs credentials validation and endpoint ping tests. If a live API goes offline, the system safely falls back to demo mode without crashing.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-[#1E293B] flex items-center justify-center text-brand-accent shrink-0 font-mono font-bold">3</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">External ML Interface</h4>
                  <p className="text-xs text-gray-400 mt-1">Connects seamlessly to Python-based ML APIs (FastAPI/Flask) for landslide trigger warnings, simulating inputs in demo mode.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Stack Visualization */}
          <div className="p-6 bg-brand-card border border-brand-border rounded-xl">
            <h3 className="font-orbitron font-semibold text-xs tracking-wider text-brand-accent uppercase mb-4">PRAHARI Technical Architecture</h3>
            
            <div className="space-y-3">
              {/* Frontend Node */}
              <div className="p-3 bg-[#1E293B] border border-brand-border rounded flex justify-between items-center text-xs">
                <span className="font-mono text-gray-300">React Client (Vite + Tailwind)</span>
                <span className="px-2 py-0.5 bg-brand-accent/20 text-brand-accent rounded text-[10px] font-bold">FRONTEND</span>
              </div>
              
              {/* WS Link */}
              <div className="h-6 flex items-center justify-center">
                <div className="w-0.5 h-full bg-brand-border border-dashed border-l"></div>
                <span className="text-[10px] text-gray-500 font-mono mx-2">WebSocket / Event Stream</span>
              </div>

              {/* Express Server Node */}
              <div className="p-3 bg-[#1E293B] border border-brand-border rounded flex justify-between items-center text-xs">
                <span className="font-mono text-gray-300">Express API Abstraction Layer</span>
                <span className="px-2 py-0.5 bg-risk-medium/20 text-risk-medium rounded text-[10px] font-bold">SERVER</span>
              </div>

              {/* DB & Providers Link */}
              <div className="h-6 flex items-center justify-center">
                <div className="w-0.5 h-full bg-brand-border border-dashed border-l"></div>
                <span className="text-[10px] text-gray-500 font-mono mx-2">Internal Router</span>
              </div>

              {/* Services grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-brand-dark border border-brand-border rounded text-center text-xs">
                  <Database className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span className="font-mono text-gray-400 text-[10px]">JsonDB persistent schema</span>
                </div>
                <div className="p-2.5 bg-brand-dark border border-brand-border rounded text-center text-xs">
                  <Code className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span className="font-mono text-gray-400 text-[10px]">Demo/Live Provider Hooks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Public Safety Warning Disclaimer */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <div className="p-4 bg-brand-card border border-amber-500/20 rounded-lg flex items-start gap-3 text-left">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-gray-100">Disaster Decision-Support Notice</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              PRAHARI is designed to assist regional officers with risk indicators and routing suggestions. AI scores are advisory calculations and do not provide absolute guarantees of slide occurrences or total evacuation counts. Physical verification and field radio communications remain vital elements of emergency response.
            </p>
          </div>
        </div>
      </section>

      {/* Main CTA footer */}
      <section className="py-16 text-center border-t border-brand-border">
        <button 
          onClick={onExplore}
          className="px-10 py-5 bg-risk-critical hover:bg-red-600 text-white font-bold rounded-lg shadow-glow-red hover:scale-[1.02] transition-all text-lg font-orbitron tracking-wider"
        >
          ENTER DISASTER COMMAND PORTAL
        </button>
      </section>

    </div>
  );
}
