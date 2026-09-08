import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { LiveDemoBar } from './components/LiveDemoBar';
import { WorkflowSteps, TabType } from './components/WorkflowSteps';
import { MonitorView } from './components/MonitorView';
import { DetectClassifyView } from './components/DetectClassifyView';
import { DebrisPredictView } from './components/DebrisPredictView';
import { ImpactMapView } from './components/ImpactMapView';
import { WarnEvacuateView } from './components/WarnEvacuateView';
import { SatelliteView } from './components/SatelliteView';
import { AuthModal } from './components/AuthModal';
import { playEmergencySiren, stopEmergencySiren } from './utils/sirenAudio';
import {
  LiveSystemState,
  User,
  UserRole,
  SensorTelemetry,
  AlertNotification,
} from './types';

const INITIAL_STATE: LiveSystemState = {
  currentRiskScore: 12,
  riskBand: 'LOW',
  hazardClassification: {
    hazardType: 'Normal / No Hazard',
    confidencePercent: 97,
    riskScore: 12,
    riskBand: 'LOW',
    sourcePrecursor: 'Baseline sensor readings nominal across South Lhonak proglacial lake.',
    triggerChainSummary: 'Ambient seasonal equilibrium -> Stable moraine dam -> Nominal discharge.',
    recommendedAction: 'Continue 24/7 automated telemetry ingestion.',
    reasoning: 'Ground vibration within background acoustic noise. Lake stage shows zero displacement wave.',
    isAiGenerated: false,
    timestamp: new Date().toISOString(),
  },
  debrisAssessment: {
    score: 18,
    severityLevel: 'LOW',
    waterVolumeMillionM3: 24.5,
    solidFractionPercent: 12,
    averageSlopeDegrees: 21.4,
    estimatedPeakDischargeM3s: 650,
    dominantComposition: 'Water-dominant clear hydraulic discharge',
    description: 'Minimal sediment mobilization. Standard channel baseflow.',
  },
  telemetry: {
    timestamp: new Date().toISOString(),
    lakeWaterLevelMeters: 32.4,
    lakeRateOfRiseMetersPerHour: 0.04,
    seismicMagnitudeRichter: 0.8,
    seismicVibrationRMS: 0.02,
    glacierDisplacementMmDay: 35,
    ambientTemperatureCelsius: 1.2,
    precipitationMmPerHour: 0.0,
    freezingLevelMeters: 4850,
    riverStageMeters: 3.1,
    riverDischargeM3s: 420,
    cameraDebrisDetected: false,
    cameraCalvingDetected: false,
  },
  zones: [
    {
      zoneId: 'Zone A',
      name: 'Chungthang Valley & Teesta Stage III Dam',
      location: 'Teesta Confluence (Upper Valley)',
      elevationMeters: 1790,
      distanceFromSourceKm: 24.2,
      estimatedTimeToImpactMinutes: 18,
      uncertaintyMinutes: 2,
      riskLevel: 'LOW',
      projectedFlowDepthMeters: 2.1,
      populationAtRisk: 3400,
      keyInfrastructure: ['Teesta III Hydro Dam', 'ITBP Mountain Post', 'NH-10 Bailey Bridge'],
      safeZoneName: 'Chungthang Upper Ridge Helipad (Elev 2,150m)',
      evacuationRouteName: 'Route Alpha: Upper Ridgecrest Paved Ascent',
      evacuationStatus: 'MONITORING',
    },
    {
      zoneId: 'Zone B',
      name: 'Dikchu Hydropower & Highway Corridor',
      location: 'Middle Teesta Basin',
      elevationMeters: 650,
      distanceFromSourceKm: 48.6,
      estimatedTimeToImpactMinutes: 32,
      uncertaintyMinutes: 4,
      riskLevel: 'LOW',
      projectedFlowDepthMeters: 1.8,
      populationAtRisk: 6800,
      keyInfrastructure: ['Dikchu Powerhouse', 'NH-10 Arterial Highway', 'Local Market Footbridge'],
      safeZoneName: 'Dikchu Monastery High Ground (Elev 1,020m)',
      evacuationRouteName: 'Route Beta: North Ridge Forest Track',
      evacuationStatus: 'MONITORING',
    },
    {
      zoneId: 'Zone C',
      name: 'Singtam & Rangpo Downstream Floodplain',
      location: 'Lower Commercial Teesta Corridor',
      elevationMeters: 350,
      distanceFromSourceKm: 72.4,
      estimatedTimeToImpactMinutes: 51,
      uncertaintyMinutes: 6,
      riskLevel: 'LOW',
      projectedFlowDepthMeters: 1.2,
      populationAtRisk: 18500,
      keyInfrastructure: ['Indrani Bridge', 'Singtam District Hospital', 'Municipal Pumping Station'],
      safeZoneName: 'Singtam Govt College Stadium High Ground (Elev 510m)',
      evacuationRouteName: 'Route Gamma: Bypass Elevated Corridor',
      evacuationStatus: 'MONITORING',
    },
  ],
  routes: [
    {
      id: 'rte_a1',
      name: 'Route Alpha: Upper Ridgecrest Paved Ascent',
      destinationSafeZone: 'Chungthang Upper Ridge Helipad',
      safeZoneElevation: 2150,
      capacityPeople: 4500,
      currentOccupancy: 85,
      status: 'CLEAR',
      distanceKm: 2.1,
      estimatedWalkTimeMinutes: 14,
      isRecommended: true,
      notes: 'Well-graded ridge trail with solar emergency beacons and clear line-of-sight away from river gully.',
    },
    {
      id: 'rte_a2',
      name: 'Route River Road (Hazardous in GLOF)',
      destinationSafeZone: 'Low River Terrace Shelter',
      safeZoneElevation: 1810,
      capacityPeople: 1200,
      currentOccupancy: 10,
      status: 'HIGH_RISK_FLOOD_PATH',
      distanceKm: 1.4,
      estimatedWalkTimeMinutes: 10,
      isRecommended: false,
      notes: 'WARNING: Submerged within 15 mins of moraine breach. Do not utilize during alert state.',
    },
    {
      id: 'rte_b1',
      name: 'Route Beta: North Ridge Forest Track',
      destinationSafeZone: 'Dikchu Monastery High Terrace',
      safeZoneElevation: 1020,
      capacityPeople: 8000,
      currentOccupancy: 210,
      status: 'CLEAR',
      distanceKm: 3.4,
      estimatedWalkTimeMinutes: 24,
      isRecommended: true,
      notes: 'Wide concrete access steps ascending north hillside to historic monastery grounds.',
    },
    {
      id: 'rte_c1',
      name: 'Route Gamma: Bypass Elevated Corridor',
      destinationSafeZone: 'Singtam Govt College Stadium High Ground',
      safeZoneElevation: 510,
      capacityPeople: 22000,
      currentOccupancy: 450,
      status: 'CLEAR',
      distanceKm: 2.8,
      estimatedWalkTimeMinutes: 20,
      isRecommended: true,
      notes: 'Elevated bypass highway above historic high-water mark, accessible for vehicles and pedestrians.',
    },
  ],
  channels: [
    {
      id: 'com_cellular',
      name: '4G/5G Cellular & Cell-Broadcast',
      type: 'cellular',
      status: 'OPERATIONAL',
      coveragePercent: 88,
      lastTestTime: '2 mins ago',
      isSimulatedFailure: false,
    },
    {
      id: 'com_siren',
      name: 'Valley Acoustic Siren Network (130dB)',
      type: 'siren',
      status: 'OPERATIONAL',
      coveragePercent: 98,
      lastTestTime: '1 hr ago',
      isSimulatedFailure: false,
    },
    {
      id: 'com_mesh',
      name: 'LoRa / ESP32 Edge Mesh Gateways',
      type: 'edge_gateway',
      status: 'OPERATIONAL',
      coveragePercent: 95,
      lastTestTime: '30 secs ago',
      isSimulatedFailure: false,
    },
    {
      id: 'com_sat',
      name: 'Emergency Satellite Backhaul (LEO)',
      type: 'satellite',
      status: 'OPERATIONAL',
      coveragePercent: 100,
      lastTestTime: '5 mins ago',
      isSimulatedFailure: false,
    },
    {
      id: 'com_radio',
      name: 'VHF Emergency Civil Defense Radio',
      type: 'vhf_radio',
      status: 'OPERATIONAL',
      coveragePercent: 92,
      lastTestTime: '10 mins ago',
      isSimulatedFailure: false,
    },
    {
      id: 'com_sms',
      name: 'Priority SMS Gateway (Short-Code 112)',
      type: 'sms',
      status: 'OPERATIONAL',
      coveragePercent: 86,
      lastTestTime: '4 mins ago',
      isSimulatedFailure: false,
    },
  ],
  nodes: [
    {
      nodeId: 'ESP32-GLAC-01',
      location: 'South Lhonak Moraine Crest (5,200m)',
      batteryPercent: 94,
      solarInputWatts: 14.8,
      loraSignalRssi: -72,
      cellularActive: true,
      satelliteFallbackReady: true,
      status: 'ONLINE',
      lastPing: 'Just now',
    },
    {
      nodeId: 'ESP32-LAKE-02',
      location: 'Proglacial Lake Outflow Flume (5,180m)',
      batteryPercent: 88,
      solarInputWatts: 12.2,
      loraSignalRssi: -79,
      cellularActive: true,
      satelliteFallbackReady: true,
      status: 'ONLINE',
      lastPing: '12s ago',
    },
    {
      nodeId: 'ESP32-SEIS-03',
      location: 'Lateral Moraine Seismic Bedrock (5,050m)',
      batteryPercent: 91,
      solarInputWatts: 15.0,
      loraSignalRssi: -68,
      cellularActive: true,
      satelliteFallbackReady: true,
      status: 'ONLINE',
      lastPing: '5s ago',
    },
    {
      nodeId: 'ESP32-RIV-04',
      location: 'Chungthang Confluence Bridge (1,790m)',
      batteryPercent: 97,
      solarInputWatts: 22.4,
      loraSignalRssi: -64,
      cellularActive: true,
      satelliteFallbackReady: true,
      status: 'ONLINE',
      lastPing: '1s ago',
    },
  ],
  activeAlerts: [],
  sirenActive: false,
  scenarioRunning: false,
  currentScenario: 'Baseline Nominal Monitoring',
};

// Safe State Sanitizer Helper to prevent undefined property errors
function sanitizeSystemState(raw: any, current?: LiveSystemState): LiveSystemState {
  if (!raw) return current || INITIAL_STATE;
  const base = current || INITIAL_STATE;
  const target = (raw.state && raw.state.telemetry)
    ? raw.state
    : (raw.payload && raw.payload.telemetry)
    ? raw.payload
    : (raw.telemetry ? raw : base);

  return {
    ...base,
    ...target,
    telemetry: {
      ...base.telemetry,
      ...(target.telemetry || {}),
    },
    hazardClassification: {
      ...base.hazardClassification,
      ...(target.hazardClassification || {}),
    },
    debrisAssessment: {
      ...base.debrisAssessment,
      ...(target.debrisAssessment || {}),
    },
    zones: Array.isArray(target.zones) && target.zones.length > 0 ? target.zones : base.zones,
    routes: Array.isArray(target.routes) && target.routes.length > 0 ? target.routes : base.routes,
    channels: Array.isArray(target.channels) && target.channels.length > 0 ? target.channels : base.channels,
    nodes: Array.isArray(target.nodes) && target.nodes.length > 0 ? target.nodes : base.nodes,
    activeAlerts: Array.isArray(target.activeAlerts) ? target.activeAlerts : base.activeAlerts,
    currentRiskScore: typeof target.currentRiskScore === 'number' ? target.currentRiskScore : base.currentRiskScore,
    currentScenario: target.currentScenario || base.currentScenario,
  };
}

export default function App() {
  const [systemState, setSystemState] = useState<LiveSystemState>(INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<TabType>('monitor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [sirenActive, setSirenActive] = useState<boolean>(false);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);

  // Setup EventSource for Real-Time SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onopen = () => {
        setSseConnected(true);
      };

      eventSource.addEventListener('state_update', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setSystemState((prev) => sanitizeSystemState(data, prev));
        } catch (err) {
          console.error('Error parsing SSE state_update:', err);
        }
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if ((data.type === 'STATE_UPDATE' || data.type === 'STATE') && (data.payload || data.data)) {
            setSystemState((prev) => sanitizeSystemState(data.payload || data.data, prev));
          } else if (data.type === 'ALERT_BROADCAST' && data.payload) {
            setSystemState((prev) => ({
              ...prev,
              activeAlerts: [data.payload, ...(prev?.activeAlerts || [])],
            }));
          } else if (data.telemetry || data.state) {
            setSystemState((prev) => sanitizeSystemState(data, prev));
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = () => {
        setSseConnected(false);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Initial Fetch of System State and User Auth Profile
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const stateRes = await fetch('/api/sensors/state');
        if (stateRes.ok) {
          const data = await stateRes.json();
          setSystemState((prev) => sanitizeSystemState(data, prev));
        }
      } catch (err) {
        console.error('Failed to fetch initial state:', err);
      }

      // Check for user token
      const token = localStorage.getItem('glacierguard_token');
      if (token) {
        try {
          const userRes = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentUser(userData);
          } else {
            localStorage.removeItem('glacierguard_token');
          }
        } catch (e) {
          console.warn('Auth check failed:', e);
        }
      } else {
        // Provide convenient default Commander identity for smooth hackathon evaluation
        setCurrentUser({
          id: 'user_commander_01',
          name: 'Col. Rajesh Sharma',
          email: 'commander@glacierguard.gov',
          role: 'commander',
          agency: 'National Disaster Management Authority (NDMA)',
          createdAt: new Date().toISOString(),
        });
      }
    };

    fetchInitialData();
  }, []);

  // Handle Siren Activation
  const handleToggleSiren = useCallback(() => {
    if (sirenActive) {
      stopEmergencySiren();
      setSirenActive(false);
    } else {
      playEmergencySiren();
      setSirenActive(true);
    }
  }, [sirenActive]);

  // Trigger Demo Script Steps (Section 21)
  const handleTriggerDemoStep = async (stepNumber: number) => {
    try {
      const res = await fetch('/api/sensors/trigger-demo-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepNumber }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSystemState((prev) => sanitizeSystemState(updated, prev));

        // If step triggers critical risk, sound siren briefly to alert judges
        if (stepNumber === 5 || stepNumber === 6) {
          if (!sirenActive) {
            playEmergencySiren();
            setSirenActive(true);
          }
        } else if (stepNumber === 1 && sirenActive) {
          stopEmergencySiren();
          setSirenActive(false);
        }
      }
    } catch (err) {
      console.error('Failed to trigger demo step:', err);
    }
  };

  // Reset System State to Safe
  const handleReset = async () => {
    try {
      const res = await fetch('/api/sensors/reset', { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setSystemState((prev) => sanitizeSystemState(updated, prev));
        if (sirenActive) {
          stopEmergencySiren();
          setSirenActive(false);
        }
      }
    } catch (err) {
      console.error('Failed to reset system state:', err);
    }
  };

  // Update Individual Sensor Telemetry
  const handleUpdateSensor = async (partial: Partial<SensorTelemetry>) => {
    try {
      const res = await fetch('/api/sensors/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (res.ok) {
        const updated = await res.json();
        setSystemState((prev) => sanitizeSystemState(updated, prev));
      }
    } catch (err) {
      console.error('Failed to update sensor values:', err);
    }
  };

  // Re-Analyze with Gemini AI
  const handleReanalyzeWithAI = async () => {
    setIsLoadingAI(true);
    try {
      const currentTelem = systemState?.telemetry ?? INITIAL_STATE.telemetry;
      const res = await fetch('/api/ai/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry: currentTelem }),
      });
      if (res.ok) {
        const aiResult = await res.json();
        const classification = aiResult.classification || aiResult;
        setSystemState((prev) => ({
          ...prev,
          hazardClassification: classification,
          currentRiskScore: typeof classification.riskScore === 'number' ? classification.riskScore : prev.currentRiskScore,
        }));
      }
    } catch (err) {
      console.error('AI classification request failed:', err);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Recalculate Debris Flow Severity
  const handleRecalculateDebris = async (params: {
    waterVolumeMillionM3: number;
    solidFractionPercent: number;
    averageSlopeDegrees: number;
    peakDischargeM3s: number;
  }) => {
    try {
      const res = await fetch('/api/sensors/debris/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const debrisResult = await res.json();
        const assessment = debrisResult.assessment || debrisResult;
        setSystemState((prev) => ({
          ...prev,
          debrisAssessment: assessment,
        }));
      }
    } catch (err) {
      console.error('Failed to calculate debris flow:', err);
    }
  };

  // Toggle Communication Channel Outage (Test Fallback)
  const handleToggleChannelFailure = async (channelId: string) => {
    try {
      const res = await fetch('/api/alerts/toggle-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (res.ok) {
        const data = await res.json();
        const channels = data.channels || (Array.isArray(data) ? data : null);
        if (channels) {
          setSystemState((prev) => ({
            ...prev,
            channels,
          }));
        }
      }
    } catch (err) {
      console.error('Failed to toggle communication channel:', err);
    }
  };

  // Broadcast Emergency Alert
  const handleBroadcastAlert = async (
    title: string,
    message: string,
    zones: string[],
    severity: AlertNotification['severity']
  ) => {
    const token = localStorage.getItem('glacierguard_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/alerts/broadcast', {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, message, affectedZones: zones, severity }),
    });

    if (res.ok) {
      const newAlert = await res.json();
      setSystemState((prev) => ({
        ...prev,
        activeAlerts: [newAlert, ...prev.activeAlerts],
      }));
    }
  };

  // Generate Actionable Advisory via Gemini AI
  const handleGenerateAIAdvisory = async (targetZone: string, leadTimeMinutes: number): Promise<string> => {
    const res = await fetch('/api/ai/warning-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hazardType: systemState.hazardClassification.hazardType,
        targetZone,
        leadTimeMinutes,
        safeZone: targetZone === 'Zone A' ? 'Chungthang Upper Ridge Helipad' : 'High Ground Refuge',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.message;
    }
    return `EXTREME HAZARD DETECTED: High-velocity glacial surge advancing toward ${targetZone} in ~${leadTimeMinutes} minutes. Evacuate to high ground immediately!`;
  };

  // Auth Operations
  const handleLogin = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('glacierguard_token', data.token);
    setCurrentUser(data.user);
  };

  const handleRegister = async (email: string, pass: string, name: string, role: UserRole, agency?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name, role, agency }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('glacierguard_token', data.token);
    setCurrentUser(data.user);
  };

  const handleQuickLogin = async (role: UserRole) => {
    const emailMap: Record<UserRole, string> = {
      commander: 'commander@glacierguard.gov',
      hydrologist: 'ananya.sen@wihg.res.in',
      field_engineer: 'tashi.ops@glacierguard.org',
      public: 'pema.singtam@community.gov',
    };
    await handleLogin(emailMap[role], 'GlacierGuard2026!');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('glacierguard_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('glacierguard_token');
    setCurrentUser(null);
  };

  const currentRisk = systemState?.currentRiskScore ?? 12;
  const safeTelemetry = systemState?.telemetry ?? INITIAL_STATE.telemetry;
  const safeClassification = systemState?.hazardClassification ?? INITIAL_STATE.hazardClassification;
  const safeDebris = systemState?.debrisAssessment ?? INITIAL_STATE.debrisAssessment;
  const safeZones = systemState?.zones && systemState.zones.length > 0 ? systemState.zones : INITIAL_STATE.zones;
  const safeNodes = systemState?.nodes && systemState.nodes.length > 0 ? systemState.nodes : INITIAL_STATE.nodes;
  const safeChannels = systemState?.channels && systemState.channels.length > 0 ? systemState.channels : INITIAL_STATE.channels;
  const safeRoutes = systemState?.routes && systemState.routes.length > 0 ? systemState.routes : INITIAL_STATE.routes;
  const safeAlerts = systemState?.activeAlerts ?? INITIAL_STATE.activeAlerts;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        systemState={systemState}
        currentRiskScore={currentRisk}
        hazardType={safeClassification.hazardType}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        sirenActive={sirenActive}
        onToggleSiren={handleToggleSiren}
        onToggleMute={handleToggleSiren}
        onQuickSwitchRole={handleQuickLogin}
        onResetToSafe={handleReset}
      />

      {/* Live Demo Controller (Section 21 Hackathon Script) */}
      <LiveDemoBar
        systemState={systemState}
        onTriggerDemoStep={handleTriggerDemoStep}
        onReset={handleReset}
        onSelectTab={(tab) => setActiveTab(tab as TabType)}
      />

      {/* 6-Stage Workflow Navigation Tabs */}
      <WorkflowSteps
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentRiskScore={currentRisk}
      />

      {/* Main Active View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'monitor' && (
          <MonitorView
            telemetry={safeTelemetry}
            nodes={safeNodes}
            onUpdateSensor={handleUpdateSensor}
          />
        )}

        {(activeTab === 'detect' || activeTab === 'classify') && (
          <DetectClassifyView
            classification={safeClassification}
            telemetry={safeTelemetry}
            onReanalyzeWithAI={handleReanalyzeWithAI}
            isLoadingAI={isLoadingAI}
          />
        )}

        {activeTab === 'predict' && (
          <DebrisPredictView
            debrisAssessment={safeDebris}
            zones={safeZones}
            onRecalculateDebris={handleRecalculateDebris}
          />
        )}

        {activeTab === 'map' && (
          <ImpactMapView
            zones={safeZones}
            nodes={safeNodes}
            currentRiskScore={currentRisk}
            debrisSeverity={safeDebris.severityLevel}
          />
        )}

        {(activeTab === 'warn' || activeTab === 'evacuate') && (
          <WarnEvacuateView
            alerts={safeAlerts}
            channels={safeChannels}
            routes={safeRoutes}
            zones={safeZones}
            currentUser={currentUser}
            sirenActive={sirenActive}
            onToggleSiren={handleToggleSiren}
            onToggleChannelFailure={handleToggleChannelFailure}
            onBroadcastAlert={handleBroadcastAlert}
            onGenerateAIAdvisory={handleGenerateAIAdvisory}
          />
        )}

        {activeTab === 'satellite' && <SatelliteView />}
      </main>

      {/* Bottom Global Status Bar */}
      <footer className="bg-slate-900 border-t border-slate-800/90 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-mono">
              <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span>{sseConnected ? 'SSE Live Stream Active' : 'Connecting to Stream...'}</span>
            </span>
            <span className="text-slate-700">|</span>
            <span>South Lhonak Glacial Lake (5,200m ASL)</span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="hidden md:inline">Teesta River Basin</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Risk Level:{' '}
              <strong className={currentRisk >= 80 ? 'text-rose-400' : currentRisk >= 40 ? 'text-amber-400' : 'text-emerald-400'}>
                {currentRisk}/100
              </strong>
            </span>
            <span>
              Debris Severity: <strong className="text-cyan-400">{systemState?.debrisAssessment?.severityLevel ?? 'LOW'}</strong>
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-500 font-mono hidden sm:inline">
              GlacierGuard AI v1.0 • NDMA & Sikkim SDMA
            </span>
          </div>
        </div>
      </footer>

      {/* Secure Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onQuickLogin={handleQuickLogin}
      />
    </div>
  );
}
