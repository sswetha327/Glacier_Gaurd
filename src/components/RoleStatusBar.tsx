import React from 'react';
import {
  ShieldAlert,
  BrainCircuit,
  Cpu,
  Users,
  CheckCircle2,
  Lock,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface RoleStatusBarProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
}

export const RoleStatusBar: React.FC<RoleStatusBarProps> = ({
  currentUser,
  onSwitchRole,
}) => {
  const role = currentUser?.role || 'commander';

  const roleMeta: Record<
    UserRole,
    {
      title: string;
      agency: string;
      clearance: string;
      color: string;
      badgeBg: string;
      icon: React.ReactNode;
      allowed: string[];
      restricted: string[];
    }
  > = {
    commander: {
      title: 'NDMA Incident Commander',
      agency: 'State Disaster Management Authority (Sikkim)',
      clearance: 'LEVEL 4 — FULL INCIDENT COMMAND',
      color: 'text-[#F47721] border-[#F47721]',
      badgeBg: 'bg-[#F47721] text-white border-[#D95F12]',
      icon: <ShieldAlert className="w-4 h-4 text-white" />,
      allowed: ['Trigger / Silence Siren Network', 'Valley-Wide Alert Dispatch', 'Mandatory Evacuation Orders'],
      restricted: ['Hardware Sensor Recalibration (Restricted to IoT Engineer)'],
    },
    hydrologist: {
      title: 'WIHG Glaciologist & Scientific Analyst',
      agency: 'Wadia Institute of Himalayan Geology',
      clearance: 'LEVEL 3 — RESEARCH & MODELING',
      color: 'text-[#386B4A] border-[#386B4A]',
      badgeBg: 'bg-[#386B4A] text-white border-[#244A38]',
      icon: <BrainCircuit className="w-4 h-4 text-white" />,
      allowed: ['Gemini AI Model Re-analysis', 'Debris Flow Physics Tuning (Clast/Slope)', 'Scientific Advisory Drafting'],
      restricted: ['Direct Siren Override (Requires Commander Co-authorization)'],
    },
    field_engineer: {
      title: 'IoT Field Sensor Engineer',
      agency: 'High Altitude Remote Sensor Ops (5,200m)',
      clearance: 'LEVEL 3 — HARDWARE & TELEMETRY',
      color: 'text-[#795548] border-[#795548]',
      badgeBg: 'bg-[#795548] text-white border-[#5d4037]',
      icon: <Cpu className="w-4 h-4 text-white" />,
      allowed: ['Manual Sensor Spike Injection', 'ESP32 Node Health Calibration', 'Bearer Failover & LoRa Mesh Testing'],
      restricted: ['Civil Alert Broadcasting', 'Acoustic Siren Override'],
    },
    public: {
      title: 'Downstream Community Resident',
      agency: 'Teesta Valley Citizen Safety Network',
      clearance: 'LEVEL 1 — PUBLIC SAFETY & EVACUATION',
      color: 'text-[#737C45] border-[#737C45]',
      badgeBg: 'bg-[#737C45] text-white border-[#555d33]',
      icon: <Users className="w-4 h-4 text-white" />,
      allowed: ['Personal Evacuation Route Guidance', 'High-Ground Safe Zone Capacities', 'Emergency SMS Warning Feeds'],
      restricted: ['Siren Override (Locked)', 'Sensor Telemetry Injection (Locked)', 'Public Alert Broadcasting (Locked)'],
    },
  };

  const current = roleMeta[role];

  return (
    <div className="bg-[#E9E2D5] border-b border-[#C9C0B1] px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Role Clearance Info */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#657067] font-semibold">ACTIVE ROLE:</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.badgeBg}`}>
              {current.icon}
              <span>{current.title}</span>
            </span>
          </div>

          <span className="hidden lg:inline text-[#C9C0B1]">•</span>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#657067]">
            <span className="text-[#26352C] font-semibold">{currentUser?.name || 'Authorized Operator'}</span>
            <span className="text-[#657067]">({current.agency})</span>
          </div>

          <span className="hidden xl:inline text-[#C9C0B1]">•</span>

          {/* Role Clearance Scope Pills */}
          <div className="hidden xl:flex items-center gap-2 text-[10px]">
            <span className="text-[#386B4A] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#386B4A]" />
              {current.allowed[0]}
            </span>
            {current.restricted[0] && (
              <span className="text-[#657067] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#657067]" />
                {current.restricted[0]}
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Switch Role Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-[#657067] font-bold uppercase flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-[#244A38]" />
            <span className="hidden sm:inline">Role Access:</span>
          </span>

          <div className="flex items-center gap-1 bg-[#FFFCF6] p-1 rounded-lg border border-[#C9C0B1]">
            <button
              id="switch-role-commander-btn"
              type="button"
              onClick={() => onSwitchRole('commander')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                role === 'commander'
                  ? 'bg-[#F47721] text-white shadow-xs font-bold'
                  : 'text-[#657067] hover:text-[#26352C] hover:bg-[#E9E2D5]'
              }`}
            >
              Commander
            </button>
            <button
              id="switch-role-hydrologist-btn"
              type="button"
              onClick={() => onSwitchRole('hydrologist')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                role === 'hydrologist'
                  ? 'bg-[#386B4A] text-white shadow-xs font-bold'
                  : 'text-[#657067] hover:text-[#26352C] hover:bg-[#E9E2D5]'
              }`}
            >
              Glaciologist
            </button>
            <button
              id="switch-role-engineer-btn"
              type="button"
              onClick={() => onSwitchRole('field_engineer')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                role === 'field_engineer'
                  ? 'bg-[#795548] text-white shadow-xs font-bold'
                  : 'text-[#657067] hover:text-[#26352C] hover:bg-[#E9E2D5]'
              }`}
            >
              IoT Engineer
            </button>
            <button
              id="switch-role-public-btn"
              type="button"
              onClick={() => onSwitchRole('public')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                role === 'public'
                  ? 'bg-[#737C45] text-white shadow-xs font-bold'
                  : 'text-[#657067] hover:text-[#26352C] hover:bg-[#E9E2D5]'
              }`}
            >
              Citizen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
