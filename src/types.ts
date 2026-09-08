/**
 * Core type definitions for GLACIERGUARD AI
 */

export type UserRole = 'commander' | 'hydrologist' | 'field_engineer' | 'public';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  assignedZone?: 'Zone A' | 'Zone B' | 'Zone C' | 'All';
}

export type HazardType =
  | 'A. Glacier / Ice Collapse'
  | 'B. Landslide Entering Glacial Lake'
  | 'C. Glacial Lake Outburst Flood (GLOF)'
  | 'D. Ice / Debris Flow'
  | 'E. Combined Multi-Hazard Event'
  | 'Normal / No Hazard';

export type DebrisSeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface DebrisFlowAssessment {
  severityLevel: DebrisSeverityLevel;
  score: number; // 0 - 100
  dominantComposition: string; // e.g. "Water + Large Debris / Rock / Ice"
  solidFractionPercent: number; // e.g. 58%
  waterVolumeMillionM3: number; // e.g. 18.5 M m3
  estimatedPeakDischargeM3s: number; // e.g. 4,800 m3/s
  averageSlopeDegrees: number; // e.g. 18.4°
  description: string;
}

export interface SensorTelemetry {
  timestamp: string;
  lakeWaterLevelMeters: number; // e.g. 34.2 m
  lakeRateOfRiseMetersPerHour: number; // e.g. +1.8 m/hr
  seismicMagnitudeRichter: number; // e.g. 3.4
  seismicVibrationRMS: number; // e.g. 0.45 g
  glacierDisplacementMmDay: number; // e.g. 180 mm/day
  ambientTemperatureCelsius: number; // e.g. 4.2 °C
  precipitationMmPerHour: number; // e.g. 24 mm/hr
  freezingLevelMeters: number; // e.g. 4,900 m
  riverStageMeters: number; // e.g. 6.8 m
  riverDischargeM3s: number; // e.g. 320 m3/s
  cameraDebrisDetected: boolean;
  cameraCalvingDetected: boolean;
}

export interface ESP32NodeStatus {
  nodeId: string;
  location: string;
  batteryPercent: number;
  solarInputWatts: number;
  loraSignalRssi: number;
  cellularActive: boolean;
  satelliteFallbackReady: boolean;
  status: 'ONLINE' | 'TRANSMITTING' | 'DEGRADED' | 'OFFLINE';
  lastPing: string;
}

export interface HazardZoneImpact {
  zoneId: 'Zone A' | 'Zone B' | 'Zone C';
  name: string;
  location: string;
  elevationMeters: number;
  distanceFromSourceKm: number;
  estimatedTimeToImpactMinutes: number; // e.g. 18
  uncertaintyMinutes: number; // e.g. 3
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  projectedFlowDepthMeters: number;
  populationAtRisk: number;
  keyInfrastructure: string[];
  safeZoneName: string;
  evacuationRouteName: string;
  evacuationStatus: 'MONITORING' | 'PREPARE' | 'MANDATORY_EVACUATION' | 'ALL_CLEAR';
}

export interface EvacuationRoute {
  id: string;
  name: string;
  destinationSafeZone: string;
  safeZoneElevation: number;
  capacityPeople: number;
  currentOccupancy: number;
  status: 'CLEAR' | 'CONGESTED' | 'HIGH_RISK_FLOOD_PATH' | 'CLOSED';
  distanceKm: number;
  estimatedWalkTimeMinutes: number;
  isRecommended: boolean;
  notes: string;
}

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'cellular' | 'sms' | 'siren' | 'vhf_radio' | 'edge_gateway' | 'satellite';
  status: 'OPERATIONAL' | 'OFFLINE' | 'DEGRADED';
  coveragePercent: number;
  lastTestTime: string;
  isSimulatedFailure?: boolean;
}

export interface AIClassificationResult {
  hazardType: HazardType;
  confidencePercent: number;
  riskScore: number; // 0 - 100
  riskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  sourcePrecursor: string;
  triggerChainSummary: string;
  recommendedAction: string;
  reasoning: string;
  isAiGenerated: boolean;
  timestamp: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EXTREME';
  title: string;
  message: string;
  affectedZones: string[];
  targetAction: string;
  broadcastChannels: string[];
  acknowledgedBy?: string;
  sirenActive: boolean;
}

export interface LiveSystemState {
  currentRiskScore: number; // 0 - 100
  riskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  hazardClassification: AIClassificationResult;
  debrisAssessment: DebrisFlowAssessment;
  telemetry: SensorTelemetry;
  zones: HazardZoneImpact[];
  routes: EvacuationRoute[];
  channels: CommunicationChannel[];
  nodes: ESP32NodeStatus[];
  activeAlerts: AlertNotification[];
  sirenActive: boolean;
  scenarioRunning: boolean;
  currentScenario: string;
}
