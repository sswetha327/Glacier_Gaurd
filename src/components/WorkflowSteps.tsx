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
  Lock,
  Shield,
  Cpu,
  Users,
} from 'lucide-react';
import { User } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

export type TabType = 'monitor' | 'classify' | 'predict' | 'map' | 'warn' | 'satellite' | 'community';

interface WorkflowStepsProps {
  activeTab: TabType | string;
  onSelectTab: (tab: TabType) => void;
  currentRiskScore: number;
  currentUser?: User | null;
  currentLang?: SupportedLanguage;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  activeTab,
  onSelectTab,
  currentRiskScore,
  currentUser,
  currentLang = 'en',
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isCritical = currentRiskScore >= 80;
  const role = currentUser?.role || 'commander';

  // Role-tailored tab configurations
  const getTabsForRole = (): { id: TabType; label: string; icon: React.ReactNode; badge?: string; isLocked?: boolean }[] => {
    if (role === 'public') {
      return [
        {
          id: 'community',
          label: `1. ${t.tabs.community}`,
          icon: <Users className="w-4 h-4" />,
          badge: isCritical ? 'EVACUATE NOW' : 'Citizen Portal',
        },
        {
          id: 'warn',
          label: `2. ${t.tabs.warn}`,
          icon: <BellRing className="w-4 h-4" />,
          badge: 'Safe Routes',
        },
        {
          id: 'map',
          label: `3. ${t.tabs.map}`,
          icon: <MapPin className="w-4 h-4" />,
          badge: 'Citizen GIS',
        },
        {
          id: 'monitor',
          label: `4. ${t.tabs.monitor}`,
          icon: <Activity className="w-4 h-4" />,
          badge: 'Live Readings',
        },
        {
          id: 'classify',
          label: `5. ${t.tabs.classify}`,
          icon: <BrainCircuit className="w-4 h-4" />,
          badge: 'AI Advisory',
        },
        {
          id: 'satellite',
          label: `6. ${t.tabs.satellite}`,
          icon: <Satellite className="w-4 h-4" />,
          badge: 'Historical',
        },
      ];
    }

    if (role === 'hydrologist') {
      return [
        {
          id: 'classify',
          label: `1. ${t.tabs.classify}`,
          icon: <BrainCircuit className="w-4 h-4" />,
          badge: 'Gemini Primary',
        },
        {
          id: 'predict',
          label: `2. ${t.tabs.predict}`,
          icon: <Waves className="w-4 h-4" />,
          badge: 'Bingham Model',
        },
        {
          id: 'monitor',
          label: `3. ${t.tabs.monitor}`,
          icon: <Activity className="w-4 h-4" />,
          badge: 'Raw Telemetry',
        },
        {
          id: 'map',
          label: `4. ${t.tabs.map}`,
          icon: <MapPin className="w-4 h-4" />,
          badge: 'GIS Transect',
        },
        {
          id: 'community',
          label: `5. ${t.tabs.community}`,
          icon: <Users className="w-4 h-4" />,
          badge: 'Safe Margins',
        },
        {
          id: 'satellite',
          label: `6. ${t.tabs.satellite}`,
          icon: <Satellite className="w-4 h-4" />,
          badge: 'Sikkim 2023',
        },
      ];
    }

    if (role === 'field_engineer') {
      return [
        {
          id: 'monitor',
          label: `1. ${t.tabs.monitor}`,
          icon: <Activity className="w-4 h-4" />,
          badge: 'ESP32 Calibrate',
        },
        {
          id: 'warn',
          label: `2. ${t.tabs.warn}`,
          icon: <BellRing className="w-4 h-4" />,
          badge: 'Hardware Failover',
        },
        {
          id: 'map',
          label: `3. ${t.tabs.map}`,
          icon: <MapPin className="w-4 h-4" />,
          badge: 'GIS Nodes',
        },
        {
          id: 'community',
          label: `4. ${t.tabs.community}`,
          icon: <Users className="w-4 h-4" />,
          badge: 'Village Mesh',
        },
        {
          id: 'satellite',
          label: `5. ${t.tabs.satellite}`,
          icon: <Satellite className="w-4 h-4" />,
          badge: 'Sikkim 2023',
        },
      ];
    }

    // Default: Incident Commander (Full Executive Access)
    return [
      {
        id: 'monitor',
        label: `1. ${t.tabs.monitor}`,
        icon: <Activity className="w-4 h-4" />,
        badge: 'Full Ingest',
      },
      {
        id: 'classify',
        label: `2. ${t.tabs.classify}`,
        icon: <BrainCircuit className="w-4 h-4" />,
        badge: 'Gemini AI',
      },
      {
        id: 'predict',
        label: `3. ${t.tabs.predict}`,
        icon: <Waves className="w-4 h-4" />,
        badge: 'Bingham Model',
      },
      {
        id: 'map',
        label: `4. ${t.tabs.map}`,
        icon: <MapPin className="w-4 h-4" />,
        badge: 'GIS Transect',
      },
      {
        id: 'warn',
        label: `5. ${t.tabs.warn}`,
        icon: <BellRing className="w-4 h-4" />,
        badge: isCritical ? 'ALARM' : 'Incident Command',
      },
      {
        id: 'community',
        label: `6. ${t.tabs.community}`,
        icon: <Users className="w-4 h-4" />,
        badge: 'Village Calc',
      },
      {
        id: 'satellite',
        label: `7. ${t.tabs.satellite}`,
        icon: <Satellite className="w-4 h-4" />,
        badge: 'Sikkim 2023',
      },
    ];
  };

  const tabs = getTabsForRole();

  return (
    <nav className="bg-[#FFFCF6] border-b border-[#C9C0B1] px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-thin shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-2">
        {tabs.map((tab) => {
          // Normalize active tab if old tab identifiers are passed
          const isMatch = activeTab === tab.id ||
            (tab.id === 'classify' && (activeTab === 'detect' || activeTab === 'classify')) ||
            (tab.id === 'warn' && (activeTab === 'warn' || activeTab === 'evacuate'));
          const isAlarm = (tab.badge === 'ALARM' || tab.badge === 'EVACUATE NOW') && isCritical;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isMatch
                  ? isAlarm
                    ? 'bg-[#F47721] text-white shadow-sm font-bold'
                    : 'bg-[#244A38] text-white shadow-sm font-bold'
                  : 'text-[#657067] hover:text-[#26352C] hover:bg-[#E9E2D5] border border-transparent'
              }`}
            >
              <span className={isMatch ? 'text-white' : isAlarm ? 'text-[#F47721] animate-bounce' : 'text-[#737C45]'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.isLocked && (
                <Lock className="w-3 h-3 text-[#657067]" />
              )}
              {tab.badge && (
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono font-bold ${
                    isAlarm
                      ? 'bg-[#FCE8D8] text-[#D95F12] animate-pulse border border-[#F47721]'
                      : tab.isLocked
                      ? 'bg-[#E9E2D5] text-[#657067]'
                      : isMatch
                      ? 'bg-[#386B4A] text-white'
                      : 'bg-[#E9E2D5] text-[#657067]'
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
