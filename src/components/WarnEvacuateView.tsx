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
}) => {
  const [broadcastTitle, setBroadcastTitle] = useState('EXTREME GLOF HAZARD DETECTED');
  const [broadcastMsg, setBroadcastMsg] = useState(
    'EXTREME HAZARD DETECTED: Upstream moraine breach at South Lhonak Lake. Debris surge carrying boulders and ice approaching Zone A in ~18 minutes. Mandatory evacuation: take Route Alpha to Upper Ridge Helipad!'
  );
  const [selectedZone, setSelectedZone] = useState('Zone A');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const canBroadcast = currentUser?.role === 'commander' || currentUser?.role === 'hydrologist';

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastMsg) return;
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                STEP 5 & 6 — WARN & EVACUATE
              </span>
              <h2 className="text-lg font-bold text-white">Smart Warning Dispatch & Resilient Evacuation Engine</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Provides simple, actionable public alerts with time-to-impact and safe routes. Features multi-channel communication resilience with automatic fallback to local sirens and LoRa edge gateways during network failures.
            </p>
          </div>

          <button
            id="siren-emergency-toggle-btn"
            onClick={onToggleSiren}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
              sirenActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {sirenActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{sirenActive ? 'SILENCE SIREN NETWORK' : 'TRIGGER SIREN NETWORK'}</span>
          </button>
        </div>
      </div>

      {/* Communication Resilience Multi-Channel Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Communication Resilience: Multi-Bearer Alert Pathways
            </h3>
            <p className="text-xs text-slate-400">
              Simulate mountain communication loss (e.g. cellular tower destroyed) to demonstrate automatic fallback to autonomous local sirens and edge gateways.
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
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
                    ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    {isOffline ? <WifiOff className="w-4 h-4 text-rose-400" /> : <Wifi className="w-4 h-4 text-cyan-400" />}
                    <span className="text-xs font-semibold">{chan.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Coverage: <span className="font-mono text-slate-300">{chan.coveragePercent}%</span> | Status:{' '}
                    <span className={`font-semibold ${isOffline ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {chan.status}
                    </span>
                  </div>
                </div>

                <button
                  id={`toggle-channel-${chan.id}`}
                  onClick={() => onToggleChannelFailure(chan.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                    isOffline
                      ? 'bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                      : 'bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-200 border border-slate-700'
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
        {/* Commander Alert Broadcast Dispatcher */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-400" />
                Emergency Warning Broadcast Console
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                canBroadcast ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {canBroadcast ? `${currentUser?.role.toUpperCase()} AUTH` : 'RESTRICTED TO COMMANDER'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Dispatches synchronized alerts across Cell Broadcast, Acoustic Sirens, SMS 112, and VHF Radio networks.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Target Valley Zone:</label>
                <select
                  id="select-alert-target-zone"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="Zone A">Zone A: Chungthang Dam & Valley Head (~18 min lead time)</option>
                  <option value="Zone B">Zone B: Dikchu Hydropower & Highway (~32 min lead time)</option>
                  <option value="Zone C">Zone C: Singtam & Rangpo Floodplain (~51 min lead time)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Alert Headline:</label>
                <input
                  id="input-alert-headline"
                  type="text"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">Actionable Public Instruction Message:</label>
                  <button
                    id="ai-generate-advisory-btn"
                    onClick={handleGenerateSmartCopy}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium disabled:opacity-50"
                  >
                    {isGeneratingAI ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Generate Actionable Copy with Gemini AI</span>
                  </button>
                </div>
                <textarea
                  id="textarea-alert-body"
                  rows={4}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400 italic">
              Example format: “EXTREME HAZARD DETECTED. Evacuate via Route B.”
            </span>
            <button
              id="submit-broadcast-alert-btn"
              onClick={handleBroadcast}
              disabled={isBroadcasting || !canBroadcast}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Immediate Warning'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Alert Notification Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Live Notification Stream (Real-Time SSE)
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {alerts.length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin pr-1">
              {alerts.length === 0 ? (
                <div className="bg-slate-950/60 rounded-lg p-6 text-center border border-slate-800/80">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-semibold text-slate-300">All Clear: No Active Emergency Warnings</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    System is actively listening to the real-time event stream. Warnings triggered by sensor spikes or commanders appear instantly here.
                  </p>
                </div>
              ) : (
                alerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="bg-slate-950/80 border border-rose-900/60 rounded-lg p-3.5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-300 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        {alt.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{alt.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{alt.message}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <span>Affected: <span className="text-slate-200 font-medium">{alt.affectedZones.join(', ')}</span></span>
                      <span>Channels: <span className="text-cyan-400">{alt.broadcastChannels.join(' • ')}</span></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Push Notification Channel Active across all registered community devices.</span>
          </div>
        </div>
      </div>

      {/* Smart Evacuation Routing & Safe Zone Capacities */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              Smart Evacuation Routing & High-Ground Safe Zones
            </h3>
            <p className="text-xs text-slate-400">
              The routing engine avoids predicted hazard footprints and automatically reroutes if low-lying river bridges or roads become submerged.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono bg-emerald-950 px-2 py-1 rounded border border-emerald-800">
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
                    ? 'bg-rose-950/20 border-rose-900/80'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        isDanger
                          ? 'bg-rose-900 text-rose-200 border-rose-600 font-mono'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      }`}
                    >
                      {route.isRecommended ? 'RECOMMENDED' : 'AVOID / FLOOD PATH'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{route.distanceKm} km</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{route.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{route.notes}</p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Destination:</span>
                    <span className="font-semibold text-right truncate max-w-[130px]">{route.destinationSafeZone}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Safe Elevation:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{route.safeZoneElevation}m ASL</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Walk Time:</span>
                    <span className="font-mono font-semibold">~{route.estimatedWalkTimeMinutes} mins</span>
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
