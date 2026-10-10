import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { registerUser, loginUser, getUserByToken, logoutUser, demoLogin } from './server/auth';
import { glacierManager, addSseClient } from './server/glacierState';
import { classifyHazardEventWithGemini, generateActionableWarningMessage } from './server/geminiAi';
import { SensorTelemetry } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Auth helper middleware
function authenticate(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  const token = authHeader.substring(7);
  const user = getUserByToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
  (req as any).user = user;
  next();
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, role, agency } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const result = registerUser(email, password, name, role || 'public', agency);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed.' });
  }
});

app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required for demo login.' });
    }
    const result = demoLogin(role);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Demo login failed.' });
  }
});

app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    logoutUser(authHeader.substring(7));
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// REAL-TIME SERVER-SENT EVENTS (SSE) NOTIFICATIONS
// ----------------------------------------------------

app.get('/api/notifications/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial connected ping
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

  addSseClient(res);
});

// ----------------------------------------------------
// SENSORS & GLACIER SYSTEM STATE
// ----------------------------------------------------

app.get('/api/sensors/state', (req: Request, res: Response) => {
  res.json(glacierManager.getState());
});

// ESP32 Hardware Ingestion Endpoint
app.post('/api/sensors/ingest', async (req: Request, res: Response) => {
  try {
    const telemetryData: Partial<SensorTelemetry> = req.body;
    const scenario = req.body.scenarioName || 'ESP32 Live Telemetry Ingestion';
    const updatedState = await glacierManager.ingestTelemetry(telemetryData, scenario);
    res.json({ success: true, state: updatedState, ...updatedState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to ingest sensor telemetry.' });
  }
});

// Manual sensor telemetry update endpoint
app.post('/api/sensors/update', async (req: Request, res: Response) => {
  try {
    const telemetryData: Partial<SensorTelemetry> = req.body;
    const updatedState = await glacierManager.ingestTelemetry(telemetryData, 'Manual Sensor Telemetry Injection');
    res.json({ success: true, state: updatedState, ...updatedState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update sensor telemetry.' });
  }
});

// Reset to Safe Baseline
app.post('/api/sensors/reset', (req: Request, res: Response) => {
  const state = glacierManager.resetToSafe();
  res.json({ success: true, state, ...state });
});

// Live Demo Step Trigger (supports the 11-step hackathon script)
app.post('/api/sensors/trigger-demo-step', async (req: Request, res: Response) => {
  const { step } = req.body;
  let partial: Partial<SensorTelemetry> = {};
  let scenarioName = 'Simulated Disturbance';

  switch (step) {
    case 1: // Stable system (Risk 12/100, SAFE)
      glacierManager.resetToSafe();
      const safeState = glacierManager.getState();
      return res.json({ success: true, state: safeState, ...safeState, stepDescription: 'Step 1: Baseline Stable State (Risk 12/100, SAFE)' });

    case 2: // Upstream disturbance triggered (Micro-tremors & ice movement)
      partial = {
        seismicMagnitudeRichter: 1.9,
        seismicVibrationRMS: 0.18,
        glacierDisplacementMmDay: 58,
        lakeWaterLevelMeters: 33.2,
        lakeRateOfRiseMetersPerHour: 0.22,
        cameraCalvingDetected: true,
      };
      scenarioName = 'Precursor: Hanging Glacier Calving & Lateral Slope Creep';
      break;

    case 3: // Vibration & water-level values change (Moderate surge, Risk ~55)
      partial = {
        seismicMagnitudeRichter: 2.8,
        seismicVibrationRMS: 0.38,
        glacierDisplacementMmDay: 135,
        lakeWaterLevelMeters: 35.8,
        lakeRateOfRiseMetersPerHour: 0.85,
        precipitationMmPerHour: 34,
        freezingLevelMeters: 5100,
        riverStageMeters: 4.8,
        riverDischargeM3s: 890,
        cameraDebrisDetected: true,
        cameraCalvingDetected: true,
      };
      scenarioName = 'Abnormal Disturbance: Moraine Dam Instability & Impulse Wave';
      break;

    case 4: // AI classifies event & Risk score escalates to High (Risk ~78)
      partial = {
        seismicMagnitudeRichter: 3.6,
        seismicVibrationRMS: 0.52,
        glacierDisplacementMmDay: 210,
        lakeWaterLevelMeters: 38.6,
        lakeRateOfRiseMetersPerHour: 1.65,
        precipitationMmPerHour: 48,
        riverStageMeters: 7.2,
        riverDischargeM3s: 2200,
        cameraDebrisDetected: true,
        cameraCalvingDetected: true,
      };
      scenarioName = 'High Risk: Moraine Overtopping & Debris Mobilization';
      break;

    case 5: // Full breach: Extreme hazard detected (Risk ~94, Red alert, Sirens!)
    default:
      partial = {
        seismicMagnitudeRichter: 4.2,
        seismicVibrationRMS: 0.68,
        glacierDisplacementMmDay: 350,
        lakeWaterLevelMeters: 42.1,
        lakeRateOfRiseMetersPerHour: 2.9,
        precipitationMmPerHour: 62,
        riverStageMeters: 10.4,
        riverDischargeM3s: 4850,
        cameraDebrisDetected: true,
        cameraCalvingDetected: true,
      };
      scenarioName = 'CRITICAL: South Lhonak Moraine Dam Breach GLOF + Extreme Debris Avalanche';
      break;
  }

  const updatedState = await glacierManager.ingestTelemetry(partial, scenarioName);
  res.json({ success: true, state: updatedState, ...updatedState, step });
});

// Calculate Debris Flow Severity Index (supports both endpoint URLs)
const handleDebrisCalculation = (req: Request, res: Response) => {
  const { waterVolumeMillionM3, solidFractionPercent, averageSlopeDegrees, peakDischargeM3s } = req.body;
  const assessment = glacierManager.calculateDebrisIndex({
    waterVolumeMillionM3: Number(waterVolumeMillionM3) || 12,
    solidFractionPercent: Number(solidFractionPercent) || 45,
    averageSlopeDegrees: Number(averageSlopeDegrees) || 20,
    peakDischargeM3s: Number(peakDischargeM3s) || 2400,
  });
  res.json({ success: true, assessment, ...assessment });
};

app.post('/api/debris-index/calculate', handleDebrisCalculation);
app.post('/api/sensors/debris/calculate', handleDebrisCalculation);

// AI Hazard Classification
app.post('/api/ai/classify', async (req: Request, res: Response) => {
  try {
    const telemetry = req.body.telemetry || glacierManager.getState().telemetry;
    const context = req.body.context || 'South Lhonak proglacial lake hazard assessment';
    const classification = await classifyHazardEventWithGemini(telemetry, context);
    res.json({ success: true, classification, ...classification });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Classification failed.' });
  }
});

// Generate Smart Advisory (supports both endpoint URLs)
const handleAdvisoryGeneration = async (req: Request, res: Response) => {
  try {
    const { hazardType, debrisLevel, targetZone, leadTimeMinutes, safeZoneName, safeZone, routeRecommended } = req.body;
    const message = await generateActionableWarningMessage(
      hazardType || 'Glacial Lake Outburst Flood',
      debrisLevel || 'EXTREME',
      targetZone || 'Zone A (Chungthang)',
      Number(leadTimeMinutes) || 18,
      safeZoneName || safeZone || 'Upper Ridge Helipad Safe Zone',
      routeRecommended || 'Route Alpha High Ridge'
    );
    res.json({ success: true, message });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate advisory.' });
  }
};

app.post('/api/ai/generate-advisory', handleAdvisoryGeneration);
app.post('/api/ai/warning-message', handleAdvisoryGeneration);

// Emergency Alert Broadcast (Commander / Authorized responder)
app.post('/api/alerts/broadcast', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, message, zones, affectedZones, severity } = req.body;
    const targetZones = zones || affectedZones || ['Zone A', 'Zone B', 'Zone C'];
    const user = (req as any).user;
    if (user.role !== 'commander' && user.role !== 'hydrologist') {
      return res.status(403).json({ error: 'Permission denied. Only Commander or Hydrologist can issue valley alerts.' });
    }

    const alert = await glacierManager.broadcastCommanderAlert(
      title || 'CRITICAL GLOF EMERGENCY ALERT',
      message || 'Immediate evacuation ordered to designated high-ground safe zones.',
      targetZones,
      severity || 'EXTREME'
    );
    res.json({ success: true, alert, ...alert });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to broadcast alert.' });
  }
});

// Siren Activation Toggle
app.post('/api/alerts/toggle-siren', (req: Request, res: Response) => {
  const { forceState } = req.body;
  const sirenActive = glacierManager.toggleSiren(forceState);
  res.json({ success: true, sirenActive });
});

// Communication Resiliency Simulation: Toggle channel outage & show fallback
const handleChannelToggle = (req: Request, res: Response) => {
  const { channelId } = req.body;
  if (!channelId) {
    return res.status(400).json({ error: 'channelId is required.' });
  }
  const channels = glacierManager.toggleChannelFailure(channelId);
  res.json({ success: true, channels });
};

app.post('/api/comms/toggle-channel', handleChannelToggle);
app.post('/api/alerts/toggle-channel', handleChannelToggle);

// Satellite Case Study Data & Historical GLOF Inventories
app.get('/api/satellite/data', (req: Request, res: Response) => {
  res.json({
    primaryCaseStudy: {
      name: 'South Lhonak Lake GLOF Event',
      region: 'North Sikkim, Eastern Himalayas, India',
      coordinates: { lat: 27.9125, lng: 88.2047 },
      elevationMeters: 5200,
      eventDate: 'October 3-4, 2023',
      initialArea1962Km2: 0.11,
      expandedArea2023Km2: 1.42,
      postBreachAreaKm2: 0.88,
      waterVolumeReleasedMillionM3: 24.5,
      triggerMechanism: 'Ice avalanche & rockfall into lake causing moraine breach & massive debris transport down Teesta River',
      impactedAssets: ['Chungthang Stage III Dam collapsed', 'Dikchu powerhouse damaged', 'NH-10 highway washed out'],
    },
    globalInventories: {
      highMountainAsiaGlofs: 697,
      globalHistoricalGlofs: 3151,
      monitoredGlacialLakesInHimalayas: 2044,
      criticallyDangerousLakes: 54,
    },
  });
});

// ----------------------------------------------------
// VITE MIDDLEWARE & STATIC ASSETS
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GLACIERGUARD AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
