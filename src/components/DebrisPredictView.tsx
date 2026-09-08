import React from 'react';
import {
  Waves,
  Mountain,
  AlertOctagon,
  Clock,
  MapPin,
  TrendingUp,
  ShieldAlert,
  ArrowDownRight,
  Droplets,
  RockingChair as RockIcon, // or custom icon representation
  Layers,
} from 'lucide-react';
import { DebrisFlowAssessment, HazardZoneImpact } from '../types';

interface DebrisPredictViewProps {
  debrisAssessment: DebrisFlowAssessment;
  zones: HazardZoneImpact[];
  onRecalculateDebris: (params: {
    waterVolumeMillionM3: number;
    solidFractionPercent: number;
    averageSlopeDegrees: number;
    peakDischargeM3s: number;
  }) => void;
}

export const DebrisPredictView: React.FC<DebrisPredictViewProps> = ({
  debrisAssessment,
  zones,
  onRecalculateDebris,
}) => {
  const getSeverityBadge = (level: DebrisFlowAssessment['severityLevel']) => {
    switch (level) {
      case 'EXTREME':
        return 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-700';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Innovation Header: The Water + Mud + Rock Problem */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                CORE INNOVATION
              </span>
              <h2 className="text-lg font-bold text-white">The Water + Mud + Rock Problem: Debris Flow Severity Index</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Glacial floods are exponentially more destructive than rainfall floods because they mobilize massive volumes of moraine till, boulders, pulverized bedrock, and iceberg blocks.
            </p>
          </div>

          {/* Aggregate Index Score Badge */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 flex-shrink-0">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Severity Index</div>
              <div className="text-2xl font-mono font-extrabold text-white">
                {debrisAssessment.score} <span className="text-xs font-sans text-slate-400">/ 100</span>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getSeverityBadge(debrisAssessment.severityLevel)}`}>
              {debrisAssessment.severityLevel}
            </span>
          </div>
        </div>

        {/* 5 Physical Components Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-lg">💧 Water</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Liquid Hydraulic Head</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{debrisAssessment.waterVolumeMillionM3.toFixed(1)} M m³</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-lg">🪨 Rock & Boulders</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Crushed Bedrock / Clasts</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">&gt; 3.0m diameter</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-lg">🟤 Mud & Silt</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Glacial Till Matrix</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{debrisAssessment.solidFractionPercent}% solid clasts</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            <div className="text-lg">❄️ Ice Calving</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Shattered Seracs</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Displacement surges</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-lg">🌲 Timber / Debris</div>
            <div className="text-xs font-semibold text-slate-200 mt-1">Scoured Forest Drift</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Bridge damming risk</div>
          </div>
        </div>
      </div>

      {/* Physics & Hydraulic Inputs Model */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Hydrodynamic Parameters & Debris Composition
          </h3>
          <span className="text-xs text-slate-400 font-mono">Channel Slope: ~21.4°</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Estimated Water Volume</div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {debrisAssessment.waterVolumeMillionM3.toFixed(1)} <span className="text-xs text-slate-400">Million m³</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Hydrostatic lake storage head</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Solid Fraction Ratio</div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {debrisAssessment.solidFractionPercent}% <span className="text-xs text-slate-400">by volume</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Hyperconcentrated sediment flow</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Estimated Peak Discharge</div>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {debrisAssessment.estimatedPeakDischargeM3s.toLocaleString()} <span className="text-xs text-slate-400">m³/s</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Peak breach outburst wave</div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Dominant Composition</div>
            <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
              {debrisAssessment.dominantComposition}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Impact resistance classification</div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
          <strong className="text-slate-200">Impact Assessment: </strong>
          {debrisAssessment.description}
        </p>
      </div>

      {/* Downstream Impact Zones & Time-to-Impact (TTI) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Downstream Time-to-Impact (TTI) & Hazard Footprint
            </h3>
            <p className="text-xs text-slate-400">
              Calculated wave arrival times along the Teesta valley drainage corridor with uncertainty margins
            </p>
          </div>
          <span className="text-xs text-cyan-400 font-mono bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
            Source: South Lhonak (5,200m)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {zones.map((zone) => {
            const isCritical = zone.riskLevel === 'CRITICAL';
            const isHigh = zone.riskLevel === 'HIGH';

            return (
              <div
                key={zone.zoneId}
                className={`rounded-xl p-4 border flex flex-col justify-between transition-all ${
                  isCritical
                    ? 'bg-rose-950/30 border-rose-700/80 shadow-lg shadow-rose-950/20'
                    : isHigh
                    ? 'bg-amber-950/30 border-amber-700/80'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      {zone.zoneId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isCritical
                          ? 'bg-rose-900 text-rose-200 border-rose-600 animate-pulse'
                          : isHigh
                          ? 'bg-amber-900 text-amber-200 border-amber-600'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {zone.riskLevel}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1">{zone.name}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{zone.location} ({zone.distanceFromSourceKm} km downstream)</span>
                  </div>

                  {/* Time to Impact Highlight */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 mb-3">
                    <div className="text-[11px] text-slate-400 font-medium">Estimated Arrival Time:</div>
                    <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                      ~{zone.estimatedTimeToImpactMinutes}{' '}
                      <span className="text-xs font-sans text-slate-400">
                        minutes (±{zone.uncertaintyMinutes} min)
                      </span>
                    </div>
                    <div className="text-xs text-rose-400 mt-1 font-semibold flex items-center justify-between">
                      <span>Projected Flow Depth:</span>
                      <span className="font-mono">{zone.projectedFlowDepthMeters.toFixed(1)} m</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Population at Risk:</span>
                      <span className="font-mono font-semibold">{zone.populationAtRisk.toLocaleString()} residents</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Key Assets: <span className="text-slate-300">{zone.keyInfrastructure.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">Designated Refuge:</div>
                  <div className="text-xs font-semibold text-emerald-300 truncate">{zone.safeZoneName}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
