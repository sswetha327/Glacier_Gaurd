import {
  LiveSystemState,
  SensorTelemetry,
  DebrisFlowAssessment,
  HazardZoneImpact,
  EvacuationRoute,
  CommunicationChannel,
  ESP32NodeStatus,
  AlertNotification,
  AIClassificationResult,
} from '../src/types';
import { calculateFallbackClassification, classifyHazardEventWithGemini, generateActionableWarningMessage } from './geminiAi';
import type { Response } from 'express';

// SSE client responses
const sseClients: Set<Response> = new Set();

export function addSseClient(res: Response): void {
  sseClients.add(res);
  res.on('close', () => {
    sseClients.delete(res);
  });
}

export function broadcastSse(eventType: string, data: unknown): void {
  const namedPayload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  const genericPayload = `data: ${JSON.stringify({ type: eventType.toUpperCase(), payload: data, data })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(namedPayload);
      client.write(genericPayload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Initial SAFE baseline state
const defaultTelemetry: SensorTelemetry = {
  timestamp: new Date().toISOString(),
  lakeWaterLevelMeters: 32.4,
  lakeRateOfRiseMetersPerHour: 0.04,
  seismicMagnitudeRichter: 0.8,
  seismicVibrationRMS: 0.05,
  glacierDisplacementMmDay: 18,
  ambientTemperatureCelsius: 1.8,
  precipitationMmPerHour: 2.1,
  freezingLevelMeters: 4200,
  riverStageMeters: 2.9,
  riverDischargeM3s: 180,
  cameraDebrisDetected: false,
  cameraCalvingDetected: false,
};

const defaultDebrisAssessment: DebrisFlowAssessment = {
  severityLevel: 'LOW',
  score: 18,
  dominantComposition: 'Water-dominant flow (<15% solid clasts)',
  solidFractionPercent: 12,
  waterVolumeMillionM3: 4.5,
  estimatedPeakDischargeM3s: 350,
  averageSlopeDegrees: 18.2,
  description: 'Clean meltwater channel flow with natural bedload friction and no catastrophic debris entrainment.',
};

const defaultZones: HazardZoneImpact[] = [
  {
    zoneId: 'Zone A',
    name: 'Chungthang Valley & Hydro Dam',
    location: 'Upper Teesta Basin, Sikkim',
    elevationMeters: 1790,
    distanceFromSourceKm: 24.2,
    estimatedTimeToImpactMinutes: 18,
    uncertaintyMinutes: 2,
    riskLevel: 'LOW',
    projectedFlowDepthMeters: 1.8,
    populationAtRisk: 3400,
    keyInfrastructure: ['Teesta Stage III Hydro Dam', 'Chungthang Main Suspension Bridge', 'ITBP Cantonment'],
    safeZoneName: 'Chungthang Upper Ridge Helipad (Safe Zone A-1)',
    evacuationRouteName: 'Route Alpha: High Ridge Bypass (Elev 2,150m)',
    evacuationStatus: 'MONITORING',
  },
  {
    zoneId: 'Zone B',
    name: 'Dikchu Hydropower & Township',
    location: 'Middle Teesta Basin, Sikkim',
    elevationMeters: 650,
    distanceFromSourceKm: 48.6,
    estimatedTimeToImpactMinutes: 32,
    uncertaintyMinutes: 4,
    riskLevel: 'LOW',
    projectedFlowDepthMeters: 1.2,
    populationAtRisk: 6800,
    keyInfrastructure: ['Dikchu Powerhouse & Switchyard', 'National Highway 10 Viaduct', 'Sub-divisional Hospital'],
    safeZoneName: 'Dikchu Monastery High Terrace (Safe Zone B-2)',
    evacuationRouteName: 'Route Beta: North Ridge Forest Track (Elev 1,020m)',
    evacuationStatus: 'MONITORING',
  },
  {
    zoneId: 'Zone C',
    name: 'Singtam & Rangpo Settlements',
    location: 'Lower Teesta Floodplain, Sikkim',
    elevationMeters: 350,
    distanceFromSourceKm: 72.4,
    estimatedTimeToImpactMinutes: 51,
    uncertaintyMinutes: 6,
    riskLevel: 'LOW',
    projectedFlowDepthMeters: 0.8,
    populationAtRisk: 18500,
    keyInfrastructure: ['Singtam Footbridge & Market', 'Riverbank Residential Sector', 'District Supply Depot'],
    safeZoneName: 'Government College Stadium High Ground (Safe Zone C-1)',
    evacuationRouteName: 'Route Gamma: Bypass Elevated Corridor',
    evacuationStatus: 'MONITORING',
  },
];

const defaultRoutes: EvacuationRoute[] = [
  {
    id: 'rte_a1',
    name: 'Route Alpha: High Ridge Bypass',
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
];

const defaultChannels: CommunicationChannel[] = [
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
];

const defaultNodes: ESP32NodeStatus[] = [
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
    nodeId: 'ESP32-RIVR-04',
    location: 'Chungthang Confluence Bridge (1,790m)',
    batteryPercent: 99,
    solarInputWatts: 18.5,
    loraSignalRssi: -54,
    cellularActive: true,
    satelliteFallbackReady: true,
    status: 'ONLINE',
    lastPing: '2s ago',
  },
];

class GlacierStateManager {
  private state: LiveSystemState;

  constructor() {
    this.state = {
      currentRiskScore: 12,
      riskBand: 'LOW',
      hazardClassification: calculateFallbackClassification(defaultTelemetry),
      debrisAssessment: defaultDebrisAssessment,
      telemetry: { ...defaultTelemetry },
      zones: JSON.parse(JSON.stringify(defaultZones)),
      routes: JSON.parse(JSON.stringify(defaultRoutes)),
      channels: JSON.parse(JSON.stringify(defaultChannels)),
      nodes: JSON.parse(JSON.stringify(defaultNodes)),
      activeAlerts: [],
      sirenActive: false,
      scenarioRunning: false,
      currentScenario: 'Normal Surveillance Baseline',
    };
  }

  public getState(): LiveSystemState {
    return this.state;
  }

  public resetToSafe(): LiveSystemState {
    this.state.telemetry = { ...defaultTelemetry, timestamp: new Date().toISOString() };
    this.state.currentRiskScore = 12;
    this.state.riskBand = 'LOW';
    this.state.hazardClassification = calculateFallbackClassification(this.state.telemetry);
    this.state.debrisAssessment = { ...defaultDebrisAssessment };
    this.state.zones = JSON.parse(JSON.stringify(defaultZones));
    this.state.routes = JSON.parse(JSON.stringify(defaultRoutes));
    this.state.channels = JSON.parse(JSON.stringify(defaultChannels));
    this.state.sirenActive = false;
    this.state.scenarioRunning = false;
    this.state.currentScenario = 'Normal Surveillance Baseline';
    this.state.activeAlerts = [];

    broadcastSse('state_update', this.state);
    return this.state;
  }

  /**
   * Calculate Debris Flow Severity Index (DFSI)
   * Formula incorporates:
   * - Estimated water volume (M m³)
   * - Sediment/debris level (% solid concentration)
   * - Terrain slope (degrees)
   * - Flow velocity (m/s)
   * - Peak discharge (m³/s)
   */
  public calculateDebrisIndex(params: {
    waterVolumeMillionM3: number;
    solidFractionPercent: number;
    averageSlopeDegrees: number;
    peakDischargeM3s: number;
  }): DebrisFlowAssessment {
    const { waterVolumeMillionM3, solidFractionPercent, averageSlopeDegrees, peakDischargeM3s } = params;

    // Normalizing factors
    const volScore = Math.min(30, (waterVolumeMillionM3 / 25) * 30);
    const solidScore = Math.min(35, (solidFractionPercent / 70) * 35);
    const slopeScore = Math.min(20, (averageSlopeDegrees / 35) * 20);
    const dischargeScore = Math.min(15, (peakDischargeM3s / 6000) * 15);

    const totalScore = Math.min(100, Math.round(volScore + solidScore + slopeScore + dischargeScore));

    let severityLevel: DebrisFlowAssessment['severityLevel'] = 'LOW';
    let dominantComposition = 'Water-dominant flow (<20% solid fraction)';
    let description = 'Flow velocity dominated by water friction. Minimal large boulder or ice block transport.';

    if (totalScore >= 75 || solidFractionPercent >= 55) {
      severityLevel = 'EXTREME';
      dominantComposition = 'Water + Large Boulders / Rock Avalanche / Ice Slurry (>55% solids)';
      description =
        'Catastrophic hyperconcentrated debris flow. Carries massive boulders (>3m), fractured serac ice blocks, and pulverized bedrock. Highly erosive and pulverizing downstream impact!';
    } else if (totalScore >= 50 || solidFractionPercent >= 35) {
      severityLevel = 'HIGH';
      dominantComposition = 'Heavy Sediment / Coarse Gravel / Moraine Till (35-55% solids)';
      description =
        'High-density debris surge capable of gouging riverbanks, destroying bridge piers, and damming narrow gorge bottlenecks.';
    } else if (totalScore >= 25 || solidFractionPercent >= 20) {
      severityLevel = 'MODERATE';
      dominantComposition = 'Water + Suspended Sand / Fine Sediment Slurry (20-35% solids)';
      description =
        'Sediment-laden floodwave. Increased density causes elevated dynamic thrust against riverbank embankments.';
    }

    const assessment: DebrisFlowAssessment = {
      severityLevel,
      score: totalScore,
      dominantComposition,
      solidFractionPercent,
      waterVolumeMillionM3,
      estimatedPeakDischargeM3s: peakDischargeM3s,
      averageSlopeDegrees,
      description,
    };

    this.state.debrisAssessment = assessment;
    return assessment;
  }

  /**
   * Updates state from incoming ESP32 sensor ingestion or simulation trigger
   */
  public async ingestTelemetry(partial: Partial<SensorTelemetry>, scenarioName?: string): Promise<LiveSystemState> {
    const updatedTelemetry: SensorTelemetry = {
      ...this.state.telemetry,
      ...partial,
      timestamp: new Date().toISOString(),
    };

    // If rate of rise is changed and river discharge wasn't explicitly provided, proportionately scale downstream hydrology
    if (partial.lakeRateOfRiseMetersPerHour !== undefined && partial.riverDischargeM3s === undefined) {
      const rate = partial.lakeRateOfRiseMetersPerHour;
      if (rate >= 2.0) {
        updatedTelemetry.riverDischargeM3s = Math.round(180 + rate * 1400);
        updatedTelemetry.riverStageMeters = Number((2.9 + rate * 2.2).toFixed(1));
      } else if (rate >= 0.8) {
        updatedTelemetry.riverDischargeM3s = Math.round(180 + rate * 800);
        updatedTelemetry.riverStageMeters = Number((2.9 + rate * 1.5).toFixed(1));
      } else if (rate >= 0.2) {
        updatedTelemetry.riverDischargeM3s = Math.round(180 + rate * 400);
        updatedTelemetry.riverStageMeters = Number((2.9 + rate * 0.8).toFixed(1));
      } else {
        updatedTelemetry.riverDischargeM3s = 180;
        updatedTelemetry.riverStageMeters = 2.9;
      }
    }

    this.state.telemetry = updatedTelemetry;

    if (scenarioName) {
      this.state.currentScenario = scenarioName;
      this.state.scenarioRunning = true;
    }

    // Immediately compute high-precision glaciological classification for sub-millisecond response
    const immediateClassification = calculateFallbackClassification(this.state.telemetry);
    this.state.hazardClassification = immediateClassification;
    this.state.currentRiskScore = immediateClassification.riskScore;
    this.state.riskBand = immediateClassification.riskBand;

    // Recalculate Debris Flow Severity Index
    const estimatedWaterVol = this.state.telemetry.lakeWaterLevelMeters > 38
      ? 24.5
      : this.state.telemetry.lakeWaterLevelMeters > 35
      ? 16.2
      : 5.1;

    const solidFraction =
      immediateClassification.hazardType.includes('Combined') || immediateClassification.hazardType.includes('Debris')
        ? 62
        : immediateClassification.hazardType.includes('Landslide')
        ? 48
        : immediateClassification.hazardType.includes('GLOF')
        ? 38
        : 14;

    const debris = this.calculateDebrisIndex({
      waterVolumeMillionM3: estimatedWaterVol,
      solidFractionPercent: solidFraction,
      averageSlopeDegrees: 21.4,
      peakDischargeM3s: Math.max(250, this.state.telemetry.riverDischargeM3s),
    });

    // Update zone impact calculations dynamically based on risk score & debris severity
    const isCritical = this.state.currentRiskScore >= 80;
    const isHigh = this.state.currentRiskScore >= 60;
    const isModerate = this.state.currentRiskScore >= 30;

    this.state.zones[0].riskLevel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isModerate ? 'MODERATE' : 'LOW';
    this.state.zones[0].projectedFlowDepthMeters = isCritical ? 9.6 : isHigh ? 5.8 : isModerate ? 2.8 : 1.8;
    this.state.zones[0].evacuationStatus = isCritical ? 'MANDATORY_EVACUATION' : isHigh ? 'PREPARE' : 'MONITORING';
    this.state.zones[0].estimatedTimeToImpactMinutes = isCritical ? 18 : 22;

    this.state.zones[1].riskLevel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isModerate ? 'MODERATE' : 'LOW';
    this.state.zones[1].projectedFlowDepthMeters = isCritical ? 6.4 : isHigh ? 3.9 : isModerate ? 2.1 : 1.2;
    this.state.zones[1].evacuationStatus = isCritical ? 'MANDATORY_EVACUATION' : isHigh ? 'PREPARE' : 'MONITORING';
    this.state.zones[1].estimatedTimeToImpactMinutes = isCritical ? 32 : 38;

    this.state.zones[2].riskLevel = isCritical ? 'HIGH' : isHigh ? 'MODERATE' : 'LOW';
    this.state.zones[2].projectedFlowDepthMeters = isCritical ? 4.2 : isHigh ? 2.5 : 0.8;
    this.state.zones[2].evacuationStatus = isCritical ? 'PREPARE' : 'MONITORING';
    this.state.zones[2].estimatedTimeToImpactMinutes = isCritical ? 51 : 60;

    // Trigger siren if critical
    if (isCritical && !this.state.sirenActive) {
      this.state.sirenActive = true;
    } else if (!isCritical && !isHigh && this.state.sirenActive && !scenarioName?.includes('Step')) {
      // Auto-silence siren if returned to safe/moderate unless locked by simulation step
      this.state.sirenActive = false;
    }

    // Auto-generate notification if transitioning to Critical
    if (isCritical && this.state.activeAlerts.length === 0) {
      const alert: AlertNotification = {
        id: 'alt_' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        severity: 'EXTREME',
        title: `EMERGENCY GLOF & DEBRIS ALERT: ${immediateClassification.hazardType}`,
        message: `EXTREME HAZARD DETECTED at South Lhonak Glacial Lake. Peak discharge ~${debris.estimatedPeakDischargeM3s} m³/s with ${debris.severityLevel} debris flow. Chungthang impact in ~18 mins! Mandatory evacuation initiated.`,
        affectedZones: ['Zone A', 'Zone B', 'Zone C'],
        targetAction: 'EVACUATE TO HIGH GROUND (ROUTE ALPHA / BETA)',
        broadcastChannels: ['Acoustic Siren 130dB', 'Cellular Emergency Push', 'LoRa Mesh Beacons', 'VHF Radio', 'Priority SMS 112'],
        sirenActive: true,
      };
      this.state.activeAlerts.unshift(alert);
    }

    broadcastSse('state_update', this.state);
    return this.state;
  }

  /**
   * Toggle communication channel failure to showcase multi-channel resilience & siren fallback
   */
  public toggleChannelFailure(channelId: string): CommunicationChannel[] {
    const channel = this.state.channels.find((c) => c.id === channelId);
    if (channel) {
      channel.isSimulatedFailure = !channel.isSimulatedFailure;
      channel.status = channel.isSimulatedFailure ? 'OFFLINE' : 'OPERATIONAL';

      // If cellular is disabled during an active alert, activate decentralized fallback siren & LoRa edge gateway
      if (channelId === 'com_cellular' && channel.isSimulatedFailure) {
        const siren = this.state.channels.find((c) => c.id === 'com_siren');
        const edge = this.state.channels.find((c) => c.id === 'com_mesh');
        if (siren) siren.status = 'OPERATIONAL';
        if (edge) edge.status = 'OPERATIONAL';

        this.state.activeAlerts.unshift({
          id: 'alt_fail_' + Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          severity: 'WARNING',
          title: 'COMMUNICATION RESILIENCE TRIGGERED',
          message:
            'Cellular backbone link severed or obstructed. Automatic failover activated: Local Valley Sirens (130dB) and ESP32 LoRa Edge Mesh Gateways are broadcasting autonomous acoustic and beacon alerts.',
          affectedZones: ['Zone A', 'Zone B'],
          targetAction: 'RELY ON LOCAL SIREN BEACONS & VHF RADIO CHANNELS',
          broadcastChannels: ['Local Acoustic Siren', 'ESP32 LoRa Mesh', 'Satellite Uplink'],
          sirenActive: true,
        });
      }

      broadcastSse('state_update', this.state);
    }
    return this.state.channels;
  }

  public toggleSiren(forceState?: boolean): boolean {
    this.state.sirenActive = forceState !== undefined ? forceState : !this.state.sirenActive;
    broadcastSse('siren_toggle', { sirenActive: this.state.sirenActive });
    broadcastSse('state_update', this.state);
    return this.state.sirenActive;
  }

  public async broadcastCommanderAlert(
    title: string,
    message: string,
    zones: string[],
    severity: AlertNotification['severity']
  ): Promise<AlertNotification> {
    const newAlert: AlertNotification = {
      id: 'alt_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      severity,
      title,
      message,
      affectedZones: zones,
      targetAction: 'PROCEED TO HIGH GROUND SHELTERS IMMEDIATELY',
      broadcastChannels: this.state.channels.filter((c) => c.status === 'OPERATIONAL').map((c) => c.name),
      sirenActive: severity === 'EXTREME' || severity === 'CRITICAL',
    };

    if (newAlert.sirenActive) {
      this.state.sirenActive = true;
    }

    this.state.activeAlerts.unshift(newAlert);
    broadcastSse('new_alert', newAlert);
    broadcastSse('state_update', this.state);
    return newAlert;
  }
}

export const glacierManager = new GlacierStateManager();
