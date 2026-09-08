import { GoogleGenAI, Type } from '@google/genai';
import { AIClassificationResult, SensorTelemetry, HazardType } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Fallback expert decision matrix based on GLOF science & South Lhonak case study
 */
export function calculateFallbackClassification(telemetry: SensorTelemetry): AIClassificationResult {
  let hazardType: HazardType = 'Normal / No Hazard';
  let score = 12;
  let confidence = 96;
  let precursor = 'Normal seasonal baseline ablation and meltwater discharge.';
  let chain = 'All upstream seismic, acoustic, optical, and lake-stage indicators are within safe thresholds.';
  let action = 'Maintain standard continuous 24/7 telemetry monitoring.';
  let reasoning = 'No anomalous ground vibration (>1.2 Richter) or rapid lake level surge (>0.3 m/hr) observed.';

  const isHighSeismic = telemetry.seismicMagnitudeRichter >= 2.5 || telemetry.seismicVibrationRMS >= 0.35;
  const isSurgingLake = telemetry.lakeRateOfRiseMetersPerHour >= 0.8 || telemetry.lakeWaterLevelMeters >= 40.0;
  const isGlacierMovingFast = telemetry.glacierDisplacementMmDay >= 120;
  const isDebrisObserved = telemetry.cameraDebrisDetected || telemetry.cameraCalvingDetected;

  if (isHighSeismic && isSurgingLake && isDebrisObserved) {
    hazardType = 'E. Combined Multi-Hazard Event';
    score = 94;
    confidence = 92;
    precursor = 'Large-scale lateral moraine failure coupled with serac ice calving directly into the proglacial lake.';
    chain = 'Pre-event slope destabilization → Massive ice/rock displacement into lake → Displacement surge wave → Catastrophic moraine breach GLOF.';
    action = 'IMMEDIATE RED ALERT: Activate valley-wide siren network, halt downstream hydropower turbines, and order mandatory evacuation to safe zones!';
    reasoning = `Multi-sensor telemetry confirmed synchronous seismic spike (${telemetry.seismicMagnitudeRichter.toFixed(1)} Richter), extreme lake rate of rise (+${telemetry.lakeRateOfRiseMetersPerHour.toFixed(1)} m/hr), and optical detection of calving mass.`;
  } else if (isSurgingLake && isDebrisObserved) {
    hazardType = 'C. Glacial Lake Outburst Flood (GLOF)';
    score = 86;
    confidence = 90;
    precursor = 'Rapid moraine dam breach or subglacial drainage tunnel collapse.';
    chain = 'Internal piping or hydrostatic pressure exceeding moraine shear strength → Moraine breach → High-velocity outburst.';
    action = 'HIGH ALERT: Evacuate Zone A immediately and alert Zone B/C response personnel.';
    reasoning = `Lake water level rapidly fluctuating with heavy discharge rise to ${telemetry.riverDischargeM3s} m³/s.`;
  } else if (isHighSeismic && isDebrisObserved && !isSurgingLake) {
    hazardType = 'B. Landslide Entering Glacial Lake';
    score = 75;
    confidence = 88;
    precursor = 'Steep lateral moraine/bedrock slope failure along the glacier flank.';
    chain = 'Ground instability trigger → Landslide mass entering lake basin → Threat of seiche/impulse wave overtopping moraine.';
    action = 'ORANGE WARNING: Prepare immediate evacuation routes in Zone A. Continuous visual/seismic tracking.';
    reasoning = `High seismic acceleration (${telemetry.seismicVibrationRMS.toFixed(2)}g) alongside optical detection of mass slope movement.`;
  } else if (isGlacierMovingFast && telemetry.cameraCalvingDetected) {
    hazardType = 'A. Glacier / Ice Collapse';
    score = 62;
    confidence = 85;
    precursor = 'Hanging glacier / ice tongue detachment due to thermal degradation.';
    chain = 'Thermal warming (Freezing line ${telemetry.freezingLevelMeters}m) → Basal lubricated slide → Serac toppling.';
    action = 'YELLOW ADVISORY: Restrict high-altitude grazing and riverbed civil works.';
    reasoning = `Glacier velocity accelerated to ${telemetry.glacierDisplacementMmDay} mm/day under elevated temperatures.`;
  } else if (telemetry.riverDischargeM3s >= 1200 || (isDebrisObserved && telemetry.riverStageMeters >= 9)) {
    hazardType = 'D. Ice / Debris Flow';
    score = 79;
    confidence = 87;
    precursor = 'Intense headwater erosion mobilizing glacial till and permafrost debris.';
    chain = 'Heavy rainfall (${telemetry.precipitationMmPerHour} mm/hr) + meltwater → Channel scouring → Dense granular debris surge.';
    action = 'HIGH ALERT: Clear all river bridges and low-lying highway corridors.';
    reasoning = `Downstream river stage reached ${telemetry.riverStageMeters.toFixed(1)}m with heavy bedload transport.`;
  }

  const riskBand = score >= 81 ? 'CRITICAL' : score >= 61 ? 'HIGH' : score >= 31 ? 'MODERATE' : 'LOW';

  return {
    hazardType,
    confidencePercent: confidence,
    riskScore: score,
    riskBand,
    sourcePrecursor: precursor,
    triggerChainSummary: chain,
    recommendedAction: action,
    reasoning,
    isAiGenerated: false,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Classify event with Gemini 3.8 Flash using structured JSON output schema
 */
export async function classifyHazardEventWithGemini(
  telemetry: SensorTelemetry,
  caseStudyContext: string = 'South Lhonak / High Mountain Asia GLOF monitoring'
): Promise<AIClassificationResult> {
  const ai = getGenAI();
  if (!ai) {
    return calculateFallbackClassification(telemetry);
  }

  try {
    const prompt = `You are GLACIERGUARD AI, an expert glaciologist and geotechnical AI early warning intelligence system.
Analyze the following multi-sensor telemetry from high-altitude glacier and glacial lake monitoring stations (${caseStudyContext}).

TELEMETRY READINGS:
- Lake Water Level: ${telemetry.lakeWaterLevelMeters.toFixed(1)} meters
- Lake Rate of Rise: ${telemetry.lakeRateOfRiseMetersPerHour.toFixed(2)} m/hr
- Seismic Magnitude: ${telemetry.seismicMagnitudeRichter.toFixed(1)} Richter
- Ground Vibration RMS: ${telemetry.seismicVibrationRMS.toFixed(2)} g
- Glacier Surface Velocity: ${telemetry.glacierDisplacementMmDay.toFixed(0)} mm/day
- Ambient Air Temp: ${telemetry.ambientTemperatureCelsius.toFixed(1)} °C
- Precipitation Rate: ${telemetry.precipitationMmPerHour.toFixed(1)} mm/hr
- 0°C Freezing Isotherm: ${telemetry.freezingLevelMeters.toFixed(0)} m ASL
- Downstream River Stage: ${telemetry.riverStageMeters.toFixed(1)} m
- Downstream River Discharge: ${telemetry.riverDischargeM3s.toFixed(0)} m³/s
- Optical Camera Status: Debris Movement Detected=${telemetry.cameraDebrisDetected}, Serac Calving Detected=${telemetry.cameraCalvingDetected}

Classify the hazard into one of the 5 canonical types:
A. Glacier / Ice Collapse
B. Landslide Entering Glacial Lake
C. Glacial Lake Outburst Flood (GLOF)
D. Ice / Debris Flow
E. Combined Multi-Hazard Event
(Or "Normal / No Hazard" if all sensors are within safe baseline limits).

Explain:
1. What happened upstream? (Precursor and mechanism)
2. Trigger chain summary (e.g. slope failure -> lake impact -> breach -> downstream surge)
3. Confidence percent (0-100)
4. Aggregate risk score (0-100)
5. Actionable emergency evacuation recommendation for civil authorities.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hazardType: {
              type: Type.STRING,
              description: 'Must be one of the 5 canonical hazard types or Normal',
            },
            confidencePercent: {
              type: Type.NUMBER,
              description: 'Confidence score from 0 to 100',
            },
            riskScore: {
              type: Type.NUMBER,
              description: 'Composite hazard risk score from 0 to 100',
            },
            riskBand: {
              type: Type.STRING,
              description: 'LOW, MODERATE, HIGH, or CRITICAL',
            },
            sourcePrecursor: {
              type: Type.STRING,
              description: 'Summary of what happened upstream at the source',
            },
            triggerChainSummary: {
              type: Type.STRING,
              description: 'Step-by-step cascade chain',
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Actionable instructions for civil defense & public',
            },
            reasoning: {
              type: Type.STRING,
              description: 'Scientific synthesis connecting multi-sensor parameters',
            },
          },
          required: [
            'hazardType',
            'confidencePercent',
            'riskScore',
            'riskBand',
            'sourcePrecursor',
            'triggerChainSummary',
            'recommendedAction',
            'reasoning',
          ],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 3500)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const parsed = JSON.parse(response.text || '{}');
    let hazardType: HazardType = parsed.hazardType || 'Normal / No Hazard';
    if (!hazardType.includes('.')) {
      if (hazardType.toLowerCase().includes('combined')) hazardType = 'E. Combined Multi-Hazard Event';
      else if (hazardType.toLowerCase().includes('outburst') || hazardType.toLowerCase().includes('glof')) hazardType = 'C. Glacial Lake Outburst Flood (GLOF)';
      else if (hazardType.toLowerCase().includes('landslide')) hazardType = 'B. Landslide Entering Glacial Lake';
      else if (hazardType.toLowerCase().includes('ice collapse')) hazardType = 'A. Glacier / Ice Collapse';
      else if (hazardType.toLowerCase().includes('debris')) hazardType = 'D. Ice / Debris Flow';
      else hazardType = 'Normal / No Hazard';
    }

    const score = Math.max(0, Math.min(100, Math.round(parsed.riskScore || 15)));
    const riskBand = score >= 81 ? 'CRITICAL' : score >= 61 ? 'HIGH' : score >= 31 ? 'MODERATE' : 'LOW';

    return {
      hazardType,
      confidencePercent: Math.max(50, Math.min(99, Math.round(parsed.confidencePercent || 90))),
      riskScore: score,
      riskBand,
      sourcePrecursor: parsed.sourcePrecursor || 'Glacier lake baseline state.',
      triggerChainSummary: parsed.triggerChainSummary || 'Nominal hydro-meteorological conditions.',
      recommendedAction: parsed.recommendedAction || 'Continue routine sensor surveillance.',
      reasoning: parsed.reasoning || 'Sensors within allowable standard deviations.',
      isAiGenerated: true,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Gemini classification fallback triggered:', err);
    return calculateFallbackClassification(telemetry);
  }
}

/**
 * Generate broadcast-ready public warning copy tailored to zone & lead time
 */
export async function generateActionableWarningMessage(
  hazardType: string,
  debrisLevel: string,
  targetZone: string,
  leadTimeMinutes: number,
  safeZoneName: string,
  routeRecommended: string
): Promise<string> {
  const ai = getGenAI();
  const fallbackMessage = `URGENT ALERT — GLACIERGUARD AI: ${hazardType} (${debrisLevel} Debris Severity) detected upstream. Impact expected in ${targetZone} in ~${leadTimeMinutes} minutes. Evacuate immediately to ${safeZoneName} using ${routeRecommended}. Avoid all riverbeds and bridges.`;

  if (!ai) {
    return fallbackMessage;
  }

  try {
    const prompt = `Write a concise, high-priority emergency broadcast alert message (max 3 sentences, extremely clear and actionable) for residents and responders in ${targetZone}.
Details:
- Hazard: ${hazardType}
- Debris severity: ${debrisLevel} (carrying rocks, boulders, mud, and ice)
- Lead time to impact: Approximately ${leadTimeMinutes} minutes
- Designated Refuge Safe Zone: ${safeZoneName}
- Designated Safe Route: ${routeRecommended}
Do NOT use fluff. Tell them what happened, when it arrives, and exact route to safety.`;

    const genPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Advisory timeout')), 3000)
    );
    const response = await Promise.race([genPromise, timeoutPromise]);

    return response.text?.trim() || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
