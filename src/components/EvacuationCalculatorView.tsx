import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Mountain,
  Printer,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Layers,
  FileText,
} from 'lucide-react';
import {
  VillageProfile,
  INITIAL_VILLAGES,
  CalculationOptions,
  calculateEvacuationWindow,
  VillageCalculationResult,
} from '../utils/evacuationCalculator';
import { SupportedLanguage, TRANSLATIONS } from '../utils/translations';

interface EvacuationCalculatorViewProps {
  currentLang?: SupportedLanguage;
  activeBreachScenario?: string;
  onSelectZone?: (zone: string) => void;
}

export const EvacuationCalculatorView: React.FC<EvacuationCalculatorViewProps> = ({
  currentLang = 'en',
  activeBreachScenario,
  onSelectZone,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const calcT = t.calculator;

  // State
  const [villages, setVillages] = useState<VillageProfile[]>(INITIAL_VILLAGES);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('vil_chungthang');
  
  // Options
  const [includeLivestock, setIncludeLivestock] = useState<boolean>(true);
  const [nightOrRainWeather, setNightOrRainWeather] = useState<boolean>(false);
  const [panchayatAssistTeams, setPanchayatAssistTeams] = useState<boolean>(true);
  const [customWaveArrival, setCustomWaveArrival] = useState<number | null>(null);

  // New Custom Village Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newVillageName, setNewVillageName] = useState<string>('');
  const [newVillageZone, setNewVillageZone] = useState<'Zone A' | 'Zone B' | 'Zone C'>('Zone A');
  const [newVillageArrival, setNewVillageArrival] = useState<number>(20);
  const [newVillageDist, setNewVillageDist] = useState<number>(1.5);
  const [newVillageRefuge, setNewVillageRefuge] = useState<string>('Upper Mountain Ridge Sanctuary');
  const [newVillageSlope, setNewVillageSlope] = useState<number>(16);

  // Drill Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedMinutes, setSimulatedMinutes] = useState<number>(0);

  const selectedVillage = useMemo(() => {
    return villages.find((v) => v.id === selectedVillageId) || villages[0];
  }, [villages, selectedVillageId]);

  const activeOptions: CalculationOptions = useMemo(() => ({
    includeLivestock,
    nightOrRainWeather,
    panchayatAssistTeams,
    waveArrivalOverrideMinutes: customWaveArrival ?? undefined,
  }), [includeLivestock, nightOrRainWeather, panchayatAssistTeams, customWaveArrival]);

  // Main village calculation
  const currentCalc: VillageCalculationResult = useMemo(() => {
    return calculateEvacuationWindow(selectedVillage, activeOptions);
  }, [selectedVillage, activeOptions]);

  // All villages calculation for summary table
  const allVillageCalcs = useMemo(() => {
    return villages.map((v) => calculateEvacuationWindow(v, activeOptions));
  }, [villages, activeOptions]);

  // Simulation timer loop
  useEffect(() => {
    let interval: any = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setSimulatedMinutes((prev) => {
          const maxTarget = Math.max(currentCalc.waveArrivalTimeMin, currentCalc.totalEvacuationTimeMin) + 5;
          if (prev >= maxTarget) {
            setIsSimulating(false);
            return prev;
          }
          return Math.round((prev + 0.5) * 10) / 10;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isSimulating, currentCalc]);

  const handleResetSimulation = () => {
    setIsSimulating(false);
    setSimulatedMinutes(0);
  };

  const handleAddCustomVillage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName) return;

    const newVil: VillageProfile = {
      id: `custom_${Date.now()}`,
      name: newVillageName,
      valleyZone: newVillageZone,
      defaultWaveArrivalMinutes: Number(newVillageArrival),
      distanceFromGlacierKm: newVillageZone === 'Zone A' ? 20 : newVillageZone === 'Zone B' ? 45 : 70,
      designatedRefuge: newVillageRefuge,
      refugeElevationMeters: 1800,
      elevationGainMeters: 280,
      trailDistanceKm: Number(newVillageDist),
      trailSlopeDegrees: Number(newVillageSlope),
      trailType: 'Paved Ridge Ascent',
      adultCount: 1200,
      elderlyCount: 220,
      schoolChildrenCount: 380,
      livestockCount: 310,
      panchayatContact: 'Local Volunteer Panchayat Post',
    };

    setVillages((prev) => [...prev, newVil]);
    setSelectedVillageId(newVil.id);
    setShowAddModal(false);
    setNewVillageName('');
  };

  const handlePrintActionSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E9E2D5] text-[#244A38] border border-[#C9C0B1]">
                LIFE SAFETY LOGISTICS ENGINE
              </span>
              <h2 className="text-lg font-bold text-[#26352C] flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F47721]" />
                {calcT.title}
              </h2>
            </div>
            <p className="text-xs text-[#657067] max-w-3xl leading-relaxed">
              {calcT.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#244A38] hover:bg-[#386B4A] text-white transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>{calcT.addCustomVillage}</span>
            </button>
            <button
              onClick={handlePrintActionSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E9E2D5] hover:bg-[#D8C3A5] text-[#26352C] border border-[#C9C0B1] transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#657067]" />
              <span className="hidden sm:inline">{calcT.exportReport}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Valley-Wide Quick Scan: Safe Margin Window Per Village */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#244A38]" />
              Valley-Wide Settlement Scan: Safe Margin Windows
            </h3>
            <p className="text-xs text-[#657067]">
              Safe Margin Window = Wave Arrival Time (t_arrival) - Total Evacuation Time (t_total). Click any village to inspect.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#657067] bg-[#E9E2D5] px-2.5 py-1 rounded border border-[#C9C0B1]">
            {villages.length} Monitored Settlements
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {allVillageCalcs.map((item) => {
            const isSelected = item.village.id === selectedVillageId;
            const isSafe = item.status === 'SAFE';
            const isMarginal = item.status === 'MARGINAL';

            return (
              <button
                key={item.village.id}
                onClick={() => {
                  setSelectedVillageId(item.village.id);
                  setCustomWaveArrival(null);
                  handleResetSimulation();
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#F47721] bg-[#FCE8D8] shadow-sm ring-1 ring-[#F47721]'
                    : 'border-[#C9C0B1] bg-[#FFFCF6] hover:bg-[#E9E2D5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E9E2D5] text-[#26352C]">
                      {item.village.valleyZone}
                    </span>
                    <span className="text-[10px] font-mono text-[#657067]">
                      t_arr: <strong className="text-[#26352C]">{item.waveArrivalTimeMin}m</strong>
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#26352C] line-clamp-1 mb-1">
                    {item.village.name}
                  </h4>
                  <p className="text-[10px] text-[#657067] line-clamp-1 mb-2">
                    Refuge: {item.village.designatedRefuge}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-[#C9C0B1]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#657067]">Safe Margin:</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        isSafe
                          ? 'bg-[#386B4A] text-white'
                          : isMarginal
                          ? 'bg-[#D8C3A5] text-[#26352C]'
                          : 'bg-[#F47721] text-white animate-pulse'
                      }`}
                    >
                      {item.safeMarginWindowMin > 0 ? `+${item.safeMarginWindowMin}m` : `${item.safeMarginWindowMin}m`}
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#657067] font-mono">
                    <span>t_evac: {item.totalEvacuationTimeMin}m</span>
                    <span className={isSafe ? 'text-[#386B4A] font-bold' : isMarginal ? 'text-[#737C45] font-bold' : 'text-[#F47721] font-bold'}>
                      {isSafe ? 'SURPLUS' : isMarginal ? 'TIGHT' : 'DEFICIT'}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Interactive Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Settings, Sliders & What-If Toggles (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C9C0B1] pb-3">
              <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F47721]" />
                Operational Scenario Parameters
              </h3>
              <span className="text-xs font-bold text-[#386B4A]">
                {selectedVillage.valleyZone}
              </span>
            </div>

            {/* Village Selector Dropdown */}
            <div>
              <label className="text-xs font-semibold text-[#26352C] block mb-1.5">
                {calcT.selectVillage}:
              </label>
              <select
                value={selectedVillageId}
                onChange={(e) => {
                  setSelectedVillageId(e.target.value);
                  setCustomWaveArrival(null);
                  handleResetSimulation();
                }}
                className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-xs text-[#26352C] focus:outline-none focus:border-[#F47721]"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    [{v.valleyZone}] {v.name} (Wave t_arrival: {v.defaultWaveArrivalMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Flood Wave Arrival Time Slider (t_arrival) */}
            <div className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#26352C]">{calcT.waveArrivalTime}:</span>
                <span className="font-mono font-bold text-[#F47721] text-sm">
                  {currentCalc.waveArrivalTimeMin} minutes
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={90}
                step={1}
                value={currentCalc.waveArrivalTimeMin}
                onChange={(e) => setCustomWaveArrival(Number(e.target.value))}
                className="w-full accent-[#F47721] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#657067] font-mono">
                <span>8 min (Extreme surge)</span>
                <span>Baseline: {selectedVillage.defaultWaveArrivalMinutes} min</span>
                <span>90 min (Slow spill)</span>
              </div>
            </div>

            {/* Policy Toggle 1: Include Livestock Evacuation */}
            <div className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLivestock}
                  onChange={(e) => setIncludeLivestock(e.target.checked)}
                  className="mt-0.5 accent-[#F47721] w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#26352C] block">
                    {calcT.toggleLivestock} ({selectedVillage.livestockCount} Cattle / Yak)
                  </span>
                  <p className="text-[11px] text-[#657067]">
                    {calcT.toggleLivestockDesc}
                  </p>
                </div>
              </label>
            </div>

            {/* Policy Toggle 2: Weather Factor */}
            <div className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nightOrRainWeather}
                  onChange={(e) => setNightOrRainWeather(e.target.checked)}
                  className="mt-0.5 accent-[#F47721] w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#26352C] block">
                    {calcT.toggleWeather}
                  </span>
                  <p className="text-[11px] text-[#657067]">
                    {calcT.toggleWeatherDesc}
                  </p>
                </div>
              </label>
            </div>

            {/* Policy Toggle 3: Panchayat Volunteer Stretcher Assistance */}
            <div className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={panchayatAssistTeams}
                  onChange={(e) => setPanchayatAssistTeams(e.target.checked)}
                  className="mt-0.5 accent-[#F47721] w-4 h-4 rounded"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#26352C] block">
                    {calcT.toggleAssist}
                  </span>
                  <p className="text-[11px] text-[#657067]">
                    {calcT.toggleAssistDesc}
                  </p>
                </div>
              </label>
            </div>

            {/* Topography & Refuge Details */}
            <div className="pt-3 border-t border-[#C9C0B1] text-xs space-y-2">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#657067]">
                Mountain Trail & Refuge Profile
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#E9E2D5] p-2 rounded border border-[#C9C0B1]">
                  <span className="text-[#657067] block">Refuge Location:</span>
                  <span className="font-semibold text-[#26352C]">{selectedVillage.designatedRefuge}</span>
                </div>
                <div className="bg-[#E9E2D5] p-2 rounded border border-[#C9C0B1]">
                  <span className="text-[#657067] block">Elevation Gain:</span>
                  <span className="font-mono text-[#386B4A] font-bold">+{selectedVillage.elevationGainMeters}m</span>
                </div>
                <div className="bg-[#E9E2D5] p-2 rounded border border-[#C9C0B1]">
                  <span className="text-[#657067] block">{calcT.trailDistance}:</span>
                  <span className="font-mono text-[#26352C] font-bold">{selectedVillage.trailDistanceKm} km</span>
                </div>
                <div className="bg-[#E9E2D5] p-2 rounded border border-[#C9C0B1]">
                  <span className="text-[#657067] block">{calcT.trailSlope}:</span>
                  <span className="font-mono text-[#795548] font-bold">{selectedVillage.trailSlopeDegrees}° gradient</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Margin Window Verdict & Demographic Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Verdict Card: Safe Margin Window */}
          <div
            className={`border rounded-xl p-5 shadow-xs relative overflow-hidden transition-all ${
              currentCalc.status === 'SAFE'
                ? 'bg-[#FFFCF6] border-[#386B4A]'
                : currentCalc.status === 'MARGINAL'
                ? 'bg-[#FFFCF6] border-[#D8C3A5]'
                : 'bg-[#FCE8D8] border-[#F47721]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-1.5 ${
                    currentCalc.status === 'SAFE'
                      ? 'bg-[#386B4A] text-white border-[#386B4A]'
                      : currentCalc.status === 'MARGINAL'
                      ? 'bg-[#D8C3A5] text-[#26352C] border-[#C9C0B1]'
                      : 'bg-[#F47721] text-white border-[#D95F12] animate-pulse font-bold'
                  }`}
                >
                  {currentCalc.status === 'SAFE'
                    ? calcT.statusSafe
                    : currentCalc.status === 'MARGINAL'
                    ? calcT.statusMarginal
                    : calcT.statusCritical}
                </span>
                <h3 className="text-base font-bold text-[#26352C]">
                  {selectedVillage.name}
                </h3>
              </div>

              {/* Big Number Pill */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-[#657067] block">
                  {calcT.safeMarginLabel}
                </span>
                <div
                  className={`text-2xl sm:text-3xl font-mono font-extrabold ${
                    currentCalc.status === 'SAFE'
                      ? 'text-[#386B4A]'
                      : currentCalc.status === 'MARGINAL'
                      ? 'text-[#737C45]'
                      : 'text-[#D95F12]'
                  }`}
                >
                  {currentCalc.safeMarginWindowMin > 0
                    ? `+${currentCalc.safeMarginWindowMin} min`
                    : `${currentCalc.safeMarginWindowMin} min`}
                </div>
              </div>
            </div>

            {/* Margin Bar Visualizer */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs font-mono text-[#26352C]">
                <span>
                  Evacuation Time: <strong>{currentCalc.totalEvacuationTimeMin} min</strong>
                </span>
                <span>
                  Wave Arrival: <strong className="text-[#F47721]">{currentCalc.waveArrivalTimeMin} min</strong>
                </span>
              </div>
              <div className="w-full h-3 bg-[#E9E2D5] rounded-full overflow-hidden flex border border-[#C9C0B1]">
                <div
                  style={{
                    width: `${Math.min(100, (currentCalc.totalEvacuationTimeMin / Math.max(currentCalc.waveArrivalTimeMin, currentCalc.totalEvacuationTimeMin)) * 100)}%`,
                  }}
                  className={`h-full transition-all ${
                    currentCalc.status === 'SAFE'
                      ? 'bg-[#386B4A]'
                      : currentCalc.status === 'MARGINAL'
                      ? 'bg-[#737C45]'
                      : 'bg-[#F47721]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#657067] italic">
                {calcT.safeMarginExplanation}
              </p>
            </div>

            {/* Actionable Life-Safety Directive */}
            <div className="bg-[#E9E2D5] border border-[#C9C0B1] rounded-lg p-3 text-xs leading-relaxed">
              <span className="font-bold text-[#26352C] block mb-1">
                Operational Recommendation:
              </span>
              <p
                className={
                  currentCalc.status === 'SAFE'
                    ? 'text-[#386B4A] font-semibold'
                    : currentCalc.status === 'MARGINAL'
                    ? 'text-[#737C45] font-semibold'
                    : 'text-[#D95F12] font-bold'
                }
              >
                {currentCalc.recommendation}
              </p>
            </div>
          </div>

          {/* Demographic Breakdown Table */}
          <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#244A38]" />
                Vulnerable Demographic Muster & Transit Matrix
              </h3>
              <span className="text-[10px] text-[#657067] font-mono">
                Bottleneck: <strong className="text-[#F47721]">{currentCalc.bottleneckGroup}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#C9C0B1] text-[10px] uppercase font-mono text-[#657067]">
                    <th className="pb-2">Demographic</th>
                    <th className="pb-2 text-right">Population</th>
                    <th className="pb-2 text-right">Muster Delay</th>
                    <th className="pb-2 text-right">Trail Speed</th>
                    <th className="pb-2 text-right">Transit Time</th>
                    <th className="pb-2 text-right">Arrival Time</th>
                    <th className="pb-2 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C9C0B1] font-sans">
                  {currentCalc.groupResults.map((group) => {
                    const isBottleneck = group.groupName === currentCalc.bottleneckGroup;
                    return (
                      <tr
                        key={group.groupName}
                        className={`hover:bg-[#E9E2D5]/50 transition-colors ${
                          isBottleneck ? 'bg-[#FCE8D8]/50 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2.5 text-[#26352C] flex items-center gap-1.5">
                          {isBottleneck && (
                            <AlertTriangle className="w-3.5 h-3.5 text-[#F47721] flex-shrink-0" />
                          )}
                          <span>{group.groupName}</span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#657067]">
                          {group.count.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#26352C]">
                          {group.musterTimeMin}m
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#386B4A] font-semibold">
                          {group.transitSpeedKmH} km/h
                        </td>
                        <td className="py-2.5 text-right font-mono text-[#26352C]">
                          {group.transitTimeMin}m
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-[#26352C]">
                          {group.totalTimeMin}m
                        </td>
                        <td className="py-2.5 text-right font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              group.marginStatus === 'SAFE'
                                ? 'text-[#386B4A] bg-[#E9E2D5]'
                                : group.marginStatus === 'MARGINAL'
                                ? 'text-[#737C45] bg-[#E9E2D5]'
                                : 'text-white bg-[#F47721]'
                            }`}
                          >
                            {group.safeMarginMin > 0 ? `+${group.safeMarginMin}m` : `${group.safeMarginMin}m`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Evacuation Drill Simulation Bar */}
          <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-[#26352C] flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-[#F47721]" />
                  Evacuation Timeline Drill Simulation
                </h4>
                <p className="text-[11px] text-[#657067]">
                  Simulate second-by-second race against the incoming flood surge wave.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#F47721] hover:bg-[#D95F12] text-white transition-colors"
                >
                  {isSimulating ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
                  <span>{isSimulating ? calcT.pauseSimulation : calcT.runSimulation}</span>
                </button>
                <button
                  onClick={handleResetSimulation}
                  className="p-1 rounded-lg text-[#657067] hover:text-[#26352C] bg-[#E9E2D5] hover:bg-[#D8C3A5] transition-colors"
                  title="Reset timeline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Visual Simulation Race Track */}
            <div className="bg-[#E9E2D5] rounded-lg p-3 space-y-2 border border-[#C9C0B1]">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#657067]">
                  Simulated Time: <strong className="text-[#26352C] text-sm">{simulatedMinutes.toFixed(1)} mins</strong>
                </span>
                <span className="text-[#F47721] font-semibold">
                  Surge Strikes At: <strong className="text-[#26352C]">{currentCalc.waveArrivalTimeMin} min</strong>
                </span>
              </div>

              {/* Multi-track indicators */}
              <div className="space-y-1.5 text-[10px] font-mono">
                {currentCalc.groupResults.map((grp) => {
                  const progressPct = Math.min(100, (simulatedMinutes / grp.totalTimeMin) * 100);
                  const hasArrived = simulatedMinutes >= grp.totalTimeMin;
                  const isCaughtByWave = simulatedMinutes >= currentCalc.waveArrivalTimeMin && !hasArrived;

                  return (
                    <div key={grp.groupName} className="space-y-0.5">
                      <div className="flex justify-between text-[#657067]">
                        <span>{grp.groupName}</span>
                        <span>
                          {hasArrived ? (
                            <span className="text-[#386B4A] font-bold">REACHED REFUGE</span>
                          ) : isCaughtByWave ? (
                            <span className="text-[#D95F12] font-bold animate-pulse">SURGE OVERTOOK TRAIL!</span>
                          ) : (
                            `${progressPct.toFixed(0)}% uphill`
                          )}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#FFFCF6] rounded-full overflow-hidden border border-[#C9C0B1]">
                        <div
                          style={{ width: `${progressPct}%` }}
                          className={`h-full transition-all ${
                            hasArrived
                              ? 'bg-[#386B4A]'
                              : isCaughtByWave
                              ? 'bg-[#F47721]'
                              : 'bg-[#244A38]'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Custom Village Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C9C0B1] pb-3">
              <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#F47721]" />
                Add Mountain Settlement / Hamlet
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#657067] hover:text-[#26352C] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddCustomVillage} className="space-y-3 text-xs">
              <div>
                <label className="text-[#26352C] font-semibold block mb-1">Village Name & Ward:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Upper Rabom Hamlet"
                  value={newVillageName}
                  onChange={(e) => setNewVillageName(e.target.value)}
                  className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#26352C] font-semibold block mb-1">Valley Zone:</label>
                  <select
                    value={newVillageZone}
                    onChange={(e: any) => setNewVillageZone(e.target.value)}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                  >
                    <option value="Zone A">Zone A (Upper)</option>
                    <option value="Zone B">Zone B (Mid)</option>
                    <option value="Zone C">Zone C (Lower)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#26352C] font-semibold block mb-1">Wave Arrival t_arr (min):</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={newVillageArrival}
                    onChange={(e) => setNewVillageArrival(Number(e.target.value))}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#26352C] font-semibold block mb-1">Designated Refuge Sanctuary:</label>
                <input
                  type="text"
                  required
                  value={newVillageRefuge}
                  onChange={(e) => setNewVillageRefuge(e.target.value)}
                  className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#26352C] font-semibold block mb-1">Trail Distance (km):</label>
                  <input
                    type="number"
                    step={0.1}
                    min={0.2}
                    max={10}
                    value={newVillageDist}
                    onChange={(e) => setNewVillageDist(Number(e.target.value))}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                  />
                </div>
                <div>
                  <label className="text-[#26352C] font-semibold block mb-1">Trail Gradient Slope (°):</label>
                  <input
                    type="number"
                    min={3}
                    max={35}
                    value={newVillageSlope}
                    onChange={(e) => setNewVillageSlope(Number(e.target.value))}
                    className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-[#657067] hover:text-[#26352C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#F47721] hover:bg-[#D95F12] text-white font-bold"
                >
                  Save & Calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
