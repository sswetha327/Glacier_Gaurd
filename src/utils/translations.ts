/**
 * Multi-Lingual Regional Translation Dictionary
 * Supporting Himalayan disaster prone languages:
 * English (en), Hindi (hi), Nepali (ne), Bengali (bn)
 */

export type SupportedLanguage = 'en' | 'hi' | 'ne' | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flagOrScript: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flagOrScript: 'EN', region: 'Default / Scientific' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flagOrScript: 'हि', region: 'National / NDMA' },
  { code: 'ne', label: 'Nepali', nativeLabel: 'नेपाली', flagOrScript: 'ने', region: 'Sikkim & Himalayan Valleys' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flagOrScript: 'বা', region: 'Lower Teesta & North Bengal' },
];

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  riskLevel: string;
  riskBands: {
    LOW: string;
    MODERATE: string;
    HIGH: string;
    CRITICAL: string;
  };
  navbar: {
    earlyWarning: string;
    sirenReady: string;
    sirenActive: string;
    sirenMuted: string;
    resetBaseline: string;
    citizenMode: string;
    commandMode: string;
    language: string;
    quickSwitch: string;
    signIn: string;
    signOut: string;
  };
  tabs: {
    monitor: string;
    classify: string;
    predict: string;
    map: string;
    warn: string;
    satellite: string;
    community: string;
  };
  calculator: {
    title: string;
    subtitle: string;
    safeMarginLabel: string;
    safeMarginExplanation: string;
    waveArrivalTime: string;
    totalAssemblyTime: string;
    assemblyMusterTime: string;
    transitTime: string;
    demographics: string;
    elderly: string;
    schools: string;
    adults: string;
    livestock: string;
    refugePoint: string;
    elevationGain: string;
    trailDistance: string;
    trailSlope: string;
    statusSafe: string;
    statusMarginal: string;
    statusCritical: string;
    recommendationSafe: string;
    recommendationMarginal: string;
    recommendationCritical: string;
    toggleLivestock: string;
    toggleLivestockDesc: string;
    toggleWeather: string;
    toggleWeatherDesc: string;
    toggleAssist: string;
    toggleAssistDesc: string;
    runSimulation: string;
    pauseSimulation: string;
    resetSimulation: string;
    selectVillage: string;
    addCustomVillage: string;
    exportReport: string;
    safeWindowSurplus: string;
    criticalDeficit: string;
  };
  citizen: {
    title: string;
    badge: string;
    description: string;
    urgentNotice: string;
    safeActionProtocol: string;
    hotlineTitle: string;
    sightingReportTitle: string;
    sightingReportDesc: string;
    submitReport: string;
    reportedSuccess: string;
    offlineNotice: string;
    listenAdvisory: string;
    stopAudio: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'GLACIERGUARD AI',
    tagline: 'Detect the danger at its source. Predict its path. Save lives before it arrives.',
    riskLevel: 'RISK',
    riskBands: {
      LOW: 'LOW',
      MODERATE: 'MODERATE',
      HIGH: 'HIGH',
      CRITICAL: 'CRITICAL',
    },
    navbar: {
      earlyWarning: 'Early Warning & Impact',
      sirenReady: 'Siren Ready',
      sirenActive: 'Siren Active!',
      sirenMuted: 'Muted',
      resetBaseline: 'Reset Baseline',
      citizenMode: 'Citizen Mode',
      commandMode: 'Command Center',
      language: 'Language',
      quickSwitch: 'Role',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
    tabs: {
      monitor: '1. Monitor & Ingest',
      classify: '2. Detect & Classify',
      predict: '3. Debris Flow Physics',
      map: '4. Valley Impact Map',
      warn: '5. Warn & Evacuate',
      satellite: '6. Satellite Case Study',
      community: 'Community & Assembly Calc',
    },
    calculator: {
      title: 'Evacuation Assembly Time Calculator',
      subtitle: 'Calculate whether vulnerable village populations (elderly, schools, livestock) can reach designated high-ground refuges before the flood wave arrives (t_arrival).',
      safeMarginLabel: 'Safe Margin Window',
      safeMarginExplanation: 'Time remaining between full village assembly at high ground and surge arrival (t_arrival - t_total)',
      waveArrivalTime: 'Wave Arrival Time (t_arrival)',
      totalAssemblyTime: 'Total Evacuation Time (t_total)',
      assemblyMusterTime: 'Muster & Mobilization Delay',
      transitTime: 'Uphill Trail Transit Time',
      demographics: 'Demographic Composition',
      elderly: 'Elderly & Mobility-Impaired',
      schools: 'Schools & Children',
      adults: 'Able-Bodied Adults',
      livestock: 'Livestock / Cattle / Yak',
      refugePoint: 'Designated High-Ground Refuge',
      elevationGain: 'Elevation Gain',
      trailDistance: 'Evacuation Distance',
      trailSlope: 'Average Trail Slope',
      statusSafe: 'SAFE MARGIN WINDOW',
      statusMarginal: 'CRITICAL MARGIN (URGENT)',
      statusCritical: 'INUNDATION DANGER (DEFICIT)',
      recommendationSafe: 'Safe margin verified. Order immediate, orderly uphill movement along designated paved ridge trail.',
      recommendationMarginal: 'Urgent margin! Mobilize volunteer teams immediately. Untether and abandon livestock to prevent community bottleneck.',
      recommendationCritical: 'Negative evacuation margin! Flood wave arrives before high-ground refuge can be reached. Trigger Vertical Evacuation to top floor/roof of reinforced concrete structures!',
      toggleLivestock: 'Include Livestock Evacuation',
      toggleLivestockDesc: 'Herding livestock adds 15-20 min muster and slows trail speed to ~1.8 km/h',
      toggleWeather: 'Night Time / Monsoon Downpour',
      toggleWeatherDesc: 'Low visibility and mud adds +30% transit delay on mountain tracks',
      toggleAssist: 'Panchayat Volunteer Assisted Mobility Corps',
      toggleAssistDesc: 'Dedicated youth teams assist elderly with stretchers (+35% faster mobility)',
      runSimulation: 'Run Evacuation Timeline Drill',
      pauseSimulation: 'Pause Drill',
      resetSimulation: 'Reset Timeline',
      selectVillage: 'Select Valley Settlement',
      addCustomVillage: 'Test Custom Hamlet',
      exportReport: 'Export Village Action Sheet',
      safeWindowSurplus: 'SURPLUS WINDOW',
      criticalDeficit: 'DEFICIT (INUNDATION RISK)',
    },
    citizen: {
      title: 'Citizen Community Safety Portal',
      badge: 'Community Protection Mode',
      description: 'Simplified, high-contrast disaster advisories, verified safe refuge locations, and village evacuation assembly calculations for Teesta valley residents.',
      urgentNotice: 'Emergency Notice for Downstream Residents',
      safeActionProtocol: '3-Step Life Safety Action Protocol',
      hotlineTitle: '24/7 Valley Emergency Distress Helplines',
      sightingReportTitle: 'Report Upstream Hazard Observation',
      sightingReportDesc: 'Notice muddy water, abnormal river roars, or moraine cracks? Submit an immediate field observation to emergency commanders.',
      submitReport: 'Transmit Field Observation',
      reportedSuccess: 'Observation transmitted to NDMA Incident Command!',
      offlineNotice: 'Works offline via LoRa acoustic siren mesh even when cellular towers fail.',
      listenAdvisory: 'Listen to Voice Advisory',
      stopAudio: 'Stop Audio',
    },
  },
  hi: {
    appName: 'ग्लेशियरगार्ड AI',
    tagline: 'खतरे को उसके स्रोत पर पहचानें। उसके मार्ग का पूर्वानुमान लगाएं। समय रहते जीवन बचाएं।',
    riskLevel: 'जोखिम',
    riskBands: {
      LOW: 'सामान्य',
      MODERATE: 'मध्यम',
      HIGH: 'उच्च',
      CRITICAL: 'अत्यधिक खतरा',
    },
    navbar: {
      earlyWarning: 'पूर्व चेतावनी एवं प्रभाव',
      sirenReady: 'सायरन तैयार',
      sirenActive: 'सायरन सक्रिय!',
      sirenMuted: 'मौन',
      resetBaseline: 'सामान्य स्थिति पर लाएं',
      citizenMode: 'नागरिक मोड',
      commandMode: 'कमांड सेंटर',
      language: 'भाषा',
      quickSwitch: 'भूमिका',
      signIn: 'लॉग इन करें',
      signOut: 'लॉग आउट',
    },
    tabs: {
      monitor: '1. सेंसर निगरानी',
      classify: '2. खतरा वर्गीकरण (AI)',
      predict: '3. मलबे का भौतिक विज्ञान',
      map: '4. घाटी बाढ़ प्रभाव मानचित्र',
      warn: '5. चेतावनी एवं निकासी',
      satellite: '6. उपग्रह अध्ययन',
      community: 'सामुदायिक एवं निकासी कैलकुलेटर',
    },
    calculator: {
      title: 'ग्राम निकासी एवं सभा समय कैलकुलेटर',
      subtitle: 'गणना करें कि क्या ग्रामीण आबादी (बुजुर्ग, स्कूल के बच्चे, मवेशी) बाढ़ की लहर पहुंचने (t_arrival) से पहले सुरक्षित ऊंचाई पर पहुंच सकती है।',
      safeMarginLabel: 'सुरक्षित समय अंतराल (सेफ मार्जिन)',
      safeMarginExplanation: 'बाढ़ की लहर आने और सुरक्षित स्थल पर पहुंचने के बीच शेष जीवन-रक्षक समय (t_arrival - t_total)',
      waveArrivalTime: 'बाढ़ लहर आगमन समय (t_arrival)',
      totalAssemblyTime: 'कुल निकासी समय (t_total)',
      assemblyMusterTime: 'सभा एवं तैयारी में लगा समय',
      transitTime: 'ऊंचाई की ओर चलने में लगा समय',
      demographics: 'जनसांख्यिकीय संरचना',
      elderly: 'बुजुर्ग एवं असहाय नागरिक',
      schools: 'स्कूल के बच्चे एवं छात्र',
      adults: 'सक्षम वयस्क नागरिक',
      livestock: 'मवेशी / याक / गाय-बैल',
      refugePoint: 'निर्धारित सुरक्षित उच्च शरण स्थल',
      elevationGain: 'ऊंचाई की चढ़ाई',
      trailDistance: 'निकासी मार्ग की दूरी',
      trailSlope: 'पहाड़ी रास्ते की ढलान',
      statusSafe: 'सुरक्षित समय अंतराल (पर्याप्त समय)',
      statusMarginal: 'अत्यंत संवेदनशील समय (तत्काल निकासी)',
      statusCritical: 'खतरनाक स्थिति (पैदल निकासी असंभव)',
      recommendationSafe: 'पर्याप्त सुरक्षित समय उपलब्ध है। पूर्व-निर्धारित पक्के रास्ते से शांत रहकर ऊंचाई की ओर प्रस्थान करें।',
      recommendationMarginal: 'अत्यंत कम समय शेष है! स्वयंसेवकों को तुरंत लगाएं। मवेशियों को खोल दें और मानवीय जीवन को प्राथमिकता दें।',
      recommendationCritical: 'नकारात्मक समय! बाढ़ की लहर शरण स्थल पहुंचने से पहले आ जाएगी। तुरंत पक्के कंक्रीट मकानों की छत पर चढ़ें (वर्टिकल निकासी)!',
      toggleLivestock: 'मवेशियों को साथ ले जाना',
      toggleLivestockDesc: 'मवेशियों को इकट्ठा करने में 15-20 मिनट लगते हैं और चाल 1.8 किमी/घंटा तक धीमी हो जाती है',
      toggleWeather: 'रात का समय / भारी मानसूनी बारिश',
      toggleWeatherDesc: 'अंधेरे और कीचड़ के कारण पहाड़ी पगडंडियों पर 30% अतिरिक्त समय लगता है',
      toggleAssist: 'पंचायत युवा सहायता दल (स्ट्रेचर)',
      toggleAssistDesc: 'युवा स्वयंसेवक बुजुर्गों को स्ट्रेचर द्वारा सुरक्षित निकालने में मदद करते हैं (35% तेज)',
      runSimulation: 'निकासी अभ्यास सिमुलेशन चलाएं',
      pauseSimulation: 'अभ्यास रोकें',
      resetSimulation: 'समय रीसेट करें',
      selectVillage: 'घाटी का गांव चुनें',
      addCustomVillage: 'नया गांव जोड़ें',
      exportReport: 'गांव निकासी कार्य-योजना प्रिंट करें',
      safeWindowSurplus: 'अतिरिक्त सुरक्षित समय',
      criticalDeficit: 'समय की कमी (डूबने का खतरा)',
    },
    citizen: {
      title: 'नागरिक सामुदायिक सुरक्षा पोर्टल',
      badge: 'सामुदायिक सुरक्षा मोड',
      description: 'तीस्ता घाटी के निवासियों के लिए सरल, स्पष्ट आपदा निर्देश, सत्यापित सुरक्षित शरण स्थल और निकासी कैलकुलेटर।',
      urgentNotice: 'निचली घाटी के नागरिकों के लिए आवश्यक चेतावनी',
      safeActionProtocol: '3-चरणीय जीवन रक्षा निर्देश',
      hotlineTitle: '24/7 आपातकालीन आपदा हेल्पलाइन नंबर',
      sightingReportTitle: 'नदी या झील में असामान्य हलचल की सूचना दें',
      sightingReportDesc: 'क्या आपने नदी में मटमैला पानी, तेज गड़गड़ाहट या दरारें देखी हैं? तुरंत आपदा नियंत्रण कक्ष को सूचित करें।',
      submitReport: 'सूचना तुरंत भेजें',
      reportedSuccess: 'आपकी सूचना आपदा प्रबंधन केंद्र को प्राप्त हो गई है!',
      offlineNotice: 'मोबाइल नेटवर्क ठप होने पर भी स्वतंत्र सायरन और लोरा मेश द्वारा संचालित।',
      listenAdvisory: 'ऑडियो चेतावनी सुनें',
      stopAudio: 'ऑडियो बंद करें',
    },
  },
  ne: {
    appName: 'ग्लेशियरगार्ड AI',
    tagline: 'खतरालाई यसको स्रोतमा पहिचान गर्नुहोस्। मार्गको पूर्वानुमान गर्नुहोस्। जीवन बचाउनुहोस्।',
    riskLevel: 'जोखिम',
    riskBands: {
      LOW: 'सामान्य',
      MODERATE: 'मध्यम',
      HIGH: 'उच्च',
      CRITICAL: 'चरम खतरा',
    },
    navbar: {
      earlyWarning: 'पूर्व चेतावनी र प्रभाव',
      sirenReady: 'साइरन तयार',
      sirenActive: 'साइरन सक्रिय!',
      sirenMuted: 'मौन',
      resetBaseline: 'सामान्य अवस्थामा फर्काउनुहोस्',
      citizenMode: 'नागरिक मोड',
      commandMode: 'कमान्ड सेन्टर',
      language: 'भाषा',
      quickSwitch: 'भूमिका',
      signIn: 'लग-इन गर्नुहोस्',
      signOut: 'लग-आउट',
    },
    tabs: {
      monitor: '1. सेन्सर अनुगमन',
      classify: '2. जोखिम वर्गीकरण (AI)',
      predict: '3. गेग्रान बहाव भौतिकी',
      map: '4. उपत्यका बाढी नक्सा',
      warn: '5. चेतावनी र उद्धार',
      satellite: '6. उपग्रह केस अध्ययन',
      community: 'सामुदायिक तथा उद्धार क्याल्कुलेटर',
    },
    calculator: {
      title: 'गाउँ सुरक्षित स्थान पुग्ने समय क्याल्कुलेटर',
      subtitle: 'गाउँका बासिन्दा (ज्येष्ठ नागरिक, विद्यालयका बालबालिका, चौपाया) बाढीको छाल आउनु अघि (t_arrival) सुरक्षित डाँडामा पुग्न सक्छन् कि सक्दैनन् गणना गर्नुहोस्।',
      safeMarginLabel: 'सुरक्षित समय अन्तर (सेफ मार्जिन)',
      safeMarginExplanation: 'बाढीको छाल आइपुग्नु र सम्पूर्ण गाउँले सुरक्षित डाँडामा पुग्नु बीचको बाँकी समय (t_arrival - t_total)',
      waveArrivalTime: 'बाढी छाल आइपुग्ने समय (t_arrival)',
      totalAssemblyTime: 'कुल उद्धार समय (t_total)',
      assemblyMusterTime: 'तयारी तथा जम्मा हुन लाग्ने समय',
      transitTime: 'डाँडा उक्लन लाग्ने समय',
      demographics: 'जनसाङ्ख्यिकीय विवरण',
      elderly: 'ज्येष्ठ नागरिक तथा अशक्त',
      schools: 'विद्यालय तथा बालबालिका',
      adults: 'सक्षम युवा तथा वयस्क',
      livestock: 'चौपाया / याक / गाईवस्तु',
      refugePoint: 'तोकिएको सुरक्षित अग्लो स्थान',
      elevationGain: 'उचाइको चढाइ',
      trailDistance: 'उद्धार बाटोको दूरी',
      trailSlope: 'पहाडी बाटोको भिरालोपन',
      statusSafe: 'सुरक्षित समय उपलब्ध (सुरक्षित)',
      statusMarginal: 'अत्यन्तै संवेदनशील समय (तुरुन्त हिंड्नुहोस्)',
      statusCritical: 'बाढीको जोखिम (पैदल पुग्न असम्भव)',
      recommendationSafe: 'पर्याप्त सुरक्षित समय बाँकी छ। तोकिएको पक्की बाटो हुँदै व्यवस्थित रूपमा डाँडामा जानुहोस्।',
      recommendationMarginal: 'समय धेरै कम छ! स्वयंसेवक तुरुन्त परिचालन गर्नुहोस्। गाईवस्तु फुकाएर छोड्नुहोस्, मानिसको ज्यान बचाउनुहोस्।',
      recommendationCritical: 'समय पुग्दैन! शरणस्थल पुग्नु अगावै बाढी आइपुग्नेछ। तुरुन्तै पक्की घरको छतमाथि उक्लिनुहोस् (भर्टिकल उद्धार)!',
      toggleLivestock: 'गाईवस्तु सँगै लैजाने',
      toggleLivestockDesc: 'गाईवस्तु बटुल्न १५-२० मिनेट लाग्छ र हिंडाइ १.८ किमी/घण्टामा झर्छ',
      toggleWeather: 'रातको समय / मुसलधारे वर्षा',
      toggleWeatherDesc: 'अध्यारो र हिलोका कारण पहाडी गोरेटोमा ३०% ढिलो हुन्छ',
      toggleAssist: 'पञ्चायत युवा सहयोगी टोली (स्ट्रेचर)',
      toggleAssistDesc: 'युवाहरूले ज्येष्ठ नागरिकलाई स्ट्रेचरमा बोकेर लैजान्छन् (३५% छिटो)',
      runSimulation: 'उद्धार अभ्यास सिमुलेशन चलाउनुहोस्',
      pauseSimulation: 'अभ्यास रोक्नुहोस्',
      resetSimulation: 'समय पुनः सुरु गर्नुहोस्',
      selectVillage: 'उपत्यकाको गाउँ छान्नुहोस्',
      addCustomVillage: 'नयाँ गाउँ परीक्षण गर्नुहोस्',
      exportReport: 'गाउँ कार्य-योजना छाप्नुहोस्',
      safeWindowSurplus: 'बचत समय (सुरक्षित)',
      criticalDeficit: 'समयको अभाव (डुबान खतरा)',
    },
    citizen: {
      title: 'नागरिक सामुदायिक सुरक्षा पोर्टल',
      badge: 'सामुदायिक सुरक्षा मोड',
      description: 'टिस्टा उपत्यकाका बासिन्दाहरूको लागि सरल, स्पष्ट विपद् सल्लाह, सुरक्षित स्थानहरू र गाउँ उद्धार क्याल्कुलेटर।',
      urgentNotice: 'तल्लो उपत्यकाका बासिन्दाहरूका लागि जरुरी सूचना',
      safeActionProtocol: '३-चरणे जीवन रक्षा नियम',
      hotlineTitle: '२४/७ आपत्कालीन उद्धार हटलाइन नम्बरहरू',
      sightingReportTitle: 'खोला वा तालमा देखिएको अनौठो अवस्था रिपोर्ट गर्नुहोस्',
      sightingReportDesc: 'खोलामा धमिलो पानी, ठूलो गर्जन वा जमिन चिरा परेको देख्नुभयो? तुरुन्तै विपद् नियन्त्रण कक्षमा खबर गर्नुहोस्।',
      submitReport: 'खबर तुरुन्त पठाउनुहोस्',
      reportedSuccess: 'तपाईंको सूचना विपद् व्यवस्थापन केन्द्रमा पुग्यो!',
      offlineNotice: 'मोबाइल नेटवर्क नहुँदा पनि स्थानीय साइरन र लोरा मेशबाट काम गर्दछ।',
      listenAdvisory: 'आवाजमा सूचना सुन्नुहोस्',
      stopAudio: 'अडियो बन्द गर्नुहोस्',
    },
  },
  bn: {
    appName: 'গ্লেশিয়ারগার্ড AI',
    tagline: 'বিপদের উৎস চিহ্নিত করুন। গতিপথের পূর্বাভাস দিন। সময়ের পূর্বে জীবন বাঁচান।',
    riskLevel: 'ঝুঁকি',
    riskBands: {
      LOW: 'স্বাভাবিক',
      MODERATE: 'মাঝারি',
      HIGH: 'উচ্চ ঝুঁকি',
      CRITICAL: 'চরম বিপদ',
    },
    navbar: {
      earlyWarning: 'পূর্বাভাস ও প্রভাব',
      sirenReady: 'সাইরেন প্রস্তুত',
      sirenActive: 'সাইরেন সক্রিয়!',
      sirenMuted: 'নিঃশব্দ',
      resetBaseline: 'স্বাভাবিক অবস্থায় ফেরান',
      citizenMode: 'নাগরিক মোড',
      commandMode: 'কমান্ড সেন্টার',
      language: 'ভাষা',
      quickSwitch: 'ভূমিকা',
      signIn: 'লগ ইন করুন',
      signOut: 'লগ আউট',
    },
    tabs: {
      monitor: '১. সেন্সর পর্যবেক্ষণ',
      classify: '২. বিপদ শ্রেণিবিভাগ (AI)',
      predict: '৩. ধ্বংসাবশেষের পদার্থবিজ্ঞান',
      map: '৪. উপত্যকা বন্যা মানচিত্র',
      warn: '৫. সতর্কতা ও স্থানান্তর',
      satellite: '৬. স্যাটেলাইট স্টাডি',
      community: 'কমিউনিটি ও স্থানান্তর ক্যালকুলেটর',
    },
    calculator: {
      title: 'গ্রাম স্থানান্তর ও সমাবেশ সময় ক্যালকুলেটর',
      subtitle: 'গণনা করুন যে গ্রামের বাসিন্দারা (বয়োবৃদ্ধ, স্কুল পড়ুয়া, গৃহপালিত পশু) বন্যার ঢেউ আসার আগে (t_arrival) নিরাপদ উঁচু আশ্রয়ে পৌঁছাতে পারবে কিনা।',
      safeMarginLabel: 'নিরাপদ সময়ের ব্যবধান (সেফ মার্জিন)',
      safeMarginExplanation: 'বন্যার ঢেউ আসা এবং নিরাপদ আশ্রয়ে পৌঁছানোর মধ্যবর্তী জীবন রক্ষাকারী সময় (t_arrival - t_total)',
      waveArrivalTime: 'বন্যার ঢেউ পৌঁছানোর সময় (t_arrival)',
      totalAssemblyTime: 'মোট স্থানান্তর সময় (t_total)',
      assemblyMusterTime: 'প্রস্তুতি ও সমবেত হওয়ার সময়',
      transitTime: 'উঁচু পাহাড়ে ওঠার সময়',
      demographics: 'জনসংখ্যার বিন্যাস',
      elderly: 'বয়োবৃদ্ধ ও শারীরিক প্রতিবন্ধী',
      schools: 'স্কুল শিক্ষার্থী ও শিশু',
      adults: 'সক্ষম প্রাপ্তবয়স্ক',
      livestock: 'গৃহপালিত পশু / গবাদি পশু',
      refugePoint: 'নির্দিষ্ট নিরাপদ উঁচু আশ্রয়কেন্দ্র',
      elevationGain: 'উচ্চতা বৃদ্ধি',
      trailDistance: 'স্থানান্তর পথের দূরত্ব',
      trailSlope: 'পাহাড়ি রাস্তার ঢাল',
      statusSafe: 'নিরাপদ সময়সীমা (পর্যাপ্ত সময়)',
      statusMarginal: 'সংকটপূর্ণ সময় (জরুরি পদক্ষেপ)',
      statusCritical: 'বিপজ্জনক অবস্থা (পায়ে হেঁটে অসম্ভব)',
      recommendationSafe: 'পর্যাপ্ত সময় রয়েছে। নির্দিষ্ট পাকা পথ ধরে সুশৃঙ্খলভাবে উঁচু পাহাড়ের আশ্রয়ে যান।',
      recommendationMarginal: 'খুব কম সময় বাকি! স্বেচ্ছাসেবকদের নামান। গবাদি পশুর বাঁধন খুলে দিন এবং মানুষের জীবন অগ্রাধিকার দিন।',
      recommendationCritical: 'নেতিবাচক মার্জিন! আশ্রয়ে পৌঁছানোর আগেই ঢেউ আছড়ে পড়বে। অবিলম্বে পাকা কংক্রিট বাড়ির ছাদে আশ্রয় নিন (ভার্টিকাল এভাকুয়েশন)!',
      toggleLivestock: 'গৃহপালিত পশু সাথে নেওয়া',
      toggleLivestockDesc: 'পশু জড়ো করতে ১৫-২০ মিনিট লাগে এবং গতি ১.৮ কিমি/ঘণ্টায় নেমে আসে',
      toggleWeather: 'রাত্রিকালীন সময় / ভারী বর্ষণ',
      toggleWeatherDesc: 'অন্ধকার ও কাদায় পাহাড়ি রাস্তায় ৩০% অতিরিক্ত সময় লাগে',
      toggleAssist: 'পঞ্চায়েত স্বেচ্ছাসেবক স্ট্রেচার দল',
      toggleAssistDesc: 'যুব স্বেচ্ছাসেবকরা বয়স্কদের স্ট্রেচারে দ্রুত স্থানান্তরে সাহায্য করে (৩৫% দ্রুত)',
      runSimulation: 'স্থানান্তর অনুশীলন সিমুলেশন চালান',
      pauseSimulation: 'অনুশীলন থামান',
      resetSimulation: 'সময় পুনরায় শুরু করুন',
      selectVillage: 'উপত্যকার গ্রাম নির্বাচন করুন',
      addCustomVillage: 'নতুন গ্রাম পরীক্ষা করুন',
      exportReport: 'গ্রামের কর্মপরিকল্পনা প্রিন্ট করুন',
      safeWindowSurplus: 'উদ্বৃত্ত সময় (নিরাপদ)',
      criticalDeficit: 'সময়ের ঘাটতি (ডুবে যাওয়ার ঝুঁকি)',
    },
    citizen: {
      title: 'নাগরিক ও কমিউনিটি সুরক্ষা পোর্টাল',
      badge: 'কমিউনিটি সুরক্ষা মোড',
      description: 'তিস্তা উপত্যকার বাসিন্দাদের জন্য সহজবোধ্য জরুরি সতর্কতা, নির্ভরযোগ্য আশ্রয়কেন্দ্র এবং স্থানান্তর ক্যালকুলেটর।',
      urgentNotice: 'ভাটি অঞ্চলের নাগরিকদের জন্য জরুরি নির্দেশিকা',
      safeActionProtocol: '৩-ধাপের জীবন রক্ষা নির্দেশাবলী',
      hotlineTitle: '২৪/৭ জরুরি হেল্পলাইন নম্বর',
      sightingReportTitle: 'নদী বা হ্রদে অস্বাভাবিক পরিস্থিতি জানান',
      sightingReportDesc: 'ঘোলা জল, তীব্র গর্জন বা ফাটল লক্ষ্য করেছেন? অবিলম্বে জরুরি নিয়ন্ত্রণ কক্ষে রিপোর্ট পাঠান।',
      submitReport: 'তথ্য অবিলম্বে পাঠান',
      reportedSuccess: 'আপনার তথ্য দুর্যোগ ব্যবস্থাপনা কেন্দ্রে পাঠানো হয়েছে!',
      offlineNotice: 'মোবাইল নেটওয়ার্ক বিচ্ছিন্ন হলেও স্থানীয় সাইরেন ও লোরা মেশ প্রযুক্তির মাধ্যমে সক্রিয়।',
      listenAdvisory: 'ভয়েস সতর্কতা শুনুন',
      stopAudio: 'অডিও বন্ধ করুন',
    },
  },
};
