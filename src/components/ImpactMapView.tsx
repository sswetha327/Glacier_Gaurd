import React, { useState } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Waves,
  Mountain,
  Layers,
  Eye,
  Info,
  Navigation,
} from 'lucide-react';
import { HazardZoneImpact, ESP32NodeStatus } from '../types';

interface ImpactMapViewProps {
  zones: HazardZoneImpact[];
  nodes: ESP32NodeStatus[];
  currentRiskScore: number;
  debrisSeverity: string;
}

export const ImpactMapView: React.FC<ImpactMapViewProps> = ({
  zones,
  nodes,
  currentRiskScore,
  debrisSeverity,
}) => {
  const [selectedElement, setSelectedElement] = useState<string | null>('source');
  const isSurging = currentRiskScore >= 60;
  const isCritical = currentRiskScore >= 80;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                TOPOGRAPHIC IMPACT MAP
              </span>
              <h2 className="text-lg font-bold text-white">Teesta Basin Glacier-to-Valley Flow Corridor</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Topographic elevation profile from South Lhonak proglacial lake (5,200m ASL) down through the steep canyon to Singtam floodplain (350m ASL).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Total Runout: 72.4 km</span>
            <div className={`px-3 py-1 rounded-md text-xs font-bold border ${
              isCritical
                ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}>
              {isCritical ? 'SURGE WAVE IN PROGRESS' : 'NOMINAL HYDRO FLOW'}
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Valley Map Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-6 overflow-hidden relative shadow-inner">
        {/* Map Legend */}
        <div className="absolute top-6 left-6 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 shadow-lg hidden sm:block">
          <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">GIS Map Legend</div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-full bg-cyan-500 border border-cyan-300"></span>
            <span>Glacial Lake Source (5,200m)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className={`w-3 h-3 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-blue-600'}`}></span>
            <span>Flow Path / GLOF Corridor</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span>Designated Safe Refuge Zone</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>ESP32 Solar Telemetry Node</span>
          </div>
        </div>

        {/* Dynamic SVG Schematic */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox="0 0 1000 480"
            className="w-full min-w-[760px] h-auto font-sans"
          >
            <defs>
              <linearGradient id="valleyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="100%" stopColor="#0b1329" />
              </linearGradient>

              <linearGradient id="waterFlowNormal" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>

              <linearGradient id="waterFlowSurge" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="35%" stopColor="#f43f5e" />
                <stop offset="70%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>

            {/* Background Mountains contour silhouettes */}
            <path
              d="M0 320 Q120 180 250 260 T500 210 T750 280 T1000 240 L1000 480 L0 480 Z"
              fill="#090d16"
              opacity="0.7"
            />
            <path
              d="M0 240 Q150 90 320 180 T650 140 T1000 170 L1000 480 L0 480 Z"
              fill="#060911"
              opacity="0.5"
            />

            {/* Glacier source mountain icon / snowfield */}
            <path
              d="M40 160 L140 70 L240 160 Z"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <path d="M110 97 L140 70 L170 97 L150 110 L140 100 L130 110 Z" fill="#e0f2fe" />

            {/* South Lhonak Glacial Lake Body */}
            <ellipse
              cx="190"
              cy="160"
              rx="65"
              ry="32"
              fill="#0284c7"
              stroke="#38bdf8"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-90"
              onClick={() => setSelectedElement('source')}
            />
            <text x="190" y="156" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
              South Lhonak Lake
            </text>
            <text x="190" y="172" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="monospace">
              Elev: 5,200m | 1.42 km²
            </text>

            {/* Moraine Dam Barrier */}
            <rect
              x="245"
              y="145"
              width="18"
              height="32"
              rx="4"
              fill={isCritical ? '#e11d48' : '#78716c'}
              stroke="#d6d3d1"
              strokeWidth="1.5"
              className={isCritical ? 'animate-pulse' : ''}
            />
            <text x="254" y="135" textAnchor="middle" fill={isCritical ? '#fca5a5' : '#a8a29e'} fontSize="9" fontWeight="bold">
              {isCritical ? 'BREACH GASH' : 'Moraine Dam'}
            </text>

            {/* River Flow Path with Dynamic Surge Simulation */}
            <path
              d="M260 160 C330 170 380 230 450 250 C540 275 620 310 710 330 C800 350 890 380 970 410"
              fill="none"
              stroke={isSurging ? 'url(#waterFlowSurge)' : 'url(#waterFlowNormal)'}
              strokeWidth={isCritical ? '16' : isSurging ? '10' : '6'}
              strokeLinecap="round"
              strokeDasharray={isCritical ? '16 6' : 'none'}
              className={isCritical ? 'animate-pulse' : ''}
            />

            {/* Floating Debris Particles when Critical */}
            {isCritical && (
              <>
                <circle cx="340" cy="190" r="4" fill="#fbbf24" />
                <circle cx="410" cy="235" r="5" fill="#f87171" />
                <circle cx="520" cy="270" r="6" fill="#e2e8f0" />
                <circle cx="640" cy="315" r="4" fill="#a3e635" />
                <circle cx="760" cy="340" r="5" fill="#fb923c" />
              </>
            )}

            {/* ZONE A: Chungthang (24 km, 18 min) */}
            <g
              transform="translate(450, 250)"
              className="cursor-pointer"
              onClick={() => setSelectedElement('zoneA')}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                A
              </text>
              <text x="0" y="-24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Zone A: Chungthang
              </text>
              <text x="0" y="-12" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                ETA: ~18m | Elev 1,790m
              </text>

              {/* Infrastructure: Teesta III Dam */}
              <rect x="-18" y="10" width="36" height="8" rx="2" fill="#475569" stroke="#94a3b8" />
              <text x="0" y="28" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                Teesta III Hydro Dam
              </text>

              {/* Safe Zone Shield */}
              <circle cx="40" cy="-35" r="12" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <text x="40" y="-31" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                🛡️
              </text>
              <text x="40" y="-50" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                Safe Ridge Helipad
              </text>
            </g>

            {/* ZONE B: Dikchu (48 km, 32 min) */}
            <g
              transform="translate(710, 330)"
              className="cursor-pointer"
              onClick={() => setSelectedElement('zoneB')}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                B
              </text>
              <text x="0" y="-24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Zone B: Dikchu
              </text>
              <text x="0" y="-12" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                ETA: ~32m | Elev 650m
              </text>

              {/* Safe Zone Shield */}
              <circle cx="35" cy="-35" r="12" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <text x="35" y="-31" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                🛡️
              </text>
              <text x="35" y="-50" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                Monastery High Ground
              </text>
            </g>

            {/* ZONE C: Singtam (72 km, 51 min) */}
            <g
              transform="translate(930, 400)"
              className="cursor-pointer"
              onClick={() => setSelectedElement('zoneC')}
            >
              <circle cx="0" cy="0" r="16" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                C
              </text>
              <text x="0" y="-24" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                Zone C: Singtam
              </text>
              <text x="0" y="-12" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                ETA: ~51m | Elev 350m
              </text>

              {/* Safe Zone Shield */}
              <circle cx="30" cy="-35" r="12" fill="#065f46" stroke="#34d399" strokeWidth="1.5" />
              <text x="30" y="-31" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontWeight="bold">
                🛡️
              </text>
              <text x="30" y="-50" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
                Govt Stadium Refuge
              </text>
            </g>

            {/* ESP32 IoT Nodes Markers */}
            <circle cx="160" cy="130" r="5" fill="#facc15" stroke="#713f12" strokeWidth="1" />
            <text x="160" y="120" textAnchor="middle" fill="#fef08a" fontSize="7" fontFamily="monospace">
              ESP32-01
            </text>

            <circle cx="280" cy="180" r="5" fill="#facc15" stroke="#713f12" strokeWidth="1" />
            <text x="280" y="195" textAnchor="middle" fill="#fef08a" fontSize="7" fontFamily="monospace">
              ESP32-02
            </text>

            <circle cx="485" cy="275" r="5" fill="#facc15" stroke="#713f12" strokeWidth="1" />
            <text x="485" y="290" textAnchor="middle" fill="#fef08a" fontSize="7" fontFamily="monospace">
              ESP32-04
            </text>
          </svg>
        </div>

        <div className="mt-4 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
          <span>Click on any Zone marker or Source Lake to view specific hazard parameters.</span>
          <span className="font-mono text-cyan-400">Current Flow Severity: {debrisSeverity}</span>
        </div>
      </div>

      {/* Selected Element Inspector */}
      {selectedElement === 'source' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-cyan-400">Selected Source:</span>
              <h4 className="text-sm font-bold text-white">South Lhonak Glacial Lake & Moraine Dam (5,200m ASL)</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Proglacial moraine-dammed lake that expanded 12-fold between 1962 (0.11 km²) and 2023 (1.42 km²). Primary trigger zone for mass ice/rock avalanches causing displacement surge waves.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ELEVATION</span>
              5,200m
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">WATER HEAD</span>
              ~24.5 M m³
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">MONITORING</span>
              ESP32 + Seismic
            </div>
          </div>
        </div>
      )}

      {selectedElement === 'zoneA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-rose-400">Selected Zone:</span>
              <h4 className="text-sm font-bold text-white">Zone A: Chungthang Valley & Hydro Dam</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Valley head at 1,790m elevation. Critical bottleneck housing the Teesta Stage III hydro dam. Arrival time is only ~18 minutes with severe debris impact risk!
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ARRIVAL TIME</span>
              ~18 mins
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">PROJECTED DEPTH</span>
              {zones[0].projectedFlowDepthMeters.toFixed(1)} m
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SAFE ZONE</span>
              Upper Ridge Helipad
            </div>
          </div>
        </div>
      )}

      {selectedElement === 'zoneB' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-amber-400">Selected Zone:</span>
              <h4 className="text-sm font-bold text-white">Zone B: Dikchu Hydropower Station & Settlement</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Middle Teesta basin (650m elevation). 48.6 km downstream from source. Expected floodwave arrival in ~32 minutes. NH-10 arterial bridge under threat.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ARRIVAL TIME</span>
              ~32 mins
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">POPULATION</span>
              6,800 people
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SAFE ZONE</span>
              Dikchu Monastery
            </div>
          </div>
        </div>
      )}

      {selectedElement === 'zoneC' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-emerald-400">Selected Zone:</span>
              <h4 className="text-sm font-bold text-white">Zone C: Singtam & Rangpo Floodplain</h4>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Dense commercial and residential settlements (350m elevation). Lead time of ~51 minutes allows systematic evacuation to elevated college stadium grounds.
            </p>
          </div>
          <div className="flex gap-4 text-xs font-mono text-slate-300">
            <div>
              <span className="text-slate-500 block text-[10px]">ARRIVAL TIME</span>
              ~51 mins
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">POPULATION</span>
              18,500 people
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">SAFE ZONE</span>
              Govt Stadium
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
