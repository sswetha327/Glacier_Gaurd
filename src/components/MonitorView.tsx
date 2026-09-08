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
import { SensorTelemetry, ESP32NodeStatus } from '../types';

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
}

export const MonitorView: React.FC<MonitorViewProps> = ({
  telemetry: incomingTelemetry,
  nodes = [],
  onUpdateSensor,
}) => {
  const telemetry = incomingTelemetry || DEFAULT_TELEMETRY;
  const [isManualControlOpen, setIsManualControlOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                STEP 1 — MONITOR
              </span>
              <h2 className="text-lg font-bold text-white">Continuous High-Altitude Glacier & Lake Surveillance</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Real-time multi-sensor telemetry combining proglacial lake pressure gauges, 3-axis borehole seismometers, optical calving cameras, and weather stations positioned at 5,200m elevation.
            </p>
          </div>

          <button
            id="toggle-sensor-slider-btn"
            onClick={() => setIsManualControlOpen(!isManualControlOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex-shrink-0"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>{isManualControlOpen ? 'Hide Manual Injector' : 'Simulate Sensor Spike'}</span>
          </button>
        </div>

        {/* Manual Sensor Injection Panel (for hackathon judges to test) */}
        {isManualControlOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-lg">
            <div>
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Lake Water Level:</span>
                <span className="text-cyan-400 font-mono font-bold">{telemetry.lakeWaterLevelMeters.toFixed(1)} m</span>
              </label>
              <input
                id="slider-lake-level"
                type="range"
                min="30"
                max="45"
                step="0.5"
                value={telemetry.lakeWaterLevelMeters}
                onChange={(e) => onUpdateSensor({ lakeWaterLevelMeters: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Rate of Lake Rise:</span>
                <span className="text-cyan-400 font-mono font-bold">+{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr</span>
              </label>
              <input
                id="slider-lake-rate"
                type="range"
                min="0"
                max="3.5"
                step="0.1"
                value={telemetry.lakeRateOfRiseMetersPerHour}
                onChange={(e) => onUpdateSensor({ lakeRateOfRiseMetersPerHour: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Seismic Activity:</span>
                <span className="text-rose-400 font-mono font-bold">{telemetry.seismicMagnitudeRichter.toFixed(1)} Richter</span>
              </label>
              <input
                id="slider-seismic"
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={telemetry.seismicMagnitudeRichter}
                onChange={(e) => onUpdateSensor({ seismicMagnitudeRichter: parseFloat(e.target.value) })}
                className="w-full mt-2 accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Glacier Displacement:</span>
                <span className="text-amber-400 font-mono font-bold">{telemetry.glacierDisplacementMmDay} mm/day</span>
              </label>
              <input
                id="slider-glacier-vel"
                type="range"
                min="10"
                max="400"
                step="10"
                value={telemetry.glacierDisplacementMmDay}
                onChange={(e) => onUpdateSensor({ glacierDisplacementMmDay: parseInt(e.target.value, 10) })}
                className="w-full mt-2 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Lake Level & Rate of Rise */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              Proglacial Lake Level
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.lakeRateOfRiseMetersPerHour >= 0.8
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {telemetry.lakeRateOfRiseMetersPerHour >= 0.8 ? 'RAPID SURGE' : 'STABLE'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-white">
              {telemetry.lakeWaterLevelMeters.toFixed(1)} <span className="text-sm font-sans text-slate-400">meters</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Rate of change: <span className="font-mono text-cyan-400 font-medium">+{telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.lakeWaterLevelMeters > 38 ? 'bg-rose-500' : 'bg-cyan-400'}`}
              style={{ width: `${Math.min(100, ((telemetry.lakeWaterLevelMeters - 25) / 20) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Seismic / Ground Vibration */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-400" />
              Seismic & Moraine Vibration
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.seismicMagnitudeRichter >= 2.5
                ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {telemetry.seismicMagnitudeRichter >= 2.5 ? 'TREMOR ANOMALY' : 'NORMAL'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-white">
              {telemetry.seismicMagnitudeRichter.toFixed(1)} <span className="text-sm font-sans text-slate-400">Richter</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Borehole RMS: <span className="font-mono text-rose-400 font-medium">{telemetry.seismicVibrationRMS.toFixed(2)} g</span>
            </div>
          </div>
          {/* Waveform indicator */}
          <div className="h-6 flex items-end gap-1 bg-slate-950/70 p-1 rounded overflow-hidden">
            {[4, 8, 3, 12, 6, 18, 9, 22, 14, 28, 16, 8, 4, 15, 25, 12, 6].map((h, i) => (
              <div
                key={i}
                className={`w-full rounded-xs transition-all ${
                  telemetry.seismicMagnitudeRichter >= 2.5 ? 'bg-rose-500' : 'bg-slate-600'
                }`}
                style={{
                  height: `${Math.min(100, h * (telemetry.seismicMagnitudeRichter / 1.5))}%`,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Glacier Velocity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-amber-400" />
              Glacier Surface Velocity
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.glacierDisplacementMmDay >= 120
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {telemetry.glacierDisplacementMmDay >= 120 ? 'ACCELERATION' : 'BASELINE'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-white">
              {telemetry.glacierDisplacementMmDay} <span className="text-sm font-sans text-slate-400">mm/day</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Target: Hanging ice tongue & lateral snout
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.glacierDisplacementMmDay > 150 ? 'bg-amber-500' : 'bg-slate-400'}`}
              style={{ width: `${Math.min(100, (telemetry.glacierDisplacementMmDay / 300) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Optical / Thermal Detection Cameras */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-400" />
              Optical & Thermal AI Vision
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
              telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              {telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected ? 'TARGET ACTIVE' : 'CLEAR'}
            </span>
          </div>
          <div className="my-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Ice Calving / Collapse:</span>
              <span className={`font-semibold ${telemetry.cameraCalvingDetected ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}`}>
                {telemetry.cameraCalvingDetected ? 'DETECTED ⚠️' : 'NONE'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Slope Debris Slide:</span>
              <span className={`font-semibold ${telemetry.cameraDebrisDetected ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}`}>
                {telemetry.cameraDebrisDetected ? 'DETECTED ⚠️' : 'NONE'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 italic">
            PTZ Thermal & HD cameras on Moraine Ridge
          </div>
        </div>

        {/* Meteorological / Weather Data */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-blue-400" />
              High-Altitude Microclimate
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              5,200m ASL
            </span>
          </div>
          <div className="my-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Air Temperature:</span>
              <span className="text-white font-mono font-semibold">{telemetry.ambientTemperatureCelsius.toFixed(1)} °C</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Rainfall / Precip:</span>
              <span className="text-cyan-400 font-mono font-semibold">{telemetry.precipitationMmPerHour.toFixed(1)} mm/hr</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">0°C Freezing Line:</span>
              <span className="text-amber-400 font-mono font-semibold">{telemetry.freezingLevelMeters} m</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Rapid freezing-level rise accelerates moraine melt.
          </div>
        </div>

        {/* Downstream River Gaging */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-purple-400" />
              Downstream River Gauging
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Teesta River
            </span>
          </div>
          <div className="my-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Water Stage:</span>
              <span className="text-white font-mono font-semibold">{telemetry.riverStageMeters.toFixed(1)} meters</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Discharge:</span>
              <span className="text-purple-300 font-mono font-semibold">{telemetry.riverDischargeM3s.toLocaleString()} m³/s</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${telemetry.riverDischargeM3s > 2000 ? 'bg-rose-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min(100, (telemetry.riverDischargeM3s / 5000) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ESP32 Physical Prototype / IoT Ingestion Hardware Fleet */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Physical Telemetry Network: ESP32 Hardware Fleet</h3>
              <p className="text-xs text-slate-400">
                Autonomous, solar-backed edge microcontrollers with multi-bearer LoRa mesh and satellite uplink
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>4/4 Nodes Reporting</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {nodes.map((node) => (
            <div
              key={node.nodeId}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyan-300">{node.nodeId}</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {node.status}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-medium truncate mb-2">{node.location}</div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><BatteryCharging className="w-3 h-3 text-emerald-400" /> Battery:</span>
                  <span className="font-mono text-slate-200">{node.batteryPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Solar:</span>
                  <span className="font-mono text-slate-200">{node.solarInputWatts.toFixed(1)} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-cyan-400" /> LoRa RSSI:</span>
                  <span className="font-mono text-slate-200">{node.loraSignalRssi} dBm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
