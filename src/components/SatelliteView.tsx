import React, { useState } from 'react';
import {
  Satellite,
  Layers,
  Calendar,
  ExternalLink,
  BookOpen,
  Info,
  Maximize2,
  Minimize2,
  TrendingUp,
} from 'lucide-react';

export const SatelliteView: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                CASE STUDY & HISTORICAL INVENTORIES
              </span>
              <h2 className="text-lg font-bold text-white">South Lhonak Lake 2023 Event & Global GLOF Inventories</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Scientific grounding based on published peer-reviewed research (Lützow, Veh & Korup 2023; Steiner & Shrestha 2023) documenting 3,151 historical GLOFs worldwide and 697 events across High Mountain Asia.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1.5 rounded-lg border border-cyan-800">
              October 3-4, 2023 Disaster
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Before/After Satellite Change Detection Slider */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Satellite className="w-4 h-4 text-cyan-400" />
              Sentinel-2 & Landsat Multi-Spectral Change Detection
            </h3>
            <p className="text-xs text-slate-400">
              Drag the split slider to observe South Lhonak Lake before the 2023 moraine breach versus after the release of ~24.5 million m³ of water & debris.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Split View: {sliderPosition}%
          </div>
        </div>

        {/* Visual Simulated Satellite Canvas */}
        <div className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden select-none border border-slate-800 bg-slate-950">
          {/* Before Image (Left / Base) */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="bg-cyan-950/90 text-cyan-300 border border-cyan-700 px-2.5 py-1 rounded text-xs font-mono font-bold">
                PRE-EVENT (OCTOBER 2, 2023)
              </span>
              <span className="text-xs text-cyan-300 font-mono">Lake Surface Area: 1.42 km²</span>
            </div>

            {/* Synthetic Satellite Representation */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="w-72 h-44 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-cyan-600 to-blue-800 opacity-90 shadow-2xl shadow-cyan-500/20 border-2 border-cyan-400/40 relative flex items-center justify-center">
                <span className="text-xs font-mono text-cyan-100 font-bold">Full Proglacial Lake (1.42 km²)</span>
              </div>
              <div className="absolute top-10 right-20 text-xs font-mono text-slate-400">
                Moraine Dam Intact
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Elevation: 5,200m ASL | Water Head: ~24.5 Million m³
            </div>
          </div>

          {/* After Image (Right / Clipped Overlay) */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-950 via-stone-950 to-amber-950 p-6 flex flex-col justify-between"
            style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-rose-300 font-mono ml-auto">Post-Breach: 0.88 km²</span>
              <span className="bg-rose-950/90 text-rose-300 border border-rose-700 px-2.5 py-1 rounded text-xs font-mono font-bold ml-2">
                POST-EVENT (OCTOBER 4, 2023)
              </span>
            </div>

            {/* Synthetic Post-Breach Satellite Representation */}
            <div className="relative flex-1 flex items-center justify-center">
              <div className="w-48 h-28 rounded-[40%_50%_60%_40%/30%_40%_50%_40%] bg-gradient-to-br from-blue-900 to-slate-800 opacity-80 border-2 border-amber-500/40 relative flex items-center justify-center">
                <span className="text-xs font-mono text-amber-200 font-bold">Drained Lake Core</span>
              </div>
              {/* Breach Channel Furrow */}
              <div className="absolute top-14 right-24 w-32 h-6 bg-gradient-to-r from-transparent via-rose-600 to-amber-700 rotate-12 rounded opacity-90 animate-pulse"></div>
              <div className="absolute top-8 right-16 text-xs font-mono text-rose-400 font-bold">
                Moraine Breach Gash (V-Notch)
              </div>
            </div>

            <div className="text-[11px] text-rose-300 font-mono text-right">
              Drainage Loss: ~60% Volume Released Down Teesta River
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-xl border-2 border-white">
              ⬌
            </div>
          </div>

          {/* Slider input */}
          <input
            id="satellite-split-slider"
            type="range"
            min="5"
            max="95"
            value={sliderPosition}
            onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
          />
        </div>
      </div>

      {/* Historical Inventories & Case Study Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">South Lhonak Expansion Timeline</h4>
          </div>
          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">1962 (Corona Satellite):</span>
              <span className="font-mono font-bold text-white">0.11 km²</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">2008 (Landsat-7):</span>
              <span className="font-mono font-bold text-white">0.78 km²</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Sep 2023 (Pre-breach):</span>
              <span className="font-mono font-bold text-rose-400">1.42 km²</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Net Growth Factor:</span>
              <span className="font-mono font-bold text-amber-400">12.9× Expansion</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 italic">
            Glacier retreat left an oversized proglacial lake impounded by an unconsolidated moraine dam.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Scientific GLOF Inventories</h4>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="font-bold text-cyan-300">Global GLOF Database (1850-2022)</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                3,151 reported events across 27 countries (Andes, High Mountain Asia, Alps, Iceland, Rockies).
              </div>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <div className="font-bold text-cyan-300">High Mountain Asia GLOF Inventory</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                697 documented events linked with specific glacier identifiers (1833-2022).
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-white">Why Single-Parameter Alerts Fail</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Monitoring only downstream river height or local rainfall provides zero early warning for glacier slope collapses.
          </p>
          <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc list-inside">
            <li>Precursors start 50-70 km upstream in remote high-altitude peaks.</li>
            <li>Moraine breaches occur with zero local rainfall in the downstream valley.</li>
            <li>Multi-sensor confirmation is essential to eliminate false alarms and buy crucial evacuation minutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
