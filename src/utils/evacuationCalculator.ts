/**
 * Evacuation Assembly Time Calculator Logic
 * Mathematical modeling of mountain evacuation logistics,
 * vulnerable demographic muster delays, trail steepness,
 * and flood surge wave arrival times (t_arrival).
 */

export interface DemographicGroup {
  name: string;
  count: number;
  baseSpeedKmH: number;
  musterDelayMinutes: number;
  color: string;
}

export interface VillageProfile {
  id: string;
  name: string;
  valleyZone: 'Zone A' | 'Zone B' | 'Zone C';
  defaultWaveArrivalMinutes: number; // t_arrival
  distanceFromGlacierKm: number;
  designatedRefuge: string;
  refugeElevationMeters: number;
  elevationGainMeters: number;
  trailDistanceKm: number;
  trailSlopeDegrees: number;
  trailType: 'Paved Ridge Ascent' | 'Forest Mountain Track' | 'Elevated Highway Steps' | 'Rocky Ridge Gully';
  adultCount: number;
  elderlyCount: number;
  schoolChildrenCount: number;
  livestockCount: number;
  panchayatContact: string;
}

export const INITIAL_VILLAGES: VillageProfile[] = [
  {
    id: 'vil_chungthang',
    name: 'Chungthang Lower Village & Bazaar',
    valleyZone: 'Zone A',
    defaultWaveArrivalMinutes: 18,
    distanceFromGlacierKm: 24.2,
    designatedRefuge: 'Chungthang Upper Ridge Helipad',
    refugeElevationMeters: 2150,
    elevationGainMeters: 360,
    trailDistanceKm: 1.6,
    trailSlopeDegrees: 18,
    trailType: 'Paved Ridge Ascent',
    adultCount: 1850,
    elderlyCount: 320,
    schoolChildrenCount: 540,
    livestockCount: 420,
    panchayatContact: '+91-3592-284102 (Pradhan Tashi)',
  },
  {
    id: 'vil_dikchu',
    name: 'Dikchu Riverside Settlement & Dam Colony',
    valleyZone: 'Zone B',
    defaultWaveArrivalMinutes: 32,
    distanceFromGlacierKm: 48.6,
    designatedRefuge: 'Dikchu Monastery High Terrace',
    refugeElevationMeters: 1020,
    elevationGainMeters: 370,
    trailDistanceKm: 2.4,
    trailSlopeDegrees: 15,
    trailType: 'Forest Mountain Track',
    adultCount: 3400,
    elderlyCount: 580,
    schoolChildrenCount: 920,
    livestockCount: 650,
    panchayatContact: '+91-3592-241088 (Dikchu Control)',
  },
  {
    id: 'vil_singtam',
    name: 'Singtam Commercial Floodplain & Ward 3',
    valleyZone: 'Zone C',
    defaultWaveArrivalMinutes: 51,
    distanceFromGlacierKm: 72.4,
    designatedRefuge: 'Govt College Stadium High Ground',
    refugeElevationMeters: 510,
    elevationGainMeters: 160,
    trailDistanceKm: 2.1,
    trailSlopeDegrees: 8,
    trailType: 'Elevated Highway Steps',
    adultCount: 8200,
    elderlyCount: 1100,
    schoolChildrenCount: 2400,
    livestockCount: 380,
    panchayatContact: '+91-3592-233412 (Singtam Municipal Ward)',
  },
  {
    id: 'vil_lachen',
    name: 'Lachen Road Staging Post (Upper Gorge)',
    valleyZone: 'Zone A',
    defaultWaveArrivalMinutes: 12,
    distanceFromGlacierKm: 14.8,
    designatedRefuge: 'ITBP High Plateau Bunker (Elev 2,900m)',
    refugeElevationMeters: 2900,
    elevationGainMeters: 220,
    trailDistanceKm: 0.9,
    trailSlopeDegrees: 22,
    trailType: 'Rocky Ridge Gully',
    adultCount: 410,
    elderlyCount: 65,
    schoolChildrenCount: 90,
    livestockCount: 280,
    panchayatContact: '+91-3592-268019 (ITBP Mountain Post)',
  },
  {
    id: 'vil_rangpo',
    name: 'Rangpo Riverbank Basti & Transit Hub',
    valleyZone: 'Zone C',
    defaultWaveArrivalMinutes: 65,
    distanceFromGlacierKm: 88.0,
    designatedRefuge: 'Mining Ground Hilltop Community Shelter',
    refugeElevationMeters: 480,
    elevationGainMeters: 180,
    trailDistanceKm: 2.8,
    trailSlopeDegrees: 9,
    trailType: 'Paved Ridge Ascent',
    adultCount: 5200,
    elderlyCount: 740,
    schoolChildrenCount: 1450,
    livestockCount: 220,
    panchayatContact: '+91-3592-220011 (Rangpo SDM Office)',
  },
];

export interface CalculationOptions {
  includeLivestock: boolean;
  nightOrRainWeather: boolean;
  panchayatAssistTeams: boolean;
  waveArrivalOverrideMinutes?: number;
}

export interface GroupResult {
  groupName: string;
  count: number;
  musterTimeMin: number;
  transitSpeedKmH: number;
  transitTimeMin: number;
  totalTimeMin: number;
  safeMarginMin: number;
  canMakeIt: boolean;
  marginStatus: 'SAFE' | 'MARGINAL' | 'DEFICIT';
}

export interface VillageCalculationResult {
  village: VillageProfile;
  waveArrivalTimeMin: number; // t_arrival
  totalEvacuationTimeMin: number; // t_total (slowest group)
  safeMarginWindowMin: number; // t_arrival - t_total
  status: 'SAFE' | 'MARGINAL' | 'DEFICIT';
  bottleneckGroup: string;
  groupResults: GroupResult[];
  recommendation: string;
  isLivestockBottleneck: boolean;
}

/**
 * Calculates assembly, transit, and safe margin window for a village
 */
export function calculateEvacuationWindow(
  village: VillageProfile,
  options: CalculationOptions
): VillageCalculationResult {
  const waveArrival = options.waveArrivalOverrideMinutes ?? village.defaultWaveArrivalMinutes;

  // Weather penalty: night / monsoon mud slows transit by 30%
  const weatherSpeedMultiplier = options.nightOrRainWeather ? 0.70 : 1.0;

  // Slope penalty factor: steeper slope slows uphill transit
  // Using simplified Tobler slope factor: speed = base * e^(-3.5 * |slope_rad + 0.05|)
  const slopeRad = (village.trailSlopeDegrees * Math.PI) / 180;
  const slopeFactor = Math.max(0.55, 1.0 - Math.tan(slopeRad) * 0.75);

  // Group 1: Able-bodied adults
  const adultBaseSpeed = 4.2 * slopeFactor * weatherSpeedMultiplier;
  const adultMuster = 3; // mins
  const adultTransit = (village.trailDistanceKm / adultBaseSpeed) * 60;
  const adultTotal = adultMuster + adultTransit;

  // Group 2: Schools & Children
  const schoolBaseSpeed = 2.4 * slopeFactor * weatherSpeedMultiplier;
  const schoolMuster = options.nightOrRainWeather ? 10 : 7; // headcount, assembling children
  const schoolTransit = (village.trailDistanceKm / schoolBaseSpeed) * 60;
  const schoolTotal = schoolMuster + schoolTransit;

  // Group 3: Elderly & Mobility-Challenged
  // Assisted teams increase speed by ~35% and reduce muster
  const elderlyAssistMultiplier = options.panchayatAssistTeams ? 1.35 : 1.0;
  const elderlyBaseSpeed = 1.4 * slopeFactor * weatherSpeedMultiplier * elderlyAssistMultiplier;
  const elderlyMuster = options.panchayatAssistTeams ? 7 : (options.nightOrRainWeather ? 14 : 11);
  const elderlyTransit = (village.trailDistanceKm / elderlyBaseSpeed) * 60;
  const elderlyTotal = elderlyMuster + elderlyTransit;

  // Group 4: Livestock (Cattle / Yaks / Goats)
  let livestockTotal = 0;
  let livestockMuster = 0;
  let livestockTransit = 0;
  let livestockBaseSpeed = 1.8 * slopeFactor * weatherSpeedMultiplier;

  if (options.includeLivestock) {
    livestockMuster = options.nightOrRainWeather ? 22 : 16; // untethering, herding
    livestockTransit = (village.trailDistanceKm / livestockBaseSpeed) * 60;
    livestockTotal = livestockMuster + livestockTransit;
  }

  // Construct group results
  const groups: GroupResult[] = [
    {
      groupName: 'Able-Bodied Adults',
      count: village.adultCount,
      musterTimeMin: Math.round(adultMuster * 10) / 10,
      transitSpeedKmH: Math.round(adultBaseSpeed * 10) / 10,
      transitTimeMin: Math.round(adultTransit * 10) / 10,
      totalTimeMin: Math.round(adultTotal * 10) / 10,
      safeMarginMin: Math.round((waveArrival - adultTotal) * 10) / 10,
      canMakeIt: adultTotal <= waveArrival,
      marginStatus: waveArrival - adultTotal >= 8 ? 'SAFE' : waveArrival - adultTotal >= 0 ? 'MARGINAL' : 'DEFICIT',
    },
    {
      groupName: 'Schools & Children',
      count: village.schoolChildrenCount,
      musterTimeMin: Math.round(schoolMuster * 10) / 10,
      transitSpeedKmH: Math.round(schoolBaseSpeed * 10) / 10,
      transitTimeMin: Math.round(schoolTransit * 10) / 10,
      totalTimeMin: Math.round(schoolTotal * 10) / 10,
      safeMarginMin: Math.round((waveArrival - schoolTotal) * 10) / 10,
      canMakeIt: schoolTotal <= waveArrival,
      marginStatus: waveArrival - schoolTotal >= 8 ? 'SAFE' : waveArrival - schoolTotal >= 0 ? 'MARGINAL' : 'DEFICIT',
    },
    {
      groupName: 'Elderly & Mobility-Impaired',
      count: village.elderlyCount,
      musterTimeMin: Math.round(elderlyMuster * 10) / 10,
      transitSpeedKmH: Math.round(elderlyBaseSpeed * 10) / 10,
      transitTimeMin: Math.round(elderlyTransit * 10) / 10,
      totalTimeMin: Math.round(elderlyTotal * 10) / 10,
      safeMarginMin: Math.round((waveArrival - elderlyTotal) * 10) / 10,
      canMakeIt: elderlyTotal <= waveArrival,
      marginStatus: waveArrival - elderlyTotal >= 8 ? 'SAFE' : waveArrival - elderlyTotal >= 0 ? 'MARGINAL' : 'DEFICIT',
    },
  ];

  if (options.includeLivestock) {
    groups.push({
      groupName: 'Livestock / Herd (Cattle & Yak)',
      count: village.livestockCount,
      musterTimeMin: Math.round(livestockMuster * 10) / 10,
      transitSpeedKmH: Math.round(livestockBaseSpeed * 10) / 10,
      transitTimeMin: Math.round(livestockTransit * 10) / 10,
      totalTimeMin: Math.round(livestockTotal * 10) / 10,
      safeMarginMin: Math.round((waveArrival - livestockTotal) * 10) / 10,
      canMakeIt: livestockTotal <= waveArrival,
      marginStatus: waveArrival - livestockTotal >= 8 ? 'SAFE' : waveArrival - livestockTotal >= 0 ? 'MARGINAL' : 'DEFICIT',
    });
  }

  // Find slowest group (critical bottleneck)
  let maxTime = 0;
  let bottleneckGroup = 'Able-Bodied Adults';
  for (const g of groups) {
    if (g.totalTimeMin > maxTime) {
      maxTime = g.totalTimeMin;
      bottleneckGroup = g.groupName;
    }
  }

  const safeMargin = Math.round((waveArrival - maxTime) * 10) / 10;
  const status: 'SAFE' | 'MARGINAL' | 'DEFICIT' =
    safeMargin >= 8 ? 'SAFE' : safeMargin >= 0 ? 'MARGINAL' : 'DEFICIT';

  const isLivestockBottleneck = options.includeLivestock && bottleneckGroup.includes('Livestock');

  // Specific operational recommendation
  let recommendation = '';
  if (status === 'SAFE') {
    recommendation = `Safe margin verified (+${safeMargin} min). Proceed with systematic evacuation along ${village.trailType} to ${village.designatedRefuge}.`;
  } else if (status === 'MARGINAL') {
    if (isLivestockBottleneck) {
      recommendation = `CRITICAL MARGIN (+${safeMargin} min). WARNING: Livestock evacuation is throttling the village! Untether/abandon herds immediately to gain +14 minutes of survival cushion.`;
    } else {
      recommendation = `URGENT MARGIN (+${safeMargin} min). Mobilize Panchayat youth teams to carry elderly immediately. Avoid stopping for belongings.`;
    }
  } else {
    recommendation = `DANGER: NEGATIVE MARGIN (${safeMargin} min deficit)! Surge will strike before high-ground refuge is reached on foot. ABANDON TRAIL MARCH — Order immediate VERTICAL EVACUATION to top floors of reinforced RCC structures!`;
  }

  return {
    village,
    waveArrivalTimeMin: waveArrival,
    totalEvacuationTimeMin: maxTime,
    safeMarginWindowMin: safeMargin,
    status,
    bottleneckGroup,
    groupResults: groups,
    recommendation,
    isLivestockBottleneck,
  };
}
