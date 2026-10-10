import React, { useState } from 'react';
import {
  Activity,
  Gauge,
  Waves,
  Mountain,
  Thermometer,
  CloudRain,
  Camera,
  Cpu,
  Wifi,
  Sun,
  BatteryCharging,
  AlertTriangle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SensorTelemetry, ESP32NodeStatus, User } from '../types';

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

interface MonitorViewProps {
  telemetry?: SensorTelemetry;
  nodes?: ESP32NodeStatus[];
  onUpdateSensor: (partial: Partial<SensorTelemetry>) => void;
  currentRiskScore?: number;
  riskBand?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  hazardType?: string;
  onResetToSafe?: () => void;
  currentUser?: User | null;
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  telemetry: incomingTelemetry,
  nodes = [],
  onUpdateSensor,
  currentRiskScore = 12,
  riskBand = 'LOW',
  hazardType = 'Normal / No Hazard',
  onResetToSafe,
  currentUser,
}) => {
  const telemetry = incomingTelemetry || DEFAULT_TELEMETRY;
  const isCitizen = currentUser?.role === 'public';
  const isFieldEngineer = currentUser?.role === 'field_engineer';
  const [isManualControlOpen, setIsManualControlOpen] = useState<boolean>(!isCitizen);

  const isCritical = currentRiskScore >= 80;
  const isHigh = currentRiskScore >= 60 && currentRiskScore < 80;
  const isModerate = currentRiskScore >= 30 && currentRiskScore < 60;

  const riskBadgeColor = isCritical
    ? 'bg-[#FCE8D8] text-[#D95F12] border-[#F47721] animate-pulse font-bold'
    : isHigh
    ? 'bg-[#FCE8D8] text-[#F47721] border-[#F47721] font-bold'
    : isModerate
    ? 'bg-[#E9E2D5] text-[#737C45] border-[#737C45]'
    : 'bg-[#E9E2D5] text-[#386B4A] border-[#386B4A]';

  const riskBarColor = isCritical
    ? 'bg-[#D95F12]'
    : isHigh
    ? 'bg-[#F47721]'
    : isModerate
    ? 'bg-[#737C45]'
    : 'bg-[#386B4A]';

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#244A38] text-white border border-[#386B4A]">
                STEP 1 — MONITOR
              </span>
              <h2 className="text-lg font-bold text-[#26352C]">Continuous High-Altitude Glacier & Lake Surveillance</h2>
            </div>
            <p className="text-sm text-[#657067] mt-1 max-w-3xl">
              Real-time multi-sensor telemetry combining proglacial lake pressure gauges, 3-axis borehole seismometers, optical calving cameras, and weather stations positioned at 5,200m elevation.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCitizen ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#E9E2D5] text-[#386B4A] border border-[#C9C0B1]">
                Citizen Read-Only Telemetry Mode
              </span>
            ) : isFieldEngineer ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#FCE8D8] text-[#D95F12] border-[#F47721] animate-pulse">
                IoT Engineer Auth: Hardware Calibration
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-[#E9E2D5] text-[#244A38] border border-[#C9C0B1]">
                {currentUser?.role?.toUpperCase()} SIMULATION AUTH
              </span>
            )}

            <button
              id="toggle-sensor-slider-btn"
              onClick={() => setIsManualControlOpen(!isManualControlOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#E9E2D5] hover:bg-[#D8C3A5] text-[#26352C] border border-[#C9C0B1] transition-colors flex-shrink-0"
            >
              <Sliders className="w-4 h-4 text-[#386B4A]" />
              <span>{isManualControlOpen ? 'Hide Manual Injector' : isCitizen ? 'View Verified Thresholds' : 'Simulate Sensor Spike'}</span>
            </button>
          </div>
        </div>

        {/* Manual Sensor Injection Panel */}
        {isManualControlOpen && (
          <div className="mt-4 pt-4 border-t border-[#C9C0B1] space-y-4 bg-[#E9E2D5]/50 p-4 rounded-xl border border-[#C9C0B1]">
            {isCitizen ? (
              <div className="p-4 rounded-lg bg-[#FFFCF6] border border-[#C9C0B1] text-xs text-[#26352C] space-y-2">
                <div className="flex items-center gap-2 font-bold text-[#386B4A]">
                  <span className="w-2 h-2 rounded-full bg-[#386B4A] animate-ping"></span>
                  <span>Citizen Lake Surveillance: South Lhonak Station Verified Live Data</span>
                </div>
                <p className="text-[#657067]">
                  You have read-only access to certified proglacial lake sensors at 5,200m elevation. Telemetry manipulation and sensor spike injection are restricted to authorized IoT Field Engineers to prevent panic or false alarms.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-[11px]">
                  <div className="bg-[#FFFCF6] p-2 rounded border border-[#C9C0B1]">
                    <span className="text-[#657067] block">Water Level</span>
                    <span className="text-[#26352C] font-bold">{telemetry.lakeWaterLevelMeters.toFixed(1)}m (Normal)</span>
                  </div>
                  <div className="bg-[#FFFCF6] p-2 rounded border border-[#C9C0B1]">
                    <span className="text-[#657067] block">Rise Rate</span>
                    <span className="text-[#386B4A] font-bold">+{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr</span>
                  </div>
                  <div className="bg-[#FFFCF6] p-2 rounded border border-[#C9C0B1]">
                    <span className="text-[#657067] block">Seismic Tremor</span>
                    <span className="text-[#26352C] font-bold">{telemetry.seismicMagnitudeRichter.toFixed(1)} Richter</span>
                  </div>
                  <div className="bg-[#FFFCF6] p-2 rounded border border-[#C9C0B1]">
                    <span className="text-[#657067] block">Teesta Flow</span>
                    <span className="text-[#244A38] font-bold">{telemetry.riverDischargeM3s} m³/s</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Live Risk Reflection Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#FFFCF6] rounded-lg border border-[#C9C0B1]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#657067] uppercase tracking-wider">Live System Risk Response:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${riskBadgeColor}`}>
                    {riskBand} ({currentRiskScore}/100)
                  </span>
                  <span className="text-xs text-[#657067] font-mono hidden md:inline">
                    • {hazardType}
                  </span>
                </div>
                <div className="w-full sm:w-72 bg-[#D8C3A5] rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${riskBarColor}`}
                    style={{ width: `${Math.min(100, Math.max(10, currentRiskScore))}%` }}
                  ></div>
                </div>
              </div>

              {/* Quick Presets for Instant Testing */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#657067] font-medium">Quick Spikes:</span>
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ lakeRateOfRiseMetersPerHour: 0.04, lakeWaterLevelMeters: 32.4, seismicMagnitudeRichter: 0.8, glacierDisplacementMmDay: 18, cameraCalvingDetected: false, cameraDebrisDetected: false })}
                  className="px-2 py-1 text-[10px] font-semibold bg-[#244A38] text-white hover:bg-[#386B4A] rounded transition-colors"
                >
                  Safe Baseline
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ lakeRateOfRiseMetersPerHour: 0.95, lakeWaterLevelMeters: 35.2, riverDischargeM3s: 920 })}
                  className="px-2 py-1 text-[10px] font-semibold bg-[#737C45] text-white hover:opacity-90 rounded transition-colors"
                >
                  Surge (+0.95 m/hr)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ lakeRateOfRiseMetersPerHour: 2.10, lakeWaterLevelMeters: 39.0, seismicMagnitudeRichter: 2.9, riverDischargeM3s: 2600 })}
                  className="px-2 py-1 text-[10px] font-semibold bg-[#F47721] text-white hover:bg-[#D95F12] rounded transition-colors"
                >
                  High Risk (+2.1 m/hr)
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ lakeRateOfRiseMetersPerHour: 3.20, lakeWaterLevelMeters: 42.5, seismicMagnitudeRichter: 4.2, glacierDisplacementMmDay: 320, cameraCalvingDetected: true, cameraDebrisDetected: true, riverDischargeM3s: 4800 })}
                  className="px-2 py-1 text-[10px] font-semibold bg-[#D95F12] text-white hover:bg-[#F47721] rounded transition-colors animate-pulse"
                >
                  Breach (+3.2 m/hr GLOF)
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFFCF6] p-3 rounded-lg border border-[#C9C0B1]">
                <label className="text-xs font-medium text-[#26352C] flex justify-between">
                  <span>Lake Water Level:</span>
                  <span className="text-[#386B4A] font-mono font-bold">{telemetry.lakeWaterLevelMeters.toFixed(1)} m</span>
                </label>
                <input
                  id="slider-lake-level"
                  type="range"
                  min="30"
                  max="45"
                  step="0.5"
                  value={telemetry.lakeWaterLevelMeters}
                  onChange={(e) => onUpdateSensor({ lakeWaterLevelMeters: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-[#386B4A] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#657067] mt-1 font-mono">
                  <span>30.0m (Safe)</span>
                  <span>40.0m (Crest)</span>
                  <span>45.0m</span>
                </div>
              </div>

              <div className="bg-[#FFFCF6] p-3 rounded-lg border border-[#C9C0B1]">
                <label className="text-xs font-medium text-[#26352C] flex justify-between">
                  <span>Rate of Lake Rise:</span>
                  <span className={`font-mono font-bold ${telemetry.lakeRateOfRiseMetersPerHour >= 0.8 ? 'text-[#D95F12]' : 'text-[#386B4A]'}`}>
                    +{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr
                  </span>
                </label>
                <input
                  id="slider-lake-rate"
                  type="range"
                  min="0"
                  max="3.5"
                  step="0.05"
                  value={telemetry.lakeRateOfRiseMetersPerHour}
                  onChange={(e) => onUpdateSensor({ lakeRateOfRiseMetersPerHour: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-[#F47721] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#657067] mt-1 font-mono">
                  <span>0.04 (Base)</span>
                  <span>0.8 (Surge)</span>
                  <span>3.5 m/hr</span>
                </div>
              </div>

              <div className="bg-[#FFFCF6] p-3 rounded-lg border border-[#C9C0B1]">
                <label className="text-xs font-medium text-[#26352C] flex justify-between">
                  <span>Seismic Activity:</span>
                  <span className="text-[#D95F12] font-mono font-bold">{telemetry.seismicMagnitudeRichter.toFixed(1)} Richter</span>
                </label>
                <input
                  id="slider-seismic"
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={telemetry.seismicMagnitudeRichter}
                  onChange={(e) => onUpdateSensor({ seismicMagnitudeRichter: parseFloat(e.target.value) })}
                  className="w-full mt-2 accent-[#D95F12] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#657067] mt-1 font-mono">
                  <span>0.8 (Quiet)</span>
                  <span>2.5 (Anomaly)</span>
                  <span>5.0 Richter</span>
                </div>
              </div>

              <div className="bg-[#FFFCF6] p-3 rounded-lg border border-[#C9C0B1]">
                <label className="text-xs font-medium text-[#26352C] flex justify-between">
                  <span>Glacier Displacement:</span>
                  <span className="text-[#737C45] font-mono font-bold">{telemetry.glacierDisplacementMmDay} mm/day</span>
                </label>
                <input
                  id="slider-glacier-vel"
                  type="range"
                  min="10"
                  max="400"
                  step="10"
                  value={telemetry.glacierDisplacementMmDay}
                  onChange={(e) => onUpdateSensor({ glacierDisplacementMmDay: parseInt(e.target.value, 10) })}
                  className="w-full mt-2 accent-[#737C45] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#657067] mt-1 font-mono">
                  <span>18 (Base)</span>
                  <span>120 (Creep)</span>
                  <span>400 mm/d</span>
                </div>
              </div>
            </div>

            {/* Optical Camera Edge Flags Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#C9C0B1] text-xs">
              <span className="text-[#657067] text-[11px]">Optical Calving & Debris Sensors:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ cameraCalvingDetected: !telemetry.cameraCalvingDetected })}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                    telemetry.cameraCalvingDetected
                      ? 'bg-[#FCE8D8] text-[#D95F12] border-[#F47721]'
                      : 'bg-[#FFFCF6] text-[#657067] border-[#C9C0B1] hover:text-[#26352C]'
                  }`}
                >
                  {telemetry.cameraCalvingDetected ? '✓ Ice Calving Detected' : 'No Ice Calving'}
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSensor({ cameraDebrisDetected: !telemetry.cameraDebrisDetected })}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                    telemetry.cameraDebrisDetected
                      ? 'bg-[#FCE8D8] text-[#F47721] border-[#F47721]'
                      : 'bg-[#FFFCF6] text-[#657067] border-[#C9C0B1] hover:text-[#26352C]'
                  }`}
                >
                  {telemetry.cameraDebrisDetected ? '✓ Debris Movement Detected' : 'No Debris Movement'}
                </button>
              </div>
            </div>
            </>
            )}
          </div>
        )}
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Lake Level & Rate of Rise */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-[#386B4A]" />
              Proglacial Lake Level
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.lakeRateOfRiseMetersPerHour >= 0.8
                ? 'bg-[#FCE8D8] text-[#D95F12] border border-[#F47721]'
                : 'bg-[#E9E2D5] text-[#386B4A]'
            }`}>
              {telemetry.lakeRateOfRiseMetersPerHour >= 0.8 ? 'RAPID SURGE' : 'STABLE'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-[#26352C]">
              {telemetry.lakeWaterLevelMeters.toFixed(1)} <span className="text-sm font-sans text-[#657067]">meters</span>
            </div>
            <div className="text-xs text-[#657067] mt-1 flex items-center gap-1">
              Rate of change: <span className="font-mono text-[#386B4A] font-medium">+{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr</span>
            </div>
          </div>
          <div className="w-full bg-[#E9E2D5] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.lakeWaterLevelMeters > 38 ? 'bg-[#D95F12]' : 'bg-[#386B4A]'}`}
              style={{ width: `${Math.min(100, ((telemetry.lakeWaterLevelMeters - 25) / 20) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Seismic / Ground Vibration */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#F47721]" />
              Seismic & Moraine Vibration
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.seismicMagnitudeRichter >= 2.5
                ? 'bg-[#FCE8D8] text-[#D95F12] border border-[#F47721] animate-pulse font-bold'
                : 'bg-[#E9E2D5] text-[#657067]'
            }`}>
              {telemetry.seismicMagnitudeRichter >= 2.5 ? 'TREMOR ANOMALY' : 'NORMAL'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-[#26352C]">
              {telemetry.seismicMagnitudeRichter.toFixed(1)} <span className="text-sm font-sans text-[#657067]">Richter</span>
            </div>
            <div className="text-xs text-[#657067] mt-1 flex items-center gap-1">
              Borehole RMS: <span className="font-mono text-[#F47721] font-medium">{telemetry.seismicVibrationRMS.toFixed(2)} g</span>
            </div>
          </div>
          {/* Waveform indicator */}
          <div className="h-6 flex items-end gap-1 bg-[#E9E2D5] p-1 rounded overflow-hidden">
            {[4, 8, 3, 12, 6, 18, 9, 22, 14, 28, 16, 8, 4, 15, 25, 12, 6].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-xs transition-all ${
                  telemetry.seismicMagnitudeRichter >= 2.5 ? 'bg-[#D95F12]' : 'bg-[#737C45]'
                }`}
                style={{
                  height: `${Math.min(100, h * (telemetry.seismicMagnitudeRichter / 1.5))}%`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Glacier Velocity */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-[#795548]" />
              Glacier Surface Velocity
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.glacierDisplacementMmDay >= 120
                ? 'bg-[#FCE8D8] text-[#D95F12] border border-[#F47721]'
                : 'bg-[#E9E2D5] text-[#657067]'
            }`}>
              {telemetry.glacierDisplacementMmDay >= 120 ? 'ACCELERATION' : 'BASELINE'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-[#26352C]">
              {telemetry.glacierDisplacementMmDay} <span className="text-sm font-sans text-[#657067]">mm/day</span>
            </div>
            <div className="text-xs text-[#657067] mt-1">
              Target: Hanging ice tongue & lateral snout
            </div>
          </div>
          <div className="w-full bg-[#E9E2D5] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.glacierDisplacementMmDay > 150 ? 'bg-[#F47721]' : 'bg-[#795548]'}`}
              style={{ width: `${Math.min(100, (telemetry.glacierDisplacementMmDay / 300) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Optical / Thermal Detection Cameras */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#386B4A]" />
              Optical & Thermal AI Vision
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected
                ? 'bg-[#FCE8D8] text-[#D95F12] border border-[#F47721]'
                : 'bg-[#E9E2D5] text-[#386B4A]'
            }`}>
              {telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected ? 'TARGET ACTIVE' : 'CLEAR'}
            </span>
          </div>
          <div className="my-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Ice Calving / Collapse:</span>
              <span className={`font-semibold ${telemetry.cameraCalvingDetected ? 'text-[#D95F12] font-mono' : 'text-[#386B4A] font-mono'}`}>
                {telemetry.cameraCalvingDetected ? 'DETECTED ⚠️' : 'NONE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Slope Debris Slide:</span>
              <span className={`font-semibold ${telemetry.cameraDebrisDetected ? 'text-[#D95F12] font-mono' : 'text-[#386B4A] font-mono'}`}>
                {telemetry.cameraDebrisDetected ? 'DETECTED ⚠️' : 'NONE'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#657067] italic">
            PTZ Thermal & HD cameras on Moraine Ridge
          </div>
        </div>

        {/* Meteorological / Weather Data */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-[#795548]" />
              High-Altitude Microclimate
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E9E2D5] text-[#26352C]">
              5,200m ASL
            </span>
          </div>
          <div className="my-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Air Temperature:</span>
              <span className="text-[#26352C] font-mono font-semibold">{telemetry.ambientTemperatureCelsius.toFixed(1)} °C</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Rainfall / Precip:</span>
              <span className="text-[#386B4A] font-mono font-semibold">{telemetry.precipitationMmPerHour.toFixed(1)} mm/hr</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">0°C Freezing Line:</span>
              <span className="text-[#737C45] font-mono font-semibold">{telemetry.freezingLevelMeters} m</span>
            </div>
          </div>
          <div className="text-[11px] text-[#657067]">
            Rapid freezing-level rise accelerates moraine melt.
          </div>
        </div>

        {/* Downstream River Gaging */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#657067] flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-[#386B4A]" />
              Downstream River Gauging
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#E9E2D5] text-[#26352C]">
              Teesta River
            </span>
          </div>
          <div className="my-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Water Stage:</span>
              <span className="text-[#26352C] font-mono font-semibold">{telemetry.riverStageMeters.toFixed(1)} meters</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#657067]">Estimated Discharge:</span>
              <span className="text-[#386B4A] font-mono font-semibold">{telemetry.riverDischargeM3s.toLocaleString()} m³/s</span>
            </div>
          </div>
          <div className="w-full bg-[#E9E2D5] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.riverDischargeM3s > 2000 ? 'bg-[#D95F12]' : 'bg-[#386B4A]'}`}
              style={{ width: `${Math.min(100, (telemetry.riverDischargeM3s / 5000) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ESP32 Physical Prototype / IoT Ingestion Hardware Fleet */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#386B4A]" />
            <div>
              <h3 className="text-sm font-bold text-[#26352C]">Physical Telemetry Network: ESP32 Hardware Fleet</h3>
              <p className="text-xs text-[#657067]">
                Autonomous, solar-backed edge microcontrollers with multi-bearer LoRa mesh and satellite uplink
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#657067]">
            <span className="flex h-2 w-2 rounded-full bg-[#386B4A]"></span>
            <span className="font-medium text-[#26352C]">4/4 Nodes Reporting</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map((node) => (
            <div
              key={node.nodeId}
              className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3 hover:border-[#737C45] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#244A38]">{node.nodeId}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FFFCF6] text-[#386B4A] border border-[#C9C0B1]">
                  {node.status}
                </span>
              </div>
              <div className="text-xs text-[#26352C] font-semibold truncate mb-2">{node.location}</div>

              <div className="space-y-1 text-[11px] text-[#657067]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><BatteryCharging className="w-3 h-3 text-[#386B4A]" /> Battery:</span>
                  <span className="font-mono text-[#26352C] font-medium">{node.batteryPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-[#F47721]" /> Solar:</span>
                  <span className="font-mono text-[#26352C] font-medium">{node.solarInputWatts.toFixed(1)} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-[#737C45]" /> LoRa RSSI:</span>
                  <span className="font-mono text-[#26352C] font-medium">{node.loraSignalRssi} dBm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
