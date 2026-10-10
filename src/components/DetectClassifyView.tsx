import React, { useState } from 'react';
import {
  BrainCircuit,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { AIClassificationResult, SensorTelemetry, User } from '../types';

const DEFAULT_TELEMETRY: SensorTelemetry = {
  timestamp: new Date().toISOString(),
  lakeWaterLevelMeters: 32.4,
  lakeRateOfRiseMetersPerHour: 0.04,
  seismicMagnitudeRichter: 0.8,
  seismicVibrationRMS: 0.05,
  glacierDisplacementMmDay: 18,
  ambientTemperatureCelsius: 1.8,
  precipitationMmPerHour: 2.1,
  freezingLevelMeters: 4200,
  riverStageMeters: 2.9,
  riverDischargeM3s: 180,
  cameraDebrisDetected: false,
  cameraCalvingDetected: false,
};

const DEFAULT_CLASSIFICATION: AIClassificationResult = {
  hazardType: 'Normal / No Hazard',
  confidencePercent: 96,
  riskScore: 12,
  riskBand: 'LOW',
  sourcePrecursor: 'Baseline nominal ablation.',
  triggerChainSummary: 'All sensors normal.',
  recommendedAction: 'Maintain continuous 24/7 telemetry monitoring.',
  reasoning: 'Stable conditions.',
  isAiGenerated: false,
  timestamp: new Date().toISOString(),
};

interface DetectClassifyViewProps {
  classification?: AIClassificationResult;
  telemetry?: SensorTelemetry;
  onReanalyzeWithAI: () => Promise<void>;
  isLoadingAI: boolean;
  currentUser?: User | null;
}

export const DetectClassifyView: React.FC<DetectClassifyViewProps> = ({
  classification: incomingClassification,
  telemetry: incomingTelemetry,
  onReanalyzeWithAI,
  isLoadingAI,
  currentUser,
}) => {
  const telemetry = incomingTelemetry || DEFAULT_TELEMETRY;
  const classification = incomingClassification || DEFAULT_CLASSIFICATION;
  const isAnomalous = (classification?.riskScore ?? 0) > 30;
  const isCitizen = currentUser?.role === 'public';
  const isHydrologist = currentUser?.role === 'hydrologist';

  const CANONICAL_HAZARD_TYPES = [
    {
      code: 'A',
      title: 'Glacier / Ice Collapse',
      desc: 'Serac hanging ice or glacier snout detachment from thermal warming or bedrock slippage.',
      keySignal: 'Glacier velocity acceleration + Calving camera detection',
    },
    {
      code: 'B',
      title: 'Landslide Entering Glacial Lake',
      desc: 'Slope failure on lateral moraine or surrounding valley wall plunging directly into lake.',
      keySignal: 'Seismic tremor + High ground vibration + Optical debris slide',
    },
    {
      code: 'C',
      title: 'Glacial Lake Outburst Flood (GLOF)',
      desc: 'Moraine dam piping failure, internal tunnel breach, or hydrostatic dam collapse.',
      keySignal: 'Rapid lake drainage + Exponential downstream river discharge rise',
    },
    {
      code: 'D',
      title: 'Ice / Debris Flow',
      desc: 'Channelized mud, boulders, and glacial till slurry scouring steep valleys.',
      keySignal: 'Heavy precipitation + Extreme river stage + Moraine scour',
    },
    {
      code: 'E',
      title: 'Combined Multi-Hazard Event',
      desc: 'Cascading chain: Landslide/Ice fall -> Lake displacement wave -> Moraine breach -> Debris surge (e.g. South Lhonak 2023).',
      keySignal: 'Simultaneous multi-sensor threshold breach across all channels',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                STEP 2 & 3 — DETECT & CLASSIFY
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                isCitizen
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : isHydrologist
                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {currentUser?.role ? `${currentUser.role.toUpperCase()} MODE` : 'OPERATIONAL VIEW'}
              </span>
              <h2 className="text-lg font-bold text-white">Multi-Sensor Anomaly Detection & AI Hazard Classification</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Cross-validates seismic, lake stage, glacier creep, and optical vision to prevent false positives and accurately distinguish between ice collapses, landslides, moraine breaches, and combined cascade disasters.
            </p>
          </div>

          <button
            id="reanalyze-gemini-ai-btn"
            onClick={onReanalyzeWithAI}
            disabled={isLoadingAI}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-950 transition-all flex-shrink-0 disabled:opacity-50"
          >
            {isLoadingAI ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
            <span>{isLoadingAI ? 'Analyzing with Gemini...' : isHydrologist ? 'Recalibrate with Gemini AI' : 'Analyze with Gemini AI'}</span>
          </button>
        </div>
      </div>

      {/* Detection State Matrix: Normal vs Abnormal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Safe State Benchmark */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Expected Baseline State (Normal)
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              🟢 SAFE
            </span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Glacier Movement:</span>
              <span className="font-mono text-emerald-400">Nominal (&lt; 50 mm/day)</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Lake Water Level:</span>
              <span className="font-mono text-emerald-400">Stable (&lt; 0.1 m/hr change)</span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Seismic Activity:</span>
              <span className="font-mono text-emerald-400">Background (&lt; 1.2 Richter)</span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-slate-400">Optical Vision Camera:</span>
              <span className="font-mono text-emerald-400">Clear Snout / No Mass Calving</span>
            </li>
          </ul>
        </div>

        {/* Current Active Observation */}
        <div className={`border rounded-xl p-4 transition-all ${
          isAnomalous
            ? 'bg-rose-950/20 border-rose-800/80 shadow-lg shadow-rose-950/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isAnomalous ? 'text-rose-400' : 'text-slate-300'
            }`}>
              <AlertTriangle className={`w-4 h-4 ${isAnomalous ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              Live Telemetry State Observation
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              isAnomalous
                ? 'bg-rose-900 text-rose-200 border border-rose-600 animate-pulse'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {isAnomalous ? '🔴 POSSIBLE HAZARD EVENT' : '🟢 SAFE'}
            </span>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Glacier Movement:</span>
              <span className={`font-mono font-semibold ${telemetry.glacierDisplacementMmDay >= 120 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {telemetry.glacierDisplacementMmDay} mm/day {telemetry.glacierDisplacementMmDay >= 120 && '↑'}
              </span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Lake Rate of Rise:</span>
              <span className={`font-mono font-semibold ${telemetry.lakeRateOfRiseMetersPerHour >= 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                +{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr {telemetry.lakeRateOfRiseMetersPerHour >= 0.5 && '↑'}
              </span>
            </li>
            <li className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Seismic Activity:</span>
              <span className={`font-mono font-semibold ${telemetry.seismicMagnitudeRichter >= 2.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {telemetry.seismicMagnitudeRichter.toFixed(1)} Richter {telemetry.seismicMagnitudeRichter >= 2.0 && '↑'}
              </span>
            </li>
            <li className="flex items-center justify-between py-1">
              <span className="text-slate-400">Camera Debris / Calving:</span>
              <span className={`font-mono font-semibold ${telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                {telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected ? 'DEBRIS / ICE DETECTED ⚠️' : 'CLEAR'}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Active AI Classification Detail Card */}
      <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span>AI Hazard Classification Result</span>
                {classification.isAiGenerated && (
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                    Gemini 3.8 Flash
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-0.5">{classification.hazardType}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-medium">Confidence</div>
              <div className="text-base font-bold font-mono text-emerald-400">{classification.confidencePercent}%</div>
            </div>
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
              <div className="text-[10px] uppercase text-slate-400 font-medium">Risk Score</div>
              <div className="text-base font-bold font-mono text-rose-400">{classification.riskScore}/100</div>
            </div>
          </div>
        </div>

        {/* AI Scientific Synthesis Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Upstream Precursor (What Happened):
              </span>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {classification.sourcePrecursor}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Trigger Cascade Chain:
              </span>
              <p className="text-xs font-mono text-cyan-300 mt-1 bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {classification.triggerChainSummary}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Recommended Immediate Action:
              </span>
              <p className="text-sm font-semibold text-rose-300 mt-1 bg-rose-950/30 p-3 rounded-lg border border-rose-900/50">
                {classification.recommendedAction}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                AI Scientific Synthesis:
              </span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
                {classification.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The 5 Canonical Hazard Types (Why not "Every event = flood") */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            AI Event Taxonomy: The 5 Glacier Disaster Archetypes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            GlacierGuard AI prevents the fatal assumption that &quot;every event is a simple rainfall flood&quot; by classifying the exact mechanical origin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CANONICAL_HAZARD_TYPES.map((hazard) => {
            const isSelected = classification.hazardType.startsWith(hazard.code);
            return (
              <div
                key={hazard.code}
                className={`p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/60'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {hazard.code}. {hazard.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold bg-cyan-900 text-cyan-200 px-1.5 py-0.2 rounded">
                      ACTIVE MATCH
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">{hazard.desc}</p>
                <div className="text-[11px] text-slate-500 font-mono">
                  Primary signal: <span className="text-slate-300">{hazard.keySignal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
