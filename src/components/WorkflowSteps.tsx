import React from 'react';
import {
  Activity,
  AlertOctagon,
  BrainCircuit,
  Waves,
  MapPin,
  BellRing,
  Navigation,
  Satellite,
} from 'lucide-react';

export type TabType = 'monitor' | 'detect' | 'classify' | 'predict' | 'map' | 'warn' | 'evacuate' | 'satellite';

interface WorkflowStepsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentRiskScore: number;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  activeTab,
  onSelectTab,
  currentRiskScore,
}) => {
  const isCritical = currentRiskScore >= 80;

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'monitor',
      label: '1. Monitor',
      icon: <Activity className="w-4 h-4" />,
      badge: 'Sensors',
    },
    {
      id: 'detect',
      label: '2. Detect',
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: 'Precursor',
    },
    {
      id: 'classify',
      label: '3. Classify',
      icon: <BrainCircuit className="w-4 h-4" />,
      badge: 'AI Engine',
    },
    {
      id: 'predict',
      label: '4. Predict & Debris',
      icon: <Waves className="w-4 h-4" />,
      badge: 'Index',
    },
    {
      id: 'map',
      label: 'Impact Map',
      icon: <MapPin className="w-4 h-4" />,
      badge: 'GIS Path',
    },
    {
      id: 'warn',
      label: '5. Warn & Comms',
      icon: <BellRing className="w-4 h-4" />,
      badge: isCritical ? 'ALARM' : undefined,
    },
    {
      id: 'evacuate',
      label: '6. Evacuate',
      icon: <Navigation className="w-4 h-4" />,
      badge: 'Routes',
    },
    {
      id: 'satellite',
      label: 'Satellite Case Study',
      icon: <Satellite className="w-4 h-4" />,
      badge: 'Sikkim 2023',
    },
  ];

  return (
    <nav className="bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAlarm = tab.badge === 'ALARM' && isCritical;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-600 shadow-sm shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : isAlarm ? 'text-rose-400 animate-bounce' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                    isAlarm
                      ? 'bg-rose-900 text-rose-200 animate-pulse border border-rose-600'
                      : isActive
                      ? 'bg-cyan-900/80 text-cyan-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
