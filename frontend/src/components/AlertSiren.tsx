/**
 * AlertSiren.tsx
 *
 * Emergency Siren & Targeted Evacuation Signal Receiver:
 *  1. Plays a loud synthesized siren via Web Audio API for EXACTLY 5 SECONDS.
 *  2. Activates ONLY when a genuine danger signal or critical alert matches the resident's GPS/registered sector.
 *  3. Prevents duplicate spam via a 60-second idempotency cooldown.
 *  4. Shows a high-priority emergency banner with immediate shelter guidance.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, AlertTriangle, X, ShieldAlert, Navigation, Landmark } from 'lucide-react';
import { Alert } from '../types';
import { subscribeToSirenSignals, SirenSignal } from '../firebase';

interface AlertSirenProps {
  alerts: Alert[];
  userVillageId?: string;
  userCoords?: [number, number];
  portalMode?: 'authority' | 'villager' | 'volunteer';
}

// ── Web Audio Siren Synthesizer (Plays for exactly durationSeconds) ───────────
function createSiren(ctx: AudioContext, durationSeconds: number = 5): { start: () => void; stop: () => void } {
  let stopped = false;
  const oscillator = ctx.createOscillator();
  const gainNode   = ctx.createGain();
  const lfo        = ctx.createOscillator();
  const lfoGain    = ctx.createGain();

  // LFO modulates frequency (creates the emergency wailing sweep)
  lfo.frequency.setValueAtTime(1.8, ctx.currentTime);
  lfoGain.gain.setValueAtTime(190, ctx.currentTime);
  oscillator.frequency.setValueAtTime(780, ctx.currentTime);

  lfo.connect(lfoGain);
  lfoGain.connect(oscillator.frequency);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sawtooth';
  gainNode.gain.setValueAtTime(0, ctx.currentTime);

  let timeoutId: number | null = null;

  return {
    start() {
      if (stopped) return;
      try {
        lfo.start();
        oscillator.start();
        // Ramp volume up to 0.22 over 0.25s
        gainNode.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.25);
        // Sustain until (duration - 0.5)s then ramp down to 0 at duration
        gainNode.gain.linearRampToValueAtTime(0.22, ctx.currentTime + Math.max(0.5, durationSeconds - 0.5));
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + durationSeconds);

        // Auto-stop audio nodes after exactly durationSeconds
        timeoutId = window.setTimeout(() => {
          try {
            oscillator.stop();
            lfo.stop();
          } catch { /* ignore */ }
        }, durationSeconds * 1000 + 100);
      } catch (e) {
        console.warn('[AlertSiren] Web Audio start notice:', e);
      }
    },
    stop() {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      try {
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        setTimeout(() => {
          try { oscillator.stop(); lfo.stop(); } catch { /* ignore */ }
        }, 150);
      } catch { /* ignore */ }
    },
  };
}

// ── Web Push Notification ─────────────────────────────────────────────────────
function sendBrowserNotification(title: string, message: string, tag: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(p => {
      if (p === 'granted') doNotify(title, message, tag);
    });
    return;
  }
  doNotify(title, message, tag);
}

function doNotify(title: string, message: string, tag: string) {
  try {
    const notif = new Notification(`🚨 ${title}`, {
      body: message,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: tag || 'prahari-siren',
      requireInteraction: true,
      silent: false,
    });
    notif.onclick = () => { window.focus(); notif.close(); };
  } catch (err) {
    console.warn('[Notification] Failed:', err);
  }
}

export default function AlertSiren({ 
  alerts, 
  userVillageId, 
  userCoords,
  portalMode = 'authority' 
}: AlertSirenProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenRef    = useRef<{ start: () => void; stop: () => void } | null>(null);
  const seenIdsRef  = useRef<Set<string>>(new Set());

  const [muted, setMuted]             = useState(false);
  const [activeSignal, setActiveSignal] = useState<{ title: string; message: string; sector: string; isCritical: boolean } | null>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [dismissed, setDismissed]     = useState(false);

  const stopSiren = useCallback(() => {
    sirenRef.current?.stop();
    sirenRef.current = null;
    setSirenPlaying(false);
  }, []);

  const trigger5SecondSiren = useCallback((title: string, message: string, sector: string, isCritical: boolean, signalId: string) => {
    if (seenIdsRef.current.has(signalId)) return;
    seenIdsRef.current.add(signalId);

    // Cooldown cleanup after 60 seconds
    setTimeout(() => {
      seenIdsRef.current.delete(signalId);
    }, 60000);

    setActiveSignal({ title, message, sector, isCritical });
    setDismissed(false);

    // 1. Browser Web Push
    sendBrowserNotification(title, message, signalId);

    // 2. Play 5-second Siren sound via Web Audio API
    if (!muted) {
      stopSiren();
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const siren = createSiren(ctx, 5);
        sirenRef.current = siren;
        setSirenPlaying(true);
        siren.start();

        // Turn off playing indicator after 5 seconds
        setTimeout(() => {
          setSirenPlaying(false);
        }, 5000);
      } catch (err) {
        console.warn('[AlertSiren] Web Audio error:', err);
      }
    }
  }, [muted, stopSiren]);

  // 1. Listen for Firestore Cloud Siren Broadcasts
  useEffect(() => {
    const unsub = subscribeToSirenSignals((signals) => {
      if (!signals || signals.length === 0) return;
      const latest = signals[0];
      if (!latest) return;

      // Check time: only trigger for signals dispatched in the last 2 minutes
      const ageMs = Date.now() - new Date(latest.timestamp).getTime();
      if (ageMs > 2 * 60 * 1000) return;

      // Check Targeting: In Villager Mode, only trigger if it matches user's sector or coordinates
      if (portalMode === 'villager') {
        const sectorMatch = !userVillageId || 
          latest.targetSectorId === userVillageId ||
          latest.targetSectorName?.toLowerCase().includes(userVillageId.toLowerCase()) ||
          userVillageId.toLowerCase().includes(latest.targetSectorId?.toLowerCase());

        let geoMatch = false;
        if (userCoords && latest.targetCoordinates) {
          const distKm = Math.hypot(
            (userCoords[0] - latest.targetCoordinates[0]) * 111,
            (userCoords[1] - latest.targetCoordinates[1]) * 111
          );
          if (distKm <= (latest.radiusKm || 20)) geoMatch = true;
        }

        if (!sectorMatch && !geoMatch) return; // Silent for safe users
      }

      trigger5SecondSiren(
        latest.title,
        latest.message,
        latest.targetSectorName,
        latest.severity === 'CRITICAL',
        latest.id
      );
    });

    return () => unsub();
  }, [portalMode, userVillageId, userCoords, trigger5SecondSiren]);

  // 2. Listen for standard incoming Critical Alerts
  useEffect(() => {
    const criticals = alerts.filter(a => {
      const isSev = (a.severity === 'CRITICAL' || a.severity === 'HIGH') && a.status !== 'RESOLVED';
      if (!isSev) return false;
      if (portalMode === 'villager' && userVillageId) {
        return a.villageId === userVillageId || (a.location && a.location.toLowerCase().includes(userVillageId.toLowerCase()));
      }
      return true;
    });

    if (criticals.length > 0) {
      const newest = criticals[0];
      const sigId = newest.id || newest.villageId;
      if (!seenIdsRef.current.has(sigId)) {
        trigger5SecondSiren(
          newest.title,
          newest.message,
          newest.villageId,
          newest.severity === 'CRITICAL',
          sigId
        );
      }
    }
  }, [alerts, userVillageId, portalMode, trigger5SecondSiren]);

  // Cleanup
  useEffect(() => () => stopSiren(), [stopSiren]);

  if (!activeSignal || dismissed) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] w-full max-w-lg px-4 animate-slide-in">
      <div className={`rounded-3xl shadow-2xl border-2 overflow-hidden backdrop-blur-md ${
        activeSignal.isCritical 
          ? 'bg-red-950/95 border-red-500 text-white' 
          : 'bg-amber-950/95 border-amber-500 text-white'
      }`}>
        
        {/* Header Ribbon */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md animate-bounce">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-red-600/60 px-2 py-0.5 rounded text-red-200">
                {activeSignal.isCritical ? '🔴 EVACUATION SIREN SIGNAL' : '⚠️ HIGH DANGER WARNING'}
              </span>
              <p className="text-xs font-bold text-white mt-0.5 truncate">{activeSignal.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (sirenPlaying) stopSiren();
                setMuted(m => !m);
              }}
              title={muted ? 'Unmute Siren' : 'Mute Siren'}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className={`w-4 h-4 ${sirenPlaying ? 'animate-pulse text-amber-400' : ''}`} />}
            </button>
            <button
              onClick={() => { stopSiren(); setDismissed(true); }}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Siren Playing Active Badge (5s timer) */}
        {sirenPlaying && (
          <div className="bg-red-600 text-white text-[11px] font-extrabold px-5 py-1 flex items-center justify-between animate-pulse">
            <span>🔊 5-SECOND EMERGENCY SIREN SOUNDING</span>
            <span className="text-[10px] font-mono">TARGETED TO HAZARD ZONE</span>
          </div>
        )}

        {/* Message Content */}
        <div className="p-5 space-y-3 text-xs leading-relaxed text-slate-100">
          <p className="font-medium text-slate-200">
            {activeSignal.message}
          </p>

          <div className="p-2.5 bg-black/30 rounded-xl border border-white/10 flex items-center justify-between text-[11px]">
            <span className="text-slate-300">Target Danger Sector:</span>
            <b className="text-amber-300 uppercase">{activeSignal.sector}</b>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { stopSiren(); setDismissed(true); }}
              className="flex-1 py-2.5 bg-white text-slate-950 hover:bg-slate-100 font-extrabold rounded-xl text-xs shadow-md transition-all text-center"
            >
              Acknowledge & View Safe Shelters
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
