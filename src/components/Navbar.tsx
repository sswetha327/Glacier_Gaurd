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
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../utils/translations';
import { Users } from 'lucide-react';

interface NavbarProps {
  systemState?: LiveSystemState;
  currentRiskScore?: number;
  hazardType?: string;
  currentUser: User | null;
  sirenActive?: boolean;
  isSirenMuted?: boolean;
  currentLang?: SupportedLanguage;
  onChangeLang?: (lang: SupportedLanguage) => void;
  isCitizenMode?: boolean;
  onToggleCitizenMode?: () => void;
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
  currentLang = 'en',
  onChangeLang,
  isCitizenMode = false,
  onToggleCitizenMode,
  onToggleSiren,
  onToggleMute,
  onOpenAuth,
  onOpenAuthModal,
  onLogout,
  onQuickSwitchRole,
  onResetToSafe,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const navT = t.navbar;
  const riskScore = currentRiskScore ?? systemState?.currentRiskScore ?? 12;
  const riskBand = systemState?.riskBand ?? (riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MODERATE' : 'LOW');
  const isCritical = riskScore >= 80;
  const isHigh = riskScore >= 60;
  const isModerate = riskScore >= 30;
  const isSirenActive = sirenActive || (systemState?.sirenActive ?? false);
  const handleToggleSound = onToggleSiren || onToggleMute;
  const handleOpenAuth = onOpenAuthModal || onOpenAuth;

  const badgeColor = isCritical
    ? 'bg-[#FCE8D8] text-[#D95F12] border-[#F47721] animate-pulse font-bold'
    : isHigh
    ? 'bg-[#FCE8D8] text-[#F47721] border-[#F47721]'
    : isModerate
    ? 'bg-[#D8C3A5]/30 text-[#737C45] border-[#737C45]'
    : 'bg-[#386B4A] text-white border-[#386B4A]';

  return (
    <header className="sticky top-0 z-50 border-b border-[#386B4A]/60 bg-[#244A38] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo and Tagline */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#386B4A] text-white shadow-md border border-[#D8C3A5]/40">
              <ShieldAlert className="w-6 h-6 text-[#F5F1E8]" />
              {isSirenActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F47721] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F47721]"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  GLACIERGUARD <span className="text-[#F47721] font-extrabold">AI</span>
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#386B4A] text-[#F5F1E8] border border-[#D8C3A5]/40">
                  Early Warning & Impact
                </span>
              </div>
              <p className="text-xs text-[#D8C3A5] hidden sm:block italic">
                “Detect the danger at its source. Predict its path. Save lives before it arrives.”
              </p>
            </div>
          </div>

          {/* Real-time Status & Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Risk Score Indicator */}
            <div
              id="system-risk-indicator"
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold border ${badgeColor}`}
            >
              <span className="opacity-90">RISK:</span>
              <span className="text-sm font-mono font-bold">{riskScore}/100</span>
              <span className="uppercase tracking-wider text-[10px] px-1.5 py-0.2 bg-black/20 rounded">
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
                    ? 'bg-[#795548] text-white border-[#D8C3A5]'
                    : 'bg-[#F47721] text-white border-[#D95F12] animate-pulse font-bold'
                  : 'bg-[#386B4A] text-white border-[#386B4A] hover:bg-[#1E3E2F]'
              }`}
              title={isSirenMuted ? 'Acoustic siren muted (Click to unmute)' : 'Acoustic siren armed and active'}
            >
              {isSirenMuted ? <VolumeX className="w-3.5 h-3.5 text-[#D8C3A5]" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              <span>{isSirenMuted ? 'Muted' : isSirenActive ? 'Siren Active!' : 'Siren Ready'}</span>
            </button>

            {/* Regional Language Switcher: Fast Toggle */}
            <div className="flex items-center bg-[#1E3E2F] border border-[#386B4A] rounded-md p-0.5">
              {SUPPORTED_LANGUAGES.map((l) => {
                const isSelected = currentLang === l.code;
                return (
                  <button
                    key={l.code}
                    onClick={() => onChangeLang?.(l.code)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'bg-[#F47721] text-white shadow-sm'
                        : 'text-[#D8C3A5] hover:text-white'
                    }`}
                    title={`${l.label} (${l.nativeLabel})`}
                  >
                    {l.flagOrScript}
                  </button>
                );
              })}
            </div>

            {/* Citizen Community Mode Fast Toggle */}
            {onToggleCitizenMode && (
              <button
                id="citizen-mode-toggle-btn"
                onClick={onToggleCitizenMode}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isCitizenMode
                    ? 'bg-[#F47721] text-white shadow-sm font-bold'
                    : 'bg-[#386B4A] text-white border border-[#D8C3A5]/40 hover:bg-[#1E3E2F]'
                }`}
                title="Fast toggle into Citizen Community Safety Portal"
              >
                <Users className="w-3.5 h-3.5 text-[#D8C3A5]" />
                <span className="hidden sm:inline">{isCitizenMode ? navT.commandMode : navT.citizenMode}</span>
              </button>
            )}

            {/* Reset to Safe Baseline */}
            {onResetToSafe && (
              <button
                id="baseline-reset-btn"
                onClick={onResetToSafe}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#386B4A] text-[#F5F1E8] border border-[#386B4A] hover:text-white hover:bg-[#1E3E2F] transition-colors"
                title="Reset system sensors to normal baseline state"
              >
                <RefreshCw className="w-3 h-3 text-[#D8C3A5]" />
                <span className="hidden lg:inline">{navT.resetBaseline}</span>
              </button>
            )}

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    id="user-role-dropdown-btn"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#386B4A] text-white border border-[#D8C3A5]/50 hover:bg-[#1E3E2F] transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#D8C3A5]" />
                    <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
                  </button>
                  {/* Quick role switcher dropdown for hackathon judges */}
                  {onQuickSwitchRole && (
                    <div className="absolute right-0 mt-1 w-52 bg-[#FFFCF6] text-[#26352C] border border-[#C9C0B1] rounded-lg shadow-xl p-2 hidden group-hover:block z-50">
                      <div className="text-[10px] uppercase font-bold text-[#657067] px-2 py-1">Quick Switch Role:</div>
                      <button
                        onClick={() => onQuickSwitchRole('commander')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'commander' ? 'bg-[#244A38] text-white font-bold' : 'text-[#26352C] hover:bg-[#E9E2D5]'
                        }`}
                      >
                        <span>Emergency Commander</span>
                        <span className="text-[10px] text-[#657067]">NDMA</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('hydrologist')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'hydrologist' ? 'bg-[#244A38] text-white font-bold' : 'text-[#26352C] hover:bg-[#E9E2D5]'
                        }`}
                      >
                        <span>Glaciologist / Analyst</span>
                        <span className="text-[10px] text-[#657067]">WIHG</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('field_engineer')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'field_engineer' ? 'bg-[#244A38] text-white font-bold' : 'text-[#26352C] hover:bg-[#E9E2D5]'
                        }`}
                      >
                        <span>IoT Sensor Engineer</span>
                        <span className="text-[10px] text-[#657067]">ESP32</span>
                      </button>
                      <button
                        onClick={() => onQuickSwitchRole('public')}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between ${
                          currentUser.role === 'public' ? 'bg-[#244A38] text-white font-bold' : 'text-[#26352C] hover:bg-[#E9E2D5]'
                        }`}
                      >
                        <span>Downstream Resident</span>
                        <span className="text-[10px] text-[#657067]">Citizen</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  id="user-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-md text-[#D8C3A5] hover:text-[#F47721] hover:bg-[#1E3E2F] border border-[#386B4A]"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {onQuickSwitchRole && (
                  <div className="hidden lg:flex items-center gap-1 bg-[#1E3E2F] border border-[#386B4A] rounded-md p-0.5">
                    <span className="text-[10px] text-[#D8C3A5] font-semibold px-1.5 uppercase">Role:</span>
                    <button
                      type="button"
                      onClick={() => onQuickSwitchRole('commander')}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white hover:bg-[#244A38] transition-colors"
                      title="Sign in as NDMA Commander"
                    >
                      Commander
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickSwitchRole('hydrologist')}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white hover:bg-[#244A38] transition-colors"
                      title="Sign in as WIHG Glaciologist"
                    >
                      Glaciologist
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickSwitchRole('field_engineer')}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white hover:bg-[#244A38] transition-colors"
                      title="Sign in as IoT Engineer"
                    >
                      IoT Sensor
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickSwitchRole('public')}
                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white hover:bg-[#244A38] transition-colors"
                      title="Sign in as Downstream Resident"
                    >
                      Citizen
                    </button>
                  </div>
                )}
                <button
                  id="sign-in-modal-btn"
                  onClick={handleOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#F47721] hover:bg-[#D95F12] text-white shadow-sm transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
