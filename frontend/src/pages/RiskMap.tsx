import React from 'react';
import GisMap from '../components/GisMap';
import { Village, Shelter, Road, Alert } from '../types';

interface RiskMapProps {
  villages: Village[];
  shelters: Shelter[];
  roads: Road[];
  alerts: Alert[];
  emergencyMode: boolean;
  demoMode: boolean;
}

export default function RiskMap({ villages, shelters, roads, alerts, emergencyMode }: RiskMapProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">
          GIS Risk Command Map — NER Landslide Monitoring
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Villages, shelters, evacuation routes, road blockages and live rain radar. Click any marker for full detail.
        </p>
      </div>

      <div className="h-[65vh] sm:h-[72vh] lg:h-[78vh]">
        <GisMap
          villages={villages}
          shelters={shelters}
          roads={roads}
          alerts={alerts}
          emergencyMode={emergencyMode}
        />
      </div>
    </div>
  );
}
