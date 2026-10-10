import React, { useState } from 'react';
import {
  BellRing,
  Volume2,
  VolumeX,
  Radio,
  Send,
  AlertOctagon,
  Shield,
  Navigation,
  CheckCircle2,
  XCircle,
  WifiOff,
  Wifi,
  Sparkles,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  AlertNotification,
  CommunicationChannel,
  EvacuationRoute,
  HazardZoneImpact,
  User,
} from '../types';

interface WarnEvacuateViewProps {
  alerts: AlertNotification[];
  channels: CommunicationChannel[];
  routes: EvacuationRoute[];
  zones: HazardZoneImpact[];
  currentUser: User | null;
  sirenActive: boolean;
  onToggleSiren: () => void;
  onToggleChannelFailure: (channelId: string) => void;
  onBroadcastAlert: (title: string, message: string, zones: string[], severity: AlertNotification['severity']) => Promise<void>;
  onGenerateAIAdvisory: (targetZone: string, leadTime: number) => Promise<string>;
  onOpenCalculator?: () => void;
}

export const WarnEvacuateView: React.FC<WarnEvacuateViewProps> = ({
  alerts,
  channels,
  routes,
  zones,
  currentUser,
  sirenActive,
  onToggleSiren,
  onToggleChannelFailure,
  onBroadcastAlert,
  onGenerateAIAdvisory,
  onOpenCalculator,
}) => {
  const [broadcastTitle, setBroadcastTitle] = useState('EXTREME GLOF HAZARD DETECTED');
  const [broadcastMsg, setBroadcastMsg] = useState(
    'EXTREME HAZARD DETECTED: Upstream moraine breach at South Lhonak Lake. Debris surge carrying boulders and ice approaching Zone A in ~18 minutes. Mandatory evacuation: take Route Alpha to Upper Ridge Helipad!'
  );
  const [selectedZone, setSelectedZone] = useState('Zone A');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const isCommander = currentUser?.role === 'commander';
  const isHydrologist = currentUser?.role === 'hydrologist';
  const isCitizen = currentUser?.role === 'public';
  const isFieldEngineer = currentUser?.role === 'field_engineer';
  const canBroadcast = isCommander || isHydrologist;

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMsg || !canBroadcast) return;
    setIsBroadcasting(true);
    try {
      await onBroadcastAlert(broadcastTitle, broadcastMsg, [selectedZone], 'EXTREME');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleGenerateSmartCopy = async () => {
    setIsGeneratingAI(true);
    try {
      const leadTime = selectedZone === 'Zone A' ? 18 : selectedZone === 'Zone B' ? 32 : 51;
      const copy = await onGenerateAIAdvisory(selectedZone, leadTime);
      setBroadcastMsg(copy);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`border rounded-xl p-5 shadow-xs transition-all ${
        sirenActive
          ? 'bg-[#FCE8D8] border-[#F47721]'
          : 'bg-[#FFFCF6] border-[#C9C0B1]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                sirenActive
                  ? 'bg-[#F47721] text-white border-[#D95F12] animate-pulse font-bold'
                  : 'bg-[#E9E2D5] text-[#244A38] border-[#C9C0B1]'
              }`}>
                {sirenActive ? 'SIREN ACTIVE • 130dB DEPLOYED' : 'EARLY WARNING SYSTEM READY'}
              </span>
              <h2 className="text-lg font-bold text-[#26352C]">Smart Warning Dispatch & Resilient Evacuation Engine</h2>
            </div>
            <p className="text-sm text-[#657067] mt-1 max-w-3xl">
              Provides simple, actionable public alerts with time-to-impact and safe routes. Features multi-channel communication resilience with automatic fallback to local sirens and LoRa edge gateways during network failures.
            </p>
          </div>

          {isCommander ? (
            <button
              id="siren-emergency-toggle-btn"
              onClick={onToggleSiren}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                sirenActive
                  ? 'bg-[#D95F12] hover:bg-[#F47721] text-white shadow-md animate-pulse'
                  : 'bg-[#F47721] hover:bg-[#D95F12] text-white shadow-xs'
              }`}
            >
              {sirenActive ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
              <span>{sirenActive ? 'SILENCE SIREN NETWORK' : 'TRIGGER SIREN NETWORK'}</span>
            </button>
          ) : (
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#E9E2D5] border border-[#C9C0B1] text-[#657067] cursor-not-allowed flex-shrink-0"
              title="Acoustic siren activation is restricted to NDMA Incident Commanders"
            >
              <VolumeX className="w-4 h-4 text-[#657067]" />
              <span>SIREN LOCKED (COMMANDER ONLY)</span>
            </div>
          )}
        </div>
      </div>

      {/* Communication Resilience Multi-Channel Status */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#244A38]" />
              Communication Resilience: Multi-Bearer Alert Pathways
            </h3>
            <p className="text-xs text-[#657067]">
              Simulate mountain communication loss (e.g. cellular tower destroyed) to demonstrate automatic fallback to autonomous local sirens and edge gateways.
            </p>
          </div>
          <span className="text-[11px] text-[#657067] font-mono">
            Fallback SLA: &lt; 3.2 seconds
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {channels.map((chan) => {
            const isOffline = chan.status === 'OFFLINE';

            return (
              <div
                key={chan.id}
                className={`p-3.5 rounded-lg border flex items-center justify-between transition-all ${
                  isOffline
                    ? 'bg-[#FCE8D8] border-[#F47721] text-[#26352C]'
                    : 'bg-[#E9E2D5]/70 border-[#C9C0B1] text-[#26352C]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    {isOffline ? <WifiOff className="w-4 h-4 text-[#F47721]" /> : <Wifi className="w-4 h-4 text-[#386B4A]" />}
                    <span className="text-xs font-bold">{chan.name}</span>
                  </div>
                  <div className="text-[11px] text-[#657067] mt-1">
                    Coverage: <span className="font-mono text-[#26352C] font-semibold">{chan.coveragePercent}%</span> | Status:{' '}
                    <span className={`font-semibold ${isOffline ? 'text-[#D95F12]' : 'text-[#386B4A]'}`}>
                      {chan.status}
                    </span>
                  </div>
                </div>

                <button
                  id={`toggle-channel-${chan.id}`}
                  onClick={() => onToggleChannelFailure(chan.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                    isOffline
                      ? 'bg-[#386B4A] hover:bg-[#244A38] text-white'
                      : 'bg-[#F47721] hover:bg-[#D95F12] text-white'
                  }`}
                  title={isOffline ? 'Restore communication channel' : 'Simulate network outage to test fallback'}
                >
                  {isOffline ? 'Restore' : 'Cut Link'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Broadcast Dispatcher & Real-Time Alert Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commander Alert Broadcast Dispatcher or Citizen Safety Hub */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          {isCitizen ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#386B4A]" />
                  Citizen Civil Defense & Evacuation Guide
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase bg-[#E9E2D5] text-[#386B4A] border-[#C9C0B1]">
                  CITIZEN ACCESS
                </span>
              </div>

              <p className="text-xs text-[#657067] mb-4">
                Personal emergency instructions, real-time warning reception, and verified high-ground paths away from river floodplains.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#26352C] block mb-1">Select Your Settlement Zone:</label>
                  <select
                    id="select-citizen-zone"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-xs text-[#26352C] focus:outline-none focus:border-[#F47721] font-mono"
                  >
                    <option value="Zone A">Zone A: Chungthang Valley Head (~18 min lead time)</option>
                    <option value="Zone B">Zone B: Dikchu Hydropower & Highway (~32 min lead time)</option>
                    <option value="Zone C">Zone C: Singtam & Rangpo Floodplain (~51 min lead time)</option>
                  </select>
                </div>

                <div className="bg-[#E9E2D5]/70 p-3.5 rounded-lg border border-[#C9C0B1] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#657067]">Current Zone Threat:</span>
                    <span className="font-bold font-mono text-[#386B4A]">
                      {zones.find(z => z.zoneId === selectedZone)?.riskLevel || 'LOW'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#657067]">Time to Impact:</span>
                    <span className="font-bold font-mono text-[#F47721]">
                      ~{zones.find(z => z.zoneId === selectedZone)?.estimatedTimeToImpactMinutes || 18} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#657067]">Designated Safe Ground:</span>
                    <span className="font-bold text-[#386B4A]">
                      {zones.find(z => z.zoneId === selectedZone)?.safeZoneName || 'Upper Ridge Refuge'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#C9C0B1] text-[11px] text-[#26352C]">
                    <span className="text-[#795548] font-bold">Evacuation Route: </span>
                    <span>{zones.find(z => z.zoneId === selectedZone)?.evacuationRouteName || 'Route Alpha'}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#FCE8D8] border border-[#F47721] rounded-lg text-xs space-y-1">
                  <div className="font-bold text-[#D95F12] flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-[#F47721]" />
                    <span>Riverbed Hazard Notice:</span>
                  </div>
                  <p className="text-[11px] text-[#26352C] leading-relaxed">
                    Never shelter under bridges or remain on NH-10 riverbank roadways during an alert. Head immediately uphill along marked ridge routes.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-[#F47721]" />
                  Emergency Warning Broadcast Console
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  canBroadcast ? 'bg-[#E9E2D5] text-[#244A38] border-[#C9C0B1]' : 'bg-[#E9E2D5] text-[#657067] border-[#C9C0B1]'
                }`}>
                  {isCommander ? 'NDMA COMMANDER AUTH' : isHydrologist ? 'WIHG SCIENTIFIC ADVISORY' : 'RESTRICTED TO COMMANDER'}
                </span>
              </div>

              <p className="text-xs text-[#657067] mb-4">
                Dispatches synchronized alerts across Cell Broadcast, Acoustic Sirens, SMS 112, and VHF Radio networks.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#26352C] block mb-1">Target Valley Zone:</label>
                  <select
                    id="select-alert-target-zone"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-xs text-[#26352C] focus:outline-none focus:border-[#F47721] font-mono"
                  >
                    <option value="Zone A">Zone A: Chungthang Dam & Valley Head (~18 min lead time)</option>
                    <option value="Zone B">Zone B: Dikchu Hydropower & Highway (~32 min lead time)</option>
                    <option value="Zone C">Zone C: Singtam & Rangpo Floodplain (~51 min lead time)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#26352C] block mb-1">Alert Headline:</label>
                  <input
                    id="input-alert-headline"
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-xs text-[#26352C] focus:outline-none focus:border-[#F47721] font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#26352C]">Actionable Public Instruction Message:</label>
                    <button
                      id="ai-generate-advisory-btn"
                      onClick={handleGenerateSmartCopy}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1 text-[11px] text-[#F47721] hover:text-[#D95F12] font-semibold disabled:opacity-50"
                    >
                      {isGeneratingAI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#F47721]" />}
                      <span>Generate Actionable Copy with Gemini AI</span>
                    </button>
                  </div>
                  <textarea
                    id="textarea-alert-body"
                    rows={4}
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg p-3 text-xs text-[#26352C] focus:outline-none focus:border-[#F47721] leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#C9C0B1] flex items-center justify-between gap-3">
            {isCitizen ? (
              <div className="flex items-center justify-between w-full text-xs text-[#657067]">
                <span className="flex items-center gap-1.5 text-[#386B4A] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#386B4A]" />
                  <span>Subscribed to Priority SMS 112 & Acoustic Siren Mesh</span>
                </span>
                <span className="text-[10px] font-mono text-[#657067]">ID: CITIZEN-SEC-01</span>
              </div>
            ) : (
              <>
                <span className="text-[11px] text-[#657067] italic">
                  {isHydrologist ? 'Advisory submitted to NDMA Commander' : 'Authorized for valley-wide broadcast'}
                </span>
                <button
                  id="submit-broadcast-alert-btn"
                  onClick={handleBroadcast}
                  disabled={isBroadcasting || !canBroadcast}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#F47721] hover:bg-[#D95F12] text-white shadow-xs transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>{isBroadcasting ? 'Broadcasting...' : isHydrologist ? 'Submit Advisory to Commander' : 'Broadcast Immediate Warning'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Real-time Alert Notification Feed */}
        <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F47721]" />
                Live Notification Stream (Real-Time SSE)
              </h3>
              <span className="text-[10px] bg-[#E9E2D5] text-[#26352C] px-2 py-0.5 rounded font-mono font-bold">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
              {alerts.length === 0 ? (
                <div className="bg-[#E9E2D5]/50 rounded-lg p-6 text-center border border-[#C9C0B1]">
                  <CheckCircle2 className="w-8 h-8 text-[#386B4A] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-[#26352C]">All Clear: No Active Emergency Warnings</p>
                  <p className="text-[11px] text-[#657067] mt-1">
                    System is actively listening to the real-time event stream. Warnings triggered by sensor spikes or commanders appear instantly here.
                  </p>
                </div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-[#FCE8D8] border border-[#F47721] rounded-lg p-3.5 shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#D95F12] flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-[#F47721]" />
                        {alt.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#657067]">{alt.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#26352C] leading-relaxed">{alt.message}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#F47721]/30 text-[10px] text-[#657067]">
                      <span>Affected: <span className="text-[#26352C] font-semibold">{alt.affectedZones.join(', ')}</span></span>
                      <span>Channels: <span className="text-[#386B4A] font-semibold">{alt.broadcastChannels.join(' • ')}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#C9C0B1] text-[11px] text-[#657067] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#386B4A] animate-ping"></span>
            <span>Push Notification Channel Active across all registered community devices.</span>
          </div>
        </div>
      </div>

      {/* Evacuation Assembly Time Calculator Launch Banner */}
      <div className="bg-[#FCE8D8] border border-[#F47721] rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F47721] text-white">
              FEATURED ENGINE
            </span>
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F47721]" />
              Evacuation Assembly Time Calculator (Safe Margin Window)
            </h3>
          </div>
          <p className="text-xs text-[#657067] max-w-2xl leading-relaxed">
            Calculate whether vulnerable village populations (elderly, schools, livestock) can reach designated high-ground refuges before the flood wave arrival time (t_arrival). Simulates mountain trail gradient, muster delays, and livestock bottlenecks.
          </p>
        </div>

        {onOpenCalculator && (
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-[#F47721] hover:bg-[#D95F12] text-white shadow-xs transition-all flex-shrink-0"
          >
            <span>Open Assembly Calculator</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Smart Evacuation Routing & Safe Zone Capacities */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#244A38]" />
              Smart Evacuation Routing & High-Ground Safe Zones
            </h3>
            <p className="text-xs text-[#657067]">
              The routing engine avoids predicted hazard footprints and automatically reroutes if low-lying river bridges or roads become submerged.
            </p>
          </div>
          <span className="text-xs text-[#386B4A] font-mono bg-[#E9E2D5] px-2 py-1 rounded border border-[#C9C0B1] font-semibold">
            All Safe Zones Pre-Stocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((route) => {
            const isDanger = route.status === 'HIGH_RISK_FLOOD_PATH' || route.status === 'CLOSED';

            return (
              <div
                key={route.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isDanger
                    ? 'bg-[#FCE8D8] border-[#F47721]'
                    : 'bg-[#FFFCF6] border-[#C9C0B1]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isDanger
                          ? 'bg-[#F47721] text-white border-[#D95F12] font-mono'
                          : 'bg-[#386B4A] text-white border-[#386B4A]'
                      }`}
                    >
                      {route.isRecommended ? 'RECOMMENDED' : 'AVOID / FLOOD PATH'}
                    </span>
                    <span className="text-xs font-mono text-[#657067]">{route.distanceKm} km</span>
                  </div>

                  <h4 className="text-sm font-bold text-[#26352C] mb-1">{route.name}</h4>
                  <p className="text-xs text-[#657067] leading-relaxed mb-3">{route.notes}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#C9C0B1] text-xs">
                  <div className="flex justify-between text-[#26352C]">
                    <span className="text-[#657067]">Destination:</span>
                    <span className="font-semibold text-right truncate max-w-[130px]">{route.destinationSafeZone}</span>
                  </div>
                  <div className="flex justify-between text-[#26352C]">
                    <span className="text-[#657067]">Safe Elevation:</span>
                    <span className="font-mono text-[#386B4A] font-bold">{route.safeZoneElevation}m ASL</span>
                  </div>
                  <div className="flex justify-between text-[#26352C]">
                    <span className="text-[#657067]">Walk Time:</span>
                    <span className="font-mono font-bold">~{route.estimatedWalkTimeMinutes} mins</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
