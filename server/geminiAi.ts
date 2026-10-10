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
 * Expert glaciological decision matrix based on GLOF science & South Lhonak benchmark
 * Dynamically scales with every individual sensor parameter (lake rate of rise, water level, seismics, displacement, discharge)
 */
export function calculateFallbackClassification(telemetry: SensorTelemetry): AIClassificationResult {
  const rate = Number(telemetry.lakeRateOfRiseMetersPerHour) || 0;
  const level = Number(telemetry.lakeWaterLevelMeters) || 32.4;
  const richter = Number(telemetry.seismicMagnitudeRichter) || 0.8;
  const rms = Number(telemetry.seismicVibrationRMS) || 0.05;
  const disp = Number(telemetry.glacierDisplacementMmDay) || 18;
  const discharge = Number(telemetry.riverDischargeM3s) || 180;
  const precip = Number(telemetry.precipitationMmPerHour) || 0;
  const hasDebris = Boolean(telemetry.cameraDebrisDetected);
  const hasCalving = Boolean(telemetry.cameraCalvingDetected);

  // 1. Lake Rate of Rise Component (0 to 65 pts)
  // Baseline is ~0.04 m/hr. Every increment smoothly escalates risk
  let lakeRiseScore = 0;
  if (rate >= 2.5) {
    lakeRiseScore = 55 + Math.min(10, (rate - 2.5) * 8); // 55 - 65 pts
  } else if (rate >= 1.5) {
    lakeRiseScore = 42 + ((rate - 1.5) / 1.0) * 13; // 42 - 55 pts
  } else if (rate >= 0.8) {
    lakeRiseScore = 28 + ((rate - 0.8) / 0.7) * 14; // 28 - 42 pts
  } else if (rate >= 0.4) {
    lakeRiseScore = 16 + ((rate - 0.4) / 0.4) * 12; // 16 - 28 pts
  } else if (rate >= 0.15) {
    lakeRiseScore = 6 + ((rate - 0.15) / 0.25) * 10; // 6 - 16 pts
  } else if (rate > 0.04) {
    lakeRiseScore = ((rate - 0.04) / 0.11) * 6; // 0 - 6 pts
  }

  // 2. Lake Water Level Component (0 to 25 pts)
  // Baseline is 32.4m. Moraine freeboard margin is 38-40m. Above 40m is active overtopping breach.
  let lakeLevelScore = 0;
  if (level >= 41.0) {
    lakeLevelScore = 25;
  } else if (level >= 38.0) {
    lakeLevelScore = 16 + ((level - 38.0) / 3.0) * 9;
  } else if (level >= 35.0) {
    lakeLevelScore = 8 + ((level - 35.0) / 3.0) * 8;
  } else if (level >= 33.0) {
    lakeLevelScore = 2 + ((level - 33.0) / 2.0) * 6;
  }

  // 3. Seismic & Moraine Vibration Component (0 to 25 pts)
  // Baseline: 0.8 Richter, 0.05g RMS
  let seismicScore = 0;
  if (richter >= 3.8 || rms >= 0.55) {
    seismicScore = 25;
  } else if (richter >= 2.8 || rms >= 0.35) {
    seismicScore = 18 + ((richter - 2.8) / 1.0) * 7;
  } else if (richter >= 1.8 || rms >= 0.18) {
    seismicScore = 9 + ((richter - 1.8) / 1.0) * 9;
  } else if (richter >= 1.2 || rms >= 0.10) {
    seismicScore = 3 + ((richter - 1.2) / 0.6) * 6;
  }

  // 4. Glacier Displacement Velocity (0 to 20 pts)
  // Baseline: 18 mm/day. >100 is accelerating. >200 is rapid failure.
  let dispScore = 0;
  if (disp >= 250) {
    dispScore = 20;
  } else if (disp >= 140) {
    dispScore = 13 + ((disp - 140) / 110) * 7;
  } else if (disp >= 60) {
    dispScore = 5 + ((disp - 60) / 80) * 8;
  } else if (disp >= 30) {
    dispScore = 1 + ((disp - 30) / 30) * 4;
  }

  // 5. Optical Edge Calving & Debris (0 to 15 pts)
  let visualScore = 0;
  if (hasDebris) visualScore += 8;
  if (hasCalving) visualScore += 7;

  // 6. Downstream River & Cloudburst Hydrology (0 to 15 pts)
  let riverScore = 0;
  if (discharge >= 3500) riverScore = 15;
  else if (discharge >= 1800) riverScore = 10;
  else if (discharge >= 600) riverScore = 5;
  if (precip >= 35) riverScore += 3;

  // Composite Risk Score (normalized 10 to 100)
  const baseBaseline = 8;
  const rawTotal = baseBaseline + lakeRiseScore + lakeLevelScore + seismicScore + dispScore + visualScore + riverScore;
  const score = Math.max(10, Math.min(100, Math.round(rawTotal)));

  // Risk Band
  let riskBand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (score >= 80) riskBand = 'CRITICAL';
  else if (score >= 60) riskBand = 'HIGH';
  else if (score >= 30) riskBand = 'MODERATE';

  // Determine Hazard Classification & Context
  let hazardType: HazardType = 'Normal / No Hazard';
  let precursor = 'Normal seasonal baseline ablation and meltwater discharge.';
  let chain = 'All upstream seismic, acoustic, optical, and lake-stage indicators are within safe thresholds.';
  let action = 'Maintain standard continuous 24/7 telemetry monitoring.';
  let reasoning = 'Sensors operating within allowable baseline deviations (<0.2 m/hr lake rise, <1.2 Richter tremors).';
  let confidence = 94;

  if (score >= 80) {
    if (richter >= 2.5 && (hasCalving || hasDebris || rate >= 1.5)) {
      hazardType = 'E. Combined Multi-Hazard Event';
      precursor = 'Massive slope collapse and serac detachment impacting surging proglacial lake.';
      chain = 'Slope failure → Impulse displacement wave → Moraine dam overtopping & catastrophic canyon outburst.';
      action = 'MANDATORY RED ALERT: Trigger 130dB sirens, halt all valley hydropower intakes, and execute emergency ridge evacuations!';
      reasoning = `Synchronous catastrophic signals: lake rising at +${rate.toFixed(2)} m/hr, ground tremors at ${richter.toFixed(1)} Richter, and active debris entrainment.`;
    } else {
      hazardType = 'C. Glacial Lake Outburst Flood (GLOF)';
      precursor = 'Catastrophic moraine dam failure or hydrostatic overtopping breach.';
      chain = 'Critical water surge volume exceeding moraine dam structural shear strength → Rapid crest breach → Massive downstream floodwave.';
      action = 'RED ALERT: Evacuate Zone A (Chungthang) immediately! Alert Dikchu and Singtam disaster response units.';
      reasoning = `Extreme proglacial lake expansion: water stage at ${level.toFixed(1)}m surging at +${rate.toFixed(2)} m/hr.`;
    }
  } else if (score >= 60) {
    if (richter >= 2.5) {
      hazardType = 'B. Landslide Entering Glacial Lake';
      precursor = 'Lateral moraine wall destabilization and fracturing above lake basin.';
      chain = 'Sub-surface shear failure → Rockmass plunge into lake basin → Severe displacement wave threat.';
      action = 'ORANGE WARNING: Pre-alert Chungthang disaster response. Restrict riverbed traffic and clear low-lying bridges.';
      reasoning = `High seismic acceleration (${rms.toFixed(2)}g / ${richter.toFixed(1)} Richter) paired with accelerated slope creep.`;
    } else if (hasDebris || discharge >= 1500) {
      hazardType = 'D. Ice / Debris Flow';
      precursor = 'High-density sediment mobilization and glacial till scouring.';
      chain = 'High-velocity melt surge → Moraine till scouring → Bulking into dense debris torrent.';
      action = 'HIGH WARNING: Clear riverbanks, suspension bridges, and downstream hydropower discharge zones.';
      reasoning = `Downstream river discharge surging to ${discharge} m³/s with active bedload transport.`;
    } else {
      hazardType = 'C. Glacial Lake Outburst Flood (GLOF)';
      precursor = 'Accelerated proglacial lake volume expansion approaching dam freeboard.';
      chain = 'Sustained thermal melt surge → Lake stage elevation (+${rate.toFixed(2)} m/hr) → Hydrostatic loading on moraine.';
      action = 'HIGH ADVISORY: Stage evacuation teams and prepare high-ground shelters along Route Alpha.';
      reasoning = `Lake water level (${level.toFixed(1)}m) and rise rate (+${rate.toFixed(2)} m/hr) entering hazardous territory.`;
    }
  } else if (score >= 30) {
    if (disp >= 70 || hasCalving) {
      hazardType = 'A. Glacier / Ice Collapse';
      precursor = 'Hanging serac glacier snout detachment and thermal sliding.';
      chain = 'Thermal meltwater lubricating glacier bed → Surface creep (${disp} mm/day) → Serac fracture.';
      action = 'YELLOW ADVISORY: Restrict high-altitude climbing and monitor lake stage continuously.';
      reasoning = `Glacier surface velocity elevated to ${disp} mm/day with thermal ice calving.`;
    } else {
      hazardType = 'C. Glacial Lake Outburst Flood (GLOF)';
      precursor = 'Elevated proglacial meltwater accumulation and positive rise rate.';
      chain = 'Meltwater influx → Lake water level rising at +${rate.toFixed(2)} m/hr → Elevated moraine hydrostatic pressure.';
      action = 'ELEVATED MONITORING: Increase telemetry sample rate to 10 seconds. Verify LoRa and siren communication links.';
      reasoning = `Lake rate of rise is +${rate.toFixed(2)} m/hr (above baseline threshold of 0.10 m/hr).`;
    }
  }

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
