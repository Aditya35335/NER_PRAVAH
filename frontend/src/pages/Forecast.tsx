/**
 * Forecast.tsx — 7-Day Landslide Risk Forecast
 *
 * Uses real Open-Meteo daily forecast endpoint for all monitored villages.
 * Computes predicted FS for each future day based on forecast rainfall + current soil state.
 * Shows timeline chart of predicted risk per village.
 */

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { CloudRain, AlertTriangle, CalendarDays, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { Village } from '../types';

interface ForecastDay {
  date: string;
  predictedRainfall: number;
  predictedRisk: number;
}

interface VillageForecast {
  village: Village;
  forecast: ForecastDay[];
  peakRisk: number;
  peakDate: string;
}

interface ForecastProps {
  villages: Village[];
}

const RISK_COLOR = (r: number) =>
  r >= 85 ? '#DC2626' : r >= 65 ? '#EA580C' : r >= 40 ? '#D97706' : '#10B981';

const RISK_LABEL = (r: number) =>
  r >= 85 ? 'CRITICAL' : r >= 65 ? 'HIGH' : r >= 40 ? 'MEDIUM' : 'LOW';

export default function Forecast({ villages }: ForecastProps) {
  const [forecasts, setForecasts] = useState<VillageForecast[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());
  const [selected,  setSelected]  = useState<string | null>(null);

  const loadForecasts = async () => {
    setLoading(true);
    const results: VillageForecast[] = [];

    for (const v of villages) {
      try {
        const res = await fetch(`/api/predict?lat=${v.latitude}&lng=${v.longitude}&name=${encodeURIComponent(v.name)}`);
        if (res.ok) {
          const data = await res.json();
          const fc: ForecastDay[] = data.forecast7day || [];
          const peakDay = fc.reduce((max, d) => d.predictedRisk > max.predictedRisk ? d : max, fc[0] || { predictedRisk: 0, date: '', predictedRainfall: 0 });
          results.push({
            village:  v,
            forecast: fc,
            peakRisk: peakDay?.predictedRisk ?? v.riskScore,
            peakDate: peakDay?.date ?? '',
          });
        }
        await new Promise(r => setTimeout(r, 400));
      } catch { /* skip */ }
    }

    results.sort((a, b) => b.peakRisk - a.peakRisk);
    setForecasts(results);
    if (results.length && !selected) setSelected(results[0].village.id);
    setLastFetch(new Date());
    setLoading(false);
  };

  useEffect(() => { loadForecasts(); }, []);

  const selForecast = forecasts.find(f => f.village.id === selected);

  // Build combined chart data (all villages by date)
  const allDates = selForecast?.forecast.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }) ?? [];

  const chartData = allDates.map((label, i) => {
    const entry: any = { date: label };
    forecasts.forEach(f => {
      entry[f.village.name] = f.forecast[i]?.predictedRisk ?? 0;
    });
    return entry;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-900">7-Day Landslide Risk Forecast</h1>
            <p className="text-xs text-slate-500">
              Real Open-Meteo daily forecast rainfall → predicted FS → predicted risk score per village
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Updated: {lastFetch.toLocaleTimeString()}
          </span>
          <button onClick={loadForecasts} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-slate-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 animate-pulse opacity-40" />
          <p className="text-sm font-medium">Fetching 7-day forecast from Open-Meteo for {villages.length} villages…</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left — village list */}
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider px-1">Villages by Peak 7-Day Risk</h2>
            {forecasts.map(f => (
              <button key={f.village.id}
                onClick={() => setSelected(f.village.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selected === f.village.id
                    ? 'ring-2 ring-offset-1 ring-blue-400 bg-blue-50 border-blue-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-xs text-slate-900">{f.village.name}</p>
                    <p className="text-[10px] text-slate-500">{f.village.districtId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                    style={{ background: RISK_COLOR(f.peakRisk) }}>
                    {f.peakRisk}% peak
                  </span>
                </div>

                {/* Mini 7-day bars */}
                <div className="mt-2 flex gap-0.5 items-end h-8">
                  {f.forecast.map((day, i) => (
                    <div key={i} className="flex-1 rounded-sm"
                      style={{
                        height: `${Math.max(10, day.predictedRisk)}%`,
                        background: RISK_COLOR(day.predictedRisk),
                        opacity: 0.85
                      }}
                      title={`${day.date}: ${day.predictedRisk}% risk, ${day.predictedRainfall}mm rain`}
                    />
                  ))}
                </div>

                <div className="mt-1.5 flex justify-between text-[9px] text-slate-400">
                  <span>Today</span>
                  <span>Day 7</span>
                </div>

                {f.peakRisk >= 65 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold"
                    style={{ color: RISK_COLOR(f.peakRisk) }}>
                    <AlertTriangle className="w-3 h-3" />
                    {RISK_LABEL(f.peakRisk)} expected on {f.peakDate ? new Date(f.peakDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Day 7'}
                  </div>
                )}
                {f.peakRisk < 40 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    No significant risk forecast
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right — detail chart for selected village */}
          <div className="lg:col-span-8 space-y-5">
            {selForecast && (
              <>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{selForecast.village.name} — 7-Day Risk Forecast</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Predicted FS computed from Open-Meteo daily rainfall + current soil saturation state
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-xs font-extrabold text-white"
                      style={{ background: RISK_COLOR(selForecast.peakRisk) }}>
                      Peak: {selForecast.peakRisk}% ({RISK_LABEL(selForecast.peakRisk)})
                    </span>
                  </div>

                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selForecast.forecast.map(d => ({
                        date:  new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
                        risk:  d.predictedRisk,
                        rain:  d.predictedRainfall,
                      }))}>
                        <defs>
                          <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#DC2626" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="#94A3B8" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="#94A3B8" unit="%" />
                        <Tooltip formatter={(v: any, name) => [name === 'risk' ? `${v}%` : `${v}mm`, name === 'risk' ? 'Risk Score' : 'Rainfall']} />
                        <Area type="monotone" dataKey="risk" stroke="#DC2626" strokeWidth={2.5} fill="url(#riskGrad)" name="risk" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-bold text-xs text-slate-800 mb-3">Forecast Rainfall vs Risk — {selForecast.village.name}</h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selForecast.forecast.map(d => ({
                        date: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
                        rain: d.predictedRainfall,
                        risk: d.predictedRisk,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="rain" fill="#3B82F6" radius={[3,3,0,0]} name="Forecast Rain (mm)" />
                        <Bar dataKey="risk" fill="#DC2626" radius={[3,3,0,0]} name="Predicted Risk (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Day-by-day table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">
                  <h4 className="font-bold text-xs text-slate-800 mb-3">Daily Breakdown</h4>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
                        <th className="text-left py-2 pr-3">Date</th>
                        <th className="text-right pr-3">Forecast Rain</th>
                        <th className="text-right pr-3">Predicted Risk</th>
                        <th className="text-right">Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selForecast.forecast.map((d, i) => (
                        <tr key={i} className={d.predictedRisk >= 65 ? 'bg-red-50' : ''}>
                          <td className="py-2 pr-3 font-medium text-slate-700">
                            {new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </td>
                          <td className="text-right pr-3 text-blue-700 font-bold">{d.predictedRainfall} mm</td>
                          <td className="text-right pr-3 font-extrabold" style={{ color: RISK_COLOR(d.predictedRisk) }}>
                            {d.predictedRisk}%
                          </td>
                          <td className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white"
                              style={{ background: RISK_COLOR(d.predictedRisk) }}>
                              {RISK_LABEL(d.predictedRisk)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
