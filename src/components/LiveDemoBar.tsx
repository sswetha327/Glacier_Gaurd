import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { LiveSystemState } from '../types';

interface LiveDemoBarProps {
  systemState: LiveSystemState;
  onTriggerDemoStep: (stepNumber: number) => void;
  onReset: () => void;
  onSelectTab: (tabId: string) => void;
}

const DEMO_STEPS = [
  {
    step: 1,
    title: '1. Stable Baseline',
    desc: 'Risk 12/100, SAFE. South Lhonak lake & sensors nominal.',
    targetTab: 'monitor',
  },
  {
    step: 2,
    title: '2. Upstream Disturbance',
    desc: 'Ice hanging glacier detachment & moraine micro-tremors.',
    targetTab: 'detect',
  },
  {
    step: 3,
    title: '3. Sensor Surge',
    desc: 'Seismic 2.8 Richter, Lake level rising fast (+0.85 m/hr).',
    targetTab: 'monitor',
  },
  {
    step: 4,
    title: '4. AI Event Classification',
    desc: 'Gemini classifies: Ice Avalanche entering Glacial Lake.',
    targetTab: 'classify',
  },
  {
    step: 5,
    title: '5. Catastrophic Breach & Debris',
    desc: 'Debris Flow Severity EXTREME (Water + Rock + Mud + Ice). Risk 94!',
    targetTab: 'predict',
  },
  {
    step: 6,
    title: '6. Comms Outage & Fallback',
    desc: 'Cellular tower fails; auto fallback to 130dB Siren & LoRa Mesh.',
    targetTab: 'warn',
  },
  {
    step: 7,
    title: '7. Evacuation & Safe Zones',
    desc: 'Zone A/B/C impact times updated; safe high ridge route active.',
    targetTab: 'evacuate',
  },
];

export const LiveDemoBar: React.FC<LiveDemoBarProps> = ({
  systemState,
  onTriggerDemoStep,
  onReset,
  onSelectTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    const stepConfig = DEMO_STEPS[index];
    onTriggerDemoStep(stepConfig.step);
    onSelectTab(stepConfig.targetTab);
  };

  const handleNextStep = () => {
    const next = (currentStepIndex + 1) % DEMO_STEPS.length;
    handleStepClick(next);
  };

  const handleAutoPlay = () => {
    setIsAutoPlaying(true);
    let step = 0;
    handleStepClick(0);

    const interval = setInterval(() => {
      step++;
      if (step < DEMO_STEPS.length) {
        handleStepClick(step);
      } else {
        clearInterval(interval);
        setIsAutoPlaying(false);
      }
    }, 4000);
  };

  return (
    <section className="bg-slate-900 border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Title and Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center justify-center p-1.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Hackathon Live Demo Script
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                Section 21
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 7-phase simulation of the 2023 South Lhonak GLOF cascade
            </p>
          </div>
        </div>

        {/* Step Progression Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {DEMO_STEPS.map((s, idx) => {
            const isActive = currentStepIndex === idx;
            return (
              <button
                key={s.step}
                id={`demo-step-btn-${s.step}`}
                onClick={() => handleStepClick(idx)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 border border-cyan-400 font-semibold'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
                title={s.desc}
              >
                {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" /> : <span className="text-[10px] text-slate-500">{s.step}</span>}
                <span className="whitespace-nowrap">{s.title.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Auto-Play and Advance Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="demo-autoplay-btn"
            onClick={handleAutoPlay}
            disabled={isAutoPlaying}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              isAutoPlaying
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>{isAutoPlaying ? 'Running Demo...' : 'Auto-Play'}</span>
          </button>

          <button
            id="demo-next-step-btn"
            onClick={handleNextStep}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            title="Advance to next step in demo"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </section>
  );
};
