import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Radio,
  PhoneCall,
  MapPin,
  Send,
  CheckCircle2,
  Mountain,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../utils/translations';
import { EvacuationCalculatorView } from './EvacuationCalculatorView';
import { LiveSystemState, User } from '../types';

interface CitizenCommunityViewProps {
  systemState: LiveSystemState;
  currentLang: SupportedLanguage;
  onChangeLang: (lang: SupportedLanguage) => void;
  currentUser: User | null;
}

export const CitizenCommunityView: React.FC<CitizenCommunityViewProps> = ({
  systemState,
  currentLang,
  onChangeLang,
  currentUser,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const citizenT = t.citizen;

  // Audio Speech Synthesis State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Field Sighting Submission Form State
  const [sightingLocation, setSightingLocation] = useState('Chungthang Confluence Bridge');
  const [sightingType, setSightingType] = useState('Muddy / Turbid Water Surge');
  const [sightingNotes, setSightingNotes] = useState('');
  const [sightingReportSubmitted, setSightingReportSubmitted] = useState(false);

  // Active risk calculations
  const riskScore = systemState?.currentRiskScore ?? 12;
  const isCritical = riskScore >= 80;
  const isHigh = riskScore >= 60;
  const isModerate = riskScore >= 30;

  // Speak emergency bulletin in native language
  const handleToggleAudioSpeech = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      const langCodes: Record<SupportedLanguage, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        ne: 'ne-NP',
        bn: 'bn-IN',
      };

      const messages: Record<SupportedLanguage, string> = {
        en: isCritical
          ? 'Emergency Alert: Extreme glacier lake outburst flood detected upstream at South Lhonak lake. Evacuate immediately to designated high ground refuges!'
          : 'GlacierGuard advisory: Glacial lake telemetry nominal. River levels normal. Remain alert.',
        hi: isCritical
          ? 'आपातकालीन चेतावनी! दक्षिण ल्होनक झील में ग्लेशियर टूटने से भारी बाढ़ आ रही है। तुरंत पूर्व-निर्धारित सुरक्षित ऊंचाई पर जाएं!'
          : 'ग्लेशियरगार्ड सूचना: तीस्ता घाटी में स्थिति सामान्य है। अपने नजदीकी सुरक्षित शरण स्थल की जानकारी रखें।',
        ne: isCritical
          ? 'आपत्कालीन चेतावनी! ल्होनक तालमा बाढी आएको छ। तुरुन्तै नजिकैको डाँडामा गएर शरण लिनुहोस्!'
          : 'ग्लेशियरगार्ड सूचना: नदीको बहाव अहिले सामान्य छ। सतर्क रहनुहोस्।',
        bn: isCritical
          ? 'জরুরি সতর্কতা! দক্ষিণ লহোনক হ্রদে হিমবাহ ভেঙে তীব্র বন্যা আসছে। অবিলম্বে নিরাপদ উঁচু আশ্রয়ে যান!'
          : 'গ্লেশিয়ারগার্ড বিজ্ঞপ্তি: পরিস্থিতি স্বাভাবিক রয়েছে। সজাগ থাকুন।',
      };

      const textToSpeak = messages[currentLang] || messages.en;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCodes[currentLang] || 'en-US';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitSighting = (e: React.FormEvent) => {
    e.preventDefault();
    setSightingReportSubmitted(true);
    setTimeout(() => {
      setSightingNotes('');
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Regional Language Fast-Toggle Bar */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F47721] animate-pulse"></span>
            <span className="text-xs font-bold text-[#26352C] uppercase tracking-wider">
              {t.navbar.language}:
            </span>
            <span className="text-xs text-[#657067]">
              Fast Toggle Regional Himalayan Languages
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#E9E2D5] p-1 rounded-lg border border-[#C9C0B1]">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onChangeLang(lang.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#F47721] text-white shadow-xs font-bold'
                      : 'text-[#657067] hover:text-[#26352C] hover:bg-[#FFFCF6]'
                  }`}
                  title={`${lang.label} (${lang.region})`}
                >
                  <span className="font-mono text-[10px] uppercase font-bold opacity-75">
                    {lang.flagOrScript}
                  </span>
                  <span>{lang.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Citizen Community Safety Portal Header */}
      <div
        className={`border rounded-xl p-6 relative overflow-hidden transition-all shadow-xs ${
          isCritical
            ? 'bg-[#FCE8D8] border-[#F47721] text-[#26352C]'
            : 'bg-[#244A38] border-[#386B4A] text-white'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isCritical
                    ? 'bg-[#F47721] text-white border-[#D95F12] animate-pulse'
                    : 'bg-[#386B4A] text-white border-[#D8C3A5]/40'
                }`}
              >
                {citizenT.badge}
              </span>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isCritical ? 'text-[#26352C]' : 'text-white'}`}>
                <Users className={`w-5 h-5 ${isCritical ? 'text-[#F47721]' : 'text-[#D8C3A5]'}`} />
                {citizenT.title}
              </h2>
            </div>
            <p className={`text-xs max-w-3xl leading-relaxed ${isCritical ? 'text-[#657067]' : 'text-[#F5F1E8]'}`}>
              {citizenT.description}
            </p>
          </div>

          {/* Voice Advisory Play Button */}
          <button
            onClick={handleToggleAudioSpeech}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
              isSpeaking
                ? 'bg-[#D95F12] hover:bg-[#F47721] text-white shadow-md animate-pulse'
                : 'bg-[#F47721] hover:bg-[#D95F12] text-white shadow-sm'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
            <span>{isSpeaking ? citizenT.stopAudio : citizenT.listenAdvisory}</span>
          </button>
        </div>

        {/* Real-time Status Strip */}
        <div className={`mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
          isCritical ? 'border-[#F47721]/30' : 'border-[#386B4A]'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`font-mono ${isCritical ? 'text-[#657067]' : 'text-[#D8C3A5]'}`}>
              Current Status:{' '}
              <strong className={isCritical ? 'text-[#D95F12]' : isHigh ? 'text-[#F47721]' : 'text-[#386B4A]'}>
                {isCritical ? 'MANDATORY EVACUATION' : isHigh ? 'HIGH ALERT' : 'NORMAL EQUILIBRIUM'}
              </strong>
            </span>
            <span className="opacity-40">•</span>
            <span className={isCritical ? 'text-[#657067]' : 'text-[#D8C3A5]'}>
              Risk Score:{' '}
              <strong className={`font-mono ${isCritical ? 'text-[#D95F12]' : 'text-white'}`}>{riskScore}/100</strong>
            </span>
          </div>

          <span className={`text-[11px] flex items-center gap-1.5 ${isCritical ? 'text-[#657067]' : 'text-[#D8C3A5]'}`}>
            <Radio className={`w-3.5 h-3.5 ${isCritical ? 'text-[#F47721]' : 'text-[#386B4A]'}`} />
            <span>{citizenT.offlineNotice}</span>
          </span>
        </div>
      </div>

      {/* CORE FEATURE: Evacuation Assembly Time Calculator */}
      <EvacuationCalculatorView currentLang={currentLang} />

      {/* High-Ground Safe Zone Directory & Emergency Hotlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Designated High Ground Refuges (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#C9C0B1] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
                <Mountain className="w-4 h-4 text-[#244A38]" />
                Designated High-Ground Refuges (Teesta Basin)
              </h3>
              <p className="text-xs text-[#657067]">
                Pre-surveyed, fortified safe sanctuaries above historic 2023 flood high-water marks.
              </p>
            </div>
            <span className="text-xs font-mono text-[#386B4A] bg-[#E9E2D5] px-2 py-0.5 rounded border border-[#C9C0B1] font-semibold">
              Stocked & Ready
            </span>
          </div>

          <div className="space-y-3">
            {systemState?.zones?.map((zone) => (
              <div
                key={zone.zoneId}
                className="bg-[#E9E2D5]/70 border border-[#C9C0B1] rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#D8C3A5] text-[#26352C]">
                      {zone.zoneId}
                    </span>
                    <h4 className="text-xs font-bold text-[#26352C]">
                      {zone.safeZoneName}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#657067]">
                    Route: <span className="text-[#26352C] font-semibold">{zone.evacuationRouteName}</span>
                  </p>
                  <p className="text-[10px] text-[#657067]">
                    Population Served: ~{zone.populationAtRisk.toLocaleString()} residents
                  </p>
                </div>

                <div className="text-right sm:flex-shrink-0 space-y-0.5">
                  <span className="text-[10px] text-[#657067] uppercase font-mono block">Elevation ASL</span>
                  <span className="text-xs font-mono font-bold text-[#386B4A]">
                    {zone.elevationMeters + 360}m ASL
                  </span>
                  <span className="text-[10px] text-[#657067] block font-mono">
                    Water • Solar • Meds Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24/7 Valley Emergency Distress Helplines (5 cols) */}
        <div className="lg:col-span-5 bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-[#C9C0B1] pb-3">
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#F47721]" />
              {citizenT.hotlineTitle}
            </h3>
            <p className="text-xs text-[#657067]">
              Priority toll-free channels linked directly to ITBP mountain command and NDRF.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-[#E9E2D5]/70 border border-[#C9C0B1] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#26352C] block">Sikkim State Disaster Control Room</span>
                <span className="text-[10px] text-[#657067]">Toll-Free 24x7 Ingestion</span>
              </div>
              <a
                href="tel:1070"
                className="font-mono text-[#D95F12] font-bold bg-[#FCE8D8] px-2.5 py-1 rounded border border-[#F47721]/40 hover:bg-[#F47721] hover:text-white transition-colors"
              >
                1070 / 112
              </a>
            </div>

            <div className="bg-[#E9E2D5]/70 border border-[#C9C0B1] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#26352C] block">ITBP Mountain Rescue (North Sikkim)</span>
                <span className="text-[10px] text-[#657067]">Chungthang Base Command</span>
              </div>
              <a
                href="tel:03592284102"
                className="font-mono text-[#D95F12] font-bold bg-[#FCE8D8] px-2.5 py-1 rounded border border-[#F47721]/40 hover:bg-[#F47721] hover:text-white transition-colors"
              >
                03592-284102
              </a>
            </div>

            <div className="bg-[#E9E2D5]/70 border border-[#C9C0B1] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#26352C] block">NDRF 2nd Battalion (Flood Ops)</span>
                <span className="text-[10px] text-[#657067]">Rapid Response Unit</span>
              </div>
              <a
                href="tel:1078"
                className="font-mono text-[#D95F12] font-bold bg-[#FCE8D8] px-2.5 py-1 rounded border border-[#F47721]/40 hover:bg-[#F47721] hover:text-white transition-colors"
              >
                1078
              </a>
            </div>

            <div className="bg-[#E9E2D5]/70 border border-[#C9C0B1] rounded-lg p-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#26352C] block">SDRF Emergency Wireless Net</span>
                <span className="text-[10px] text-[#657067]">VHF Channel 4 Backup</span>
              </div>
              <span className="font-mono text-[#386B4A] font-bold text-[11px] bg-[#E9E2D5] px-2 py-0.5 rounded border border-[#C9C0B1]">
                CH-4 ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Hazard Sighting Form (Citizen Crowdsourcing) */}
      <div className="bg-[#FFFCF6] border border-[#C9C0B1] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#26352C] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#F47721]" />
              {citizenT.sightingReportTitle}
            </h3>
            <p className="text-xs text-[#657067]">
              {citizenT.sightingReportDesc}
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#657067] bg-[#E9E2D5] px-2 py-0.5 rounded border border-[#C9C0B1]">
            Citizen Sighting Portal
          </span>
        </div>

        {sightingReportSubmitted ? (
          <div className="bg-[#E9E2D5] border border-[#386B4A] rounded-lg p-4 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-[#386B4A] mx-auto" />
            <h4 className="text-xs font-bold text-[#26352C]">{citizenT.reportedSuccess}</h4>
            <p className="text-[11px] text-[#657067]">
              Your observation for <strong className="text-[#386B4A]">{sightingLocation}</strong> has been logged into the early warning stream.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitSighting} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#26352C] font-semibold block mb-1">Your Location / Settlement:</label>
                <select
                  value={sightingLocation}
                  onChange={(e) => setSightingLocation(e.target.value)}
                  className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                >
                  <option value="Chungthang Confluence Bridge">Chungthang Confluence Bridge (Zone A)</option>
                  <option value="Lachen Road km 14">Lachen Road km 14 (Upper Valley)</option>
                  <option value="Dikchu Riverbank">Dikchu Riverbank (Zone B)</option>
                  <option value="Singtam Low Terrace">Singtam Low Terrace (Zone C)</option>
                  <option value="Rangpo Basti">Rangpo Basti (Zone C)</option>
                </select>
              </div>

              <div>
                <label className="text-[#26352C] font-semibold block mb-1">Observation Type:</label>
                <select
                  value={sightingType}
                  onChange={(e) => setSightingType(e.target.value)}
                  className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg px-3 py-2 text-[#26352C] focus:outline-none focus:border-[#F47721]"
                >
                  <option value="Muddy / Turbid Water Surge">Sudden Muddy / Turbid Water Surge</option>
                  <option value="Abnormal River Roaring Sound">Abnormal Deep River Roar / Rumbling</option>
                  <option value="Floating Ice / Large Boulder Debris">Floating Ice / Large Boulder Debris</option>
                  <option value="Rapid River Stage Rise">Rapid River Stage Water Level Rise</option>
                  <option value="Moraine / Hillside Slump">Moraine / Hillside Slump or Crack</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[#26352C] font-semibold block mb-1">Observation Details (Optional):</label>
              <textarea
                rows={2}
                placeholder="Describe what you see or hear (e.g., river rose ~2 feet in 5 minutes with heavy debris smell)..."
                value={sightingNotes}
                onChange={(e) => setSightingNotes(e.target.value)}
                className="w-full bg-[#FFFCF6] border border-[#C9C0B1] rounded-lg p-2.5 text-[#26352C] focus:outline-none focus:border-[#F47721]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#F47721] hover:bg-[#D95F12] text-white shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>{citizenT.submitReport}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
