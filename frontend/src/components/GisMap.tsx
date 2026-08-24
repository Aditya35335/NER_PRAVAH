/**
 * GisMap.tsx — Full PRAHARI GIS Map
 * 
 * Renders from REAL database props:
 *  • Villages    → colored pulsing circles by risk level
 *  • Shelters    → green shield markers with capacity badge
 *  • Roads       → colored polylines (green/amber/red) with blockage icons
 *  • Risk Zones  → translucent fill polygons around critical areas
 *  • Evac Routes → blue dashed OSRM road-following polylines for HIGH/CRITICAL villages
 *  • Alert Panel → explains WHY each alert was raised (rainfall, soil, slope, FS)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Village, Shelter, Road, Alert } from '../types';
import {
  Navigation, Search, MapPin, AlertTriangle, CheckCircle2,
  CloudRain, Droplets, Mountain, Route, Zap, Cloud, Layers, Compass, X
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface GisMapProps {
  villages:  Village[];
  shelters:  Shelter[];
  roads:     Road[];
  alerts:    Alert[];
  emergencyMode?: boolean;
  lang?: Language;
}

const OWM_KEY = '54aed839fb82bd7c5f6c957ca7365960';

const RISK_COLOR: Record<string, string> = {
  CRITICAL: '#DC2626',
  HIGH:     '#EA580C',
  MEDIUM:   '#D97706',
  LOW:      '#10B981'
};

const ROAD_COLOR: Record<string, string> = {
  SAFE:    '#10B981',
  WARNING: '#D97706',
  BLOCKED: '#DC2626',
  UNKNOWN: '#94A3B8'
};

// ── Leaflet icon builders ───────────────────────────────────────────────────

function villageIcon(v: Village) {
  const color = RISK_COLOR[v.riskLevel] || '#94A3B8';
  const pulse  = v.riskLevel === 'CRITICAL' ? 'animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;' : '';
  const label  = v.riskLevel === 'CRITICAL' ? '!' : v.riskLevel === 'HIGH' ? '▲' : v.riskLevel === 'MEDIUM' ? '~' : '✓';
  return L.divIcon({
    className: '',
    iconSize:  [36, 36],
    iconAnchor:[18, 18],
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.35;${pulse}"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:${color};border:2px solid white;
                    box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;
                    color:white;font-weight:900;font-size:13px;">${label}</div>
      </div>`
  });
}

function shelterIcon(capacity: number, occupied: number) {
  const pct   = Math.round((occupied / capacity) * 100);
  const color = pct >= 90 ? '#DC2626' : pct >= 70 ? '#D97706' : '#10B981';
  return L.divIcon({
    className: '',
    iconSize:  [34, 34],
    iconAnchor:[17, 17],
    html: `
      <div style="width:34px;height:34px;border-radius:6px;background:${color};border:2.5px solid white;
                  box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;
                  color:white;font-size:16px;" title="${pct}% full">🏠</div>`
  });
}

function blockIcon() {
  return L.divIcon({
    className: '',
    iconSize:  [70, 24],
    iconAnchor:[35, 12],
    html: `<div style="background:#DC2626;color:white;font-size:10px;font-weight:900;
                        border-radius:4px;padding:2px 6px;border:1.5px solid white;white-space:nowrap;
                        box-shadow:0 2px 5px rgba(0,0,0,0.4);">⛔ BLOCKED</div>`
  });
}

// ── Component ───────────────────────────────────────────────────────────────

export default function GisMap({ villages, shelters, roads, alerts, lang = 'en' }: GisMapProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const wrapperRef    = useRef<HTMLDivElement>(null);   // ← fullscreen target
  const mapRef        = useRef<L.Map | null>(null);
  const satLayerRef   = useRef<L.TileLayer | null>(null);
  const osmLayerRef   = useRef<L.TileLayer | null>(null);
  const rainLayerRef  = useRef<L.TileLayer | null>(null);
  const cloudLayerRef = useRef<L.TileLayer | null>(null);
  const overlaysRef   = useRef<L.LayerGroup>(L.layerGroup());
  const routesRef     = useRef<L.LayerGroup>(L.layerGroup());

  const [mapType,     setMapType]     = useState<'satellite' | 'street'>('satellite');
  const [showRain,    setShowRain]    = useState(true);
  const [showCloud,   setShowCloud]   = useState(false);
  const [showHeat,    setShowHeat]    = useState(true);
  const [searchQ,     setSearchQ]     = useState('');
  const [searchRes,   setSearchRes]   = useState<any[]>([]);
  const [alertPanel,  setAlertPanel]  = useState<{ village: Village; alert?: Alert } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Fullscreen toggle ────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => mapRef.current?.invalidateSize(), 300);
      }).catch(console.warn);
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(() => mapRef.current?.invalidateSize(), 300);
      }).catch(console.warn);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // ── Init map (runs once) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Centre on NER (the focus of this project)
    const map = L.map(containerRef.current, {
      center: [25.6, 91.5],
      zoom:   8,
      zoomControl: false
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const sat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, attribution: '© Esri World Imagery' }
    );
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '© OpenStreetMap'
    });
    const rain = L.tileLayer(
      `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
      { maxZoom: 18, opacity: 0.72, attribution: '© OpenWeatherMap' }
    );
    const clouds = L.tileLayer(
      `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
      { maxZoom: 18, opacity: 0.60, attribution: '© OpenWeatherMap' }
    );

    sat.addTo(map);
    rain.addTo(map);
    overlaysRef.current.addTo(map);
    routesRef.current.addTo(map);

    satLayerRef.current   = sat;
    osmLayerRef.current   = osm;
    rainLayerRef.current  = rain;
    cloudLayerRef.current = clouds;
    mapRef.current        = map;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Render all DB data on map whenever props change ──────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    overlaysRef.current.clearLayers();
    routesRef.current.clearLayers();

    // 1. RISK ZONE POLYGONS — drawn under everything else
    if (showHeat) {
      villages.forEach(v => {
        if (v.riskLevel === 'LOW') return;
        const color   = RISK_COLOR[v.riskLevel];
        const radiusM = v.riskLevel === 'CRITICAL' ? 6000 : v.riskLevel === 'HIGH' ? 4500 : 2800;
        const circle  = L.circle([v.latitude, v.longitude], {
          color,
          fillColor: color,
          fillOpacity: v.riskLevel === 'CRITICAL' ? 0.28 : 0.18,
          weight: 1.5,
          radius: radiusM
        });
        circle.bindTooltip(`<b>${v.name}</b> — ${v.riskLevel} Risk Zone`, { sticky: true });
        overlaysRef.current.addLayer(circle);
      });
    }

    // 2. ROADS — coloured polylines with blockage badge
    roads.forEach(road => {
      const color = ROAD_COLOR[road.status] || '#94A3B8';
      const poly  = L.polyline(
        [[road.latStart, road.lngStart], [road.latEnd, road.lngEnd]],
        { color, weight: road.status === 'BLOCKED' ? 5 : 3.5, opacity: 0.9,
          dashArray: road.status === 'WARNING' ? '6 4' : undefined }
      );
      poly.bindTooltip(
        `<b>${road.name}</b><br/>Status: <b style="color:${color}">${road.status}</b>` +
        (road.blockageReason ? `<br/>${road.blockageReason}` : ''),
        { sticky: true }
      );
      overlaysRef.current.addLayer(poly);

      // Blockage badge
      if (road.status === 'BLOCKED') {
        const midLat = (road.latStart + road.latEnd) / 2;
        const midLng = (road.lngStart + road.lngEnd) / 2;
        overlaysRef.current.addLayer(L.marker([midLat, midLng], { icon: blockIcon() }));
      }
    });

    // 3. SHELTERS — green square markers
    shelters.forEach(shelter => {
      const marker = L.marker([shelter.latitude, shelter.longitude], {
        icon: shelterIcon(shelter.capacity, shelter.occupied)
      });
      const pct = Math.round((shelter.occupied / shelter.capacity) * 100);
      marker.bindPopup(`
        <div style="font-family:sans-serif;padding:4px;min-width:180px">
          <div style="font-weight:900;font-size:13px;margin-bottom:4px">🏠 ${shelter.name}</div>
          <div style="font-size:11px;color:#374151">${shelter.location}</div>
          <hr style="margin:6px 0;border-color:#E5E7EB"/>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
            <div><span style="color:#6B7280">Capacity</span><br/><b>${shelter.capacity}</b></div>
            <div><span style="color:#6B7280">Occupied</span><br/><b>${shelter.occupied} (${pct}%)</b></div>
          </div>
          <div style="margin-top:6px;font-size:11px">
            <span style="color:#6B7280">Status:</span>
            <b style="color:${shelter.status === 'OPEN' ? '#10B981' : '#D97706'}">${shelter.status}</b>
          </div>
          <div style="margin-top:4px;font-size:10px;color:#6B7280">${shelter.facilities?.join(' · ')}</div>
        </div>
      `);
      overlaysRef.current.addLayer(marker);
    });

    // 4. VILLAGES — risk-coloured pulsing markers with full alert popup
    villages.forEach(v => {
      const marker = L.marker([v.latitude, v.longitude], { icon: villageIcon(v) });
      const villageAlert = alerts.find(a => a.villageId === v.id);
      const shelter     = shelters.find(s => s.id === v.shelterId);

      // FS calculation for display (same formula as backend)
      const theta   = (v.slope * Math.PI) / 180;
      const gamma   = 18.0, gammaW = 9.81, z = 2.5, phi = 28;
      const phiR    = (phi * Math.PI) / 180;
      const hw      = z * Math.min(1, v.soilMoisture / 100);
      const num     = 5 + (gamma * z - gammaW * hw) * Math.cos(theta) ** 2 * Math.tan(phiR);
      const den     = gamma * z * Math.sin(theta) * Math.cos(theta);
      const fs      = den > 0 ? (num / den).toFixed(2) : 'N/A';
      const fsColor = parseFloat(fs) < 1.0 ? '#DC2626' : parseFloat(fs) < 1.3 ? '#EA580C' : '#10B981';

      const popHtml = `
        <div style="font-family:sans-serif;padding:4px;min-width:220px;max-width:260px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <div style="font-weight:900;font-size:13px">${v.name}</div>
            <span style="background:${RISK_COLOR[v.riskLevel]};color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:900">${v.riskLevel} · ${v.riskScore}%</span>
          </div>
          <hr style="margin:6px 0;border-color:#E5E7EB"/>

          ${villageAlert ? `
          <div style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:6px;padding:6px;margin-bottom:8px;font-size:11px">
            <b style="color:#DC2626">⚠ ALERT: ${villageAlert.title}</b><br/>
            <span style="color:#7F1D1D">${villageAlert.reason}</span>
          </div>` : ''}

          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:10px;margin-bottom:8px">
            <div style="background:#F8FAFC;border-radius:4px;padding:4px;text-align:center">
              <div style="color:#64748B">🌧 24h Rain</div><b>${v.rainfall}mm</b>
            </div>
            <div style="background:#F8FAFC;border-radius:4px;padding:4px;text-align:center">
              <div style="color:#64748B">💧 Soil Sat.</div><b>${v.soilMoisture}%</b>
            </div>
            <div style="background:#F8FAFC;border-radius:4px;padding:4px;text-align:center">
              <div style="color:#64748B">⛰ Slope</div><b>${v.slope}°</b>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:10px;margin-bottom:8px">
            <div style="background:#F8FAFC;border-radius:4px;padding:4px">
              <div style="color:#64748B">Population</div><b>${v.estimatedPopulation.toLocaleString()}</b>
            </div>
            <div style="background:${fsColor}18;border:1px solid ${fsColor}44;border-radius:4px;padding:4px">
              <div style="color:#64748B">Factor of Safety</div>
              <b style="color:${fsColor};font-size:13px">${fs}</b>
              <span style="font-size:9px;color:${fsColor}">${parseFloat(fs) < 1.0 ? ' ⚠ FAILURE RISK' : parseFloat(fs) < 1.3 ? ' HIGH' : ' STABLE'}</span>
            </div>
          </div>

          ${shelter ? `
          <div style="font-size:11px;background:#F0FDF4;border:1px solid #86EFAC;border-radius:6px;padding:6px">
            🏠 <b>Assigned Shelter:</b> ${shelter.name}<br/>
            <span style="color:#6B7280">Available: ${shelter.capacity - shelter.occupied} spots</span>
          </div>` : ''}

          <div style="margin-top:8px;font-size:10px">
            <span style="color:#6B7280">Evacuation:</span>
            <b style="color:${v.evacuationStatus === 'IN_PROGRESS' ? '#D97706' : '#10B981'}">${v.evacuationStatus?.replace('_', ' ')}</b>
            &nbsp;|&nbsp;
            <span style="color:#6B7280">Road:</span>
            <b style="color:${ROAD_COLOR[v.roadStatus]}">${v.roadStatus}</b>
          </div>
        </div>
      `;

      marker.bindPopup(popHtml, { maxWidth: 280 });
      overlaysRef.current.addLayer(marker);
    });

    // 5. EVACUATION ROUTES — draw OSRM routes for HIGH/CRITICAL villages
    const urgentVillages = villages.filter(v => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH');
    urgentVillages.forEach(async v => {
      const shelter = shelters.find(s => s.id === v.shelterId) ?? shelters[0];
      if (!shelter) return;
      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${v.longitude},${v.latitude};${shelter.longitude},${shelter.latitude}?overview=full&geometries=geojson`;
        const res = await fetch(osrmUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.routes?.[0]) {
            const coords: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
            const color = v.riskLevel === 'CRITICAL' ? '#DC2626' : '#3B82F6';
            const line  = L.polyline(coords, {
              color,
              weight:    4,
              opacity:   0.9,
              dashArray: '6 8'
            });
            const distKm = Math.round(data.routes[0].distance / 100) / 10;
            const mins   = Math.round(data.routes[0].duration / 60);
            line.bindTooltip(
              `<b>Evacuation Route: ${v.name} → ${shelter.name}</b><br/>${distKm} km · ~${mins} min`,
              { sticky: true }
            );
            routesRef.current.addLayer(line);

            // Arrow at midpoint showing direction
            const mid = coords[Math.floor(coords.length / 2)];
            if (mid) {
              const arrow = L.marker(mid, {
                icon: L.divIcon({
                  className: '',
                  iconSize: [60, 20],
                  html: `<div style="background:${color};color:white;font-size:9px;font-weight:900;border-radius:4px;padding:2px 6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.3)">
                    ➔ ${distKm}km · ${mins}m
                  </div>`
                })
              });
              routesRef.current.addLayer(arrow);
            }
          }
        }
      } catch {
        // Fallback: straight dashed line
        const shelter2 = shelters.find(s => s.id === v.shelterId) ?? shelters[0];
        if (!shelter2) return;
        routesRef.current.addLayer(L.polyline(
          [[v.latitude, v.longitude], [shelter2.latitude, shelter2.longitude]],
          { color: '#3B82F6', weight: 3, dashArray: '6 8', opacity: 0.7 }
        ));
      }
    });

  }, [villages, shelters, roads, alerts, showHeat]);

  // ── Layer toggles ────────────────────────────────────────────────────────
  const toggleBasemap = (type: 'satellite' | 'street') => {
    const map = mapRef.current;
    if (!map) return;
    setMapType(type);
    if (type === 'satellite') {
      osmLayerRef.current && map.removeLayer(osmLayerRef.current);
      satLayerRef.current && !map.hasLayer(satLayerRef.current) && satLayerRef.current.addTo(map);
    } else {
      satLayerRef.current && map.removeLayer(satLayerRef.current);
      osmLayerRef.current && !map.hasLayer(osmLayerRef.current) && osmLayerRef.current.addTo(map);
    }
  };

  const toggleRain = () => {
    const map = mapRef.current; const layer = rainLayerRef.current;
    if (!map || !layer) return;
    if (showRain) { map.removeLayer(layer); setShowRain(false); }
    else          { layer.addTo(map);       setShowRain(true);  }
  };

  const toggleCloud = () => {
    const map = mapRef.current; const layer = cloudLayerRef.current;
    if (!map || !layer) return;
    if (showCloud) { map.removeLayer(layer); setShowCloud(false); }
    else           { layer.addTo(map);       setShowCloud(true);  }
  };

  const toggleHeat = () => setShowHeat(h => !h);

  // ── Location search ──────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQ)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchRes(data);
        if (data[0]) mapRef.current?.flyTo([data[0].lat, data[0].lng], 12, { duration: 1.4 });
      }
    } catch {}
  };

  const handleLocateMe = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      mapRef.current?.flyTo([pos.coords.latitude, pos.coords.longitude], 12);
    });
  };

  // ── Alert explanation panel (left side) ─────────────────────────────────
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');

  return (
    <div
      ref={wrapperRef}
      className={`relative bg-slate-900 rounded-xl overflow-hidden shadow-card border border-surface-border ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full h-full'
      }`}
      style={{ minHeight: isFullscreen ? '100vh' : '480px' }}
    >
      {/* Map Canvas */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: isFullscreen ? '100vh' : '480px' }} />


      {/* ── TOP-LEFT: Search ── */}
      <div className="absolute top-3 left-3 z-[1000] w-64">
        <form onSubmit={handleSearch} className="relative">
          <input
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search any place in India…"
            className="w-full bg-white/95 backdrop-blur-sm rounded-xl py-2 pl-9 pr-16 text-xs font-semibold text-slate-800 border border-slate-200 shadow-elevated focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <button type="submit" className="absolute right-1.5 top-1.5 px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">Go</button>
        </form>
        {searchRes.length > 0 && (
          <div className="mt-1 bg-white rounded-xl shadow-elevated border border-slate-200 max-h-40 overflow-y-auto">
            {searchRes.map((r, i) => (
              <button key={i} onClick={() => { mapRef.current?.flyTo([r.lat, r.lng], 12); setSearchRes([]); setSearchQ(r.name); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 last:border-0">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{r.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── TOP-RIGHT: Map Controls ── */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-wrap justify-end gap-1.5 max-w-sm">
        <button onClick={handleLocateMe}
          className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 border border-surface-border">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Locate Me</span>
        </button>

        {/* ⛶ Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'View Map Fullscreen'}
          className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 border border-surface-border"
        >
          <span className="text-base leading-none">{isFullscreen ? '⊠' : '⛶'}</span>
          <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
        </button>

        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-1 shadow border border-surface-border flex gap-1">
          {(['satellite', 'street'] as const).map(t => (
            <button key={t} onClick={() => toggleBasemap(t)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${mapType === t ? 'bg-forest-sidebar text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t === 'satellite' ? '🛰️ Satellite' : '🗺️ Street'}
            </button>
          ))}
        </div>

        <button onClick={toggleRain}
          className={`px-2.5 py-1.5 rounded-lg shadow text-[11px] font-bold flex items-center gap-1 border transition-all ${showRain ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/95 text-slate-700 border-surface-border'}`}>
          <CloudRain className="w-3.5 h-3.5" /> Rain Radar
        </button>
        <button onClick={toggleCloud}
          className={`px-2.5 py-1.5 rounded-lg shadow text-[11px] font-bold flex items-center gap-1 border transition-all ${showCloud ? 'bg-slate-700 text-white border-slate-800' : 'bg-white/95 text-slate-700 border-surface-border'}`}>
          <Cloud className="w-3.5 h-3.5" /> Clouds
        </button>
        <button onClick={toggleHeat}
          className={`px-2.5 py-1.5 rounded-lg shadow text-[11px] font-bold flex items-center gap-1 border transition-all ${showHeat ? 'bg-red-600 text-white border-red-700' : 'bg-white/95 text-slate-700 border-surface-border'}`}>
          <Layers className="w-3.5 h-3.5" /> Risk Zones
        </button>
      </div>

      {/* ── LEFT PANEL: Alert Explanations ── */}
      {criticalAlerts.length > 0 && (
        <div className="absolute left-3 bottom-3 z-[1000] space-y-2 max-w-xs w-64">
          {criticalAlerts.map(alert => {
            const v = villages.find(x => x.id === alert.villageId);
            if (!v) return null;

            // Compute FS for display
            const theta  = (v.slope * Math.PI) / 180;
            const hw     = 2.5 * Math.min(1, v.soilMoisture / 100);
            const num    = 5 + (18 * 2.5 - 9.81 * hw) * Math.cos(theta) ** 2 * Math.tan(28 * Math.PI / 180);
            const den    = 18 * 2.5 * Math.sin(theta) * Math.cos(theta);
            const fs     = den > 0 ? (num / den).toFixed(2) : 'N/A';

            return (
              <div key={alert.id}
                className="bg-white/95 backdrop-blur-sm border border-red-200 rounded-2xl p-3 shadow-elevated text-xs space-y-2 animate-slide-in">
                
                {/* Alert header */}
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${alert.severity === 'CRITICAL' ? 'text-red-600 animate-bounce' : 'text-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate text-[11px]">{v.name}</p>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {alert.severity} ALERT
                    </span>
                  </div>
                  <span className="font-extrabold text-sm" style={{ color: RISK_COLOR[v.riskLevel] }}>{v.riskScore}%</span>
                </div>

                {/* WHY this alert — the key requirement */}
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Why this alert was triggered:</p>
                  
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="text-slate-700">
                      Rainfall <b className={v.rainfall > 100 ? 'text-red-600' : 'text-orange-600'}>{v.rainfall}mm</b>
                      <span className="text-slate-400"> (24h · threshold 80mm)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-3 h-3 text-cyan-500 shrink-0" />
                    <span className="text-slate-700">
                      Soil saturation <b className={v.soilMoisture > 80 ? 'text-red-600' : 'text-orange-600'}>{v.soilMoisture}%</b>
                      <span className="text-slate-400"> (threshold 80%)</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Mountain className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="text-slate-700">
                      Slope <b>{v.slope}°</b> at <b>{v.elevation}m</b> elevation
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-slate-700">
                      Factor of Safety <b className={parseFloat(fs) < 1.0 ? 'text-red-600' : 'text-orange-600'}>FS = {fs}</b>
                      <span className="text-red-500 font-bold">{parseFloat(fs) < 1.0 ? ' ← below 1.0!' : ''}</span>
                    </span>
                  </div>
                </div>

                {/* Evacuation status */}
                <div className="pt-1 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[9px] text-slate-500">
                    Pop: <b>{v.estimatedPopulation}</b> · Evac: <b className="text-amber-600">{v.evacuationStatus?.replace('_',' ')}</b>
                  </span>
                  <div className="flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-blue-500" />
                    <span className="text-[9px] text-blue-600 font-bold">Route drawn on map</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── BOTTOM-RIGHT: Legend ── */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow border border-surface-border text-[10px] font-medium text-slate-700 space-y-1.5">
        <p className="font-bold text-[9px] uppercase text-slate-400 tracking-wider mb-1">Map Legend</p>
        {[['#DC2626','Critical Risk Zone'],['#EA580C','High Risk Zone'],['#D97706','Medium Risk Zone'],['#10B981','Safe Shelter'],['#3B82F6','Evacuation Route']].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: c }}></span>
            <span>{l}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5"><span className="text-[11px]">⛔</span><span>Road Blocked</span></div>
        <div className="flex items-center gap-1.5"><span className="text-[11px]">!</span><span>Village Marker (click for detail)</span></div>
      </div>

    </div>
  );
}
