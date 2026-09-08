import React from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Radio,
  UserCheck,
  LogIn,
  LogOut,
  Sparkles,
  RefreshCw,
  Bell,
} from 'lucide-react';
import { User, LiveSystemState } from '../types';

interface NavbarProps {
  systemState?: LiveSystemState;
  currentRiskScore?: number;
  hazardType?: string;
  currentUser: User | null;
  sirenActive?: boolean;
  isSirenMuted?: boolean;
  onToggleSiren?: () => void;
  onToggleMute?: () => void;
  onOpenAuth?: () => void;
  onOpenAuthModal?: () => void;
  onLogout: () => void;
  onQuickSwitchRole?: (role: User['role']) => void;
  onResetToSafe?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  systemState,
  currentRiskScore,
  hazardType,
  currentUser,
  sirenActive = false,
  isSirenMuted = false,
  onToggleSiren,
  onToggleMute,
  onOpenAuth,
  onOpenAuthModal,
  onLogout,
  onQuickSwitchRole,
  onResetToSafe,
}) => {
  const riskScore = currentRiskScore ?? systemState?.currentRiskScore ?? 12;
  const riskBand = systemState?.riskBand ?? (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MODERATE' : 'LOW');
  const isCritical = riskScore >= 80;
  const isHigh = riskScore >= 60;
  const isModerate = riskScore >= 30;
  const isSirenActive = sirenActive || (systemState?.sirenActive ?? false);
  const handleToggleSound = onToggleSiren || onToggleMute;
  const handleOpenAuth = onOpenAuthModal || onOpenAuth;

  const badgeColor = isCritical
    ? 'bg-rose-950/80 text-rose-300 border-rose-600 animate-pulse'
    : isHigh
    ? 'bg-amber-950/80 text-amber-300 border-amber-600'
    : isModerate
    ? 'bg-yellow-950/80 text-yellow-300 border-yellow-600'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-600';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
              <ShieldAlert className="w-6 h-6 text-cyan-100" />
              {isSirenActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  GLACIERGUARD <span className="text-cyan-400 font-extrabold">AI</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Early Warning & Impact
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block italic">
                “Detect the danger at its source. Predict its path. Save lives before it arrives.”
              </p>
            </div>
          </div>

          {/* Real-time Status & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Live SSE Stream Pulse */}
            <div
              id="sse-status-indicator"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300"
              title="Real-Time Server-Sent Events Connection Active"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Telemetry Feed:</span>
              <span className="text-emerald-400 font-mono">ONLINE</span>
            </div>

            {/* Risk Score Indicator */}
            <div
              id="system-risk-indicator"
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}
            >
              <span>RISK:</span>
              <span className="text-sm font-mono font-bold">{riskScore}/100</span>
              <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.2 bg-black/40 rounded">
                {riskBand}
              </span>
            </div>

            {/* Siren Acoustic Synthesizer Toggle */}
            <button
              id="siren-mute-toggle-btn"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                isSirenActive
                  ? isSirenMuted
                    ? 'bg-amber-950 text-amber-200 border-amber-600'
                    : 'bg-rose-900 text-rose-100 border-rose-500 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title={isSirenMuted ? 'Acoustic siren muted (Click to unmute)' : 'Acoustic siren armed and active'}
            >
              {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isSirenMuted ? 'Muted' : isSirenActive ? 'Siren Active!' : 'Siren Ready'}</span>
            </button>

            {/* Reset to Safe Baseline */}
            {onResetToSafe && (
              <button
                id="baseline-reset-btn"
                onClick={onResetToSafe}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset system sensors to normal baseline state"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden md:inline">Reset Baseline</span>
              </button>
            )}

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    id="user-role-dropdown-btn"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-cyan-950/80 text-cyan-200 border border-cyan-700/60 hover:bg-cyan-900 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                  </button>
                  {/* Quick role switcher dropdown for hackathon judges */}
                  {onQuickSwitchRole && (
                    <div className="absolute right-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-2 hidden group-hover:block z-50">
                      <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Quick Switch Role:</div>
                      <button
                        onClick={() => onQuickSwitchRole('commander')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'commander' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Emergency Commander</span>
                        <span className="text-[10px] text-slate-500">NDMA</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('hydrologist')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'hydrologist' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Glaciologist / Analyst</span>
                        <span className="text-[10px] text-slate-500">WIHG</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('field_engineer')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'field_engineer' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>IoT Sensor Engineer</span>
                        <span className="text-[10px] text-slate-500">ESP32</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('public')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'public' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>Downstream Resident</span>
                        <span className="text-[10px] text-slate-500">Citizen</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="sign-in-modal-btn"
                onClick={handleOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
