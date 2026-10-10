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
    targetTab: 'classify',
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
    targetTab: 'warn',
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
    <section className="bg-[#E9E2D5] border-b border-[#C9C0B1] py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Title and Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center justify-center p-1.5 rounded-md bg-[#FCE8D8] text-[#F47721] border border-[#F47721]/30">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#26352C]">
                Hackathon Live Demo Script
              </span>
              <span className="text-[10px] bg-[#D8C3A5] text-[#26352C] px-1.5 py-0.5 rounded font-mono font-bold">
                Section 21
              </span>
            </div>
            <p className="text-[11px] text-[#657067]">
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
                    ? 'bg-[#244A38] text-white shadow-sm border border-[#386B4A] font-bold'
                    : 'bg-[#FFFCF6] text-[#26352C] border border-[#C9C0B1] hover:bg-[#F5F1E8]'
                }`}
                title={s.desc}
              >
                {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-[#F5F1E8]" /> : <span className="text-[10px] text-[#657067]">{s.step}</span>}
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
                ? 'bg-[#D95F12] text-white animate-pulse'
                : 'bg-[#F47721] hover:bg-[#D95F12] text-white shadow-sm'
            }`}
          >
            <Play className="w-3 h-3 text-white" />
            <span>{isAutoPlaying ? 'Running Demo...' : 'Auto-Play'}</span>
          </button>

          <button
            id="demo-next-step-btn"
            onClick={handleNextStep}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#386B4A] hover:bg-[#244A38] text-white border border-[#386B4A]"
            title="Advance to next step in demo"
          >
            <span>Next</span>
            <ChevronRight className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};
