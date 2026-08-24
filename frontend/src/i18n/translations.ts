export type Language = 'hi' | 'en' | 'as';

export const translations = {
  en: {
    // Brand & Header
    appTitle: 'NER Landslide',
    appSubtitle: 'Monitoring System (PRAHARI)',
    hubTitle: 'Meghalaya & Northeast Disaster Command Hub',
    adminRole: 'Admin - District Control Room',
    citizenRole: 'Citizen - East Khasi Hills',
    volunteerRole: 'Ground Team 04',
    earlyWarningSavesLives: 'Early Warning Saves Lives',
    bePrepared: 'Be prepared, be safe!',

    // Portals
    authorityPortal: 'Authority Command',
    villagerPortal: 'Villagers Portal',
    volunteerPortal: 'Volunteer Console',

    // Workflow Stages
    predict: 'PREDICT (AI & Soil)',
    warn: 'WARN (Sirens & SMS)',
    route: 'ROUTE (Safe Detour)',
    evacuate: 'EVACUATE (Shelters)',
    account: 'ACCOUNT (Household Check)',
    rescue: 'RESCUE (Prioritized)',

    // Alerts
    highRiskAlertBanner: 'High Landslide Risk Alert for 3 Districts (East Khasi Hills, West Jaintia Hills, Ri Bhoi)',
    simulateDisasterBtn: '⚡ SIMULATE DISASTER EVENT (INDIA)',
    simulatingDisaster: 'Simulating Cloudburst Landslide...',
    viewAlerts: 'View Alerts',
    viewDetails: 'View Details',

    // Overview & Gauges
    overallRiskOverview: 'Overall Risk Overview',
    totalAreas: 'Total Areas',
    districtsAtHighRisk: 'Districts at High Risk',
    viewAllDistricts: 'View All Districts',
    critical: 'Critical (>85%)',
    high: 'High (65-85%)',
    medium: 'Medium (40-65%)',
    low: 'Low (<40%)',
    safe: 'Safe Zone',

    // Multi-Channel Dispatch
    multiChannelTitle: 'Multi-Channel Emergency Alert Dispatch Status (Phone + Non-Phone)',
    villageSirens: 'Village Sirens',
    sirensActive: '🚨 8 Towers Sounding',
    loudspeakers: 'Loudspeakers',
    loudspeakersActive: '📢 Broadcast Active',
    panchayatVans: 'Panchayat Vans',
    vansActive: '🚐 4 Patrols Deployed',
    citizenSmsApp: 'Citizen SMS & App',
    smsActive: '📱 11,400 Pushes Sent',

    // Evacuation Accountability
    evacuationAccountability: 'Evacuation Accountability (Estimated vs Confirmed)',
    estimatedPop: 'Total Estimated',
    confirmedSafe: 'Confirmed Safe',
    unconfirmedAtRisk: 'Unconfirmed (At Risk)',
    accountabilityFootnote: '*Verified via volunteer offline door-to-door registry and shelter check-ins.',

    // Rescue Priority
    rescuePriorityQueue: 'Rescue Priority Deployment Queue (Where to Send Teams First)',
    actionRequired: 'Action Required',
    accessFullConsole: 'Access Full Rescue Operations Console',

    // Live Telemetry
    liveEnvironmentalTelemetry: 'Live Environmental Telemetry (OpenWeatherMap)',
    liveRadar: 'Live Meteorological Station',
    rainfall: 'Rainfall',
    soilSaturation: 'Soil Saturation',
    windSpeed: 'Wind Speed',
    aiDisclaimer: 'AI Risk calculates slope shear friction & hydrology probability.',

    // Cameras & Actions
    liveCameras: 'Live Highway Camera Feeds & Ground Verification',
    sendAlert: 'Send Alert',
    downloadReport: 'Download Report',
    contactTeams: 'Contact Teams',

    // Villager Portal
    namaste: 'Namaste!',
    citizenSafetyPortal: 'Citizen Safety Portal',
    staySafeAlert: 'Stay safe, stay alert • East Khasi Hills Hub',
    highLandslideRiskArea: '🚨 HIGH LANDSLIDE RISK in your area',
    avoidHighSlopes: 'Avoid high slopes • Follow official evacuation instructions • Move away from mountain drainage valleys',
    viewSafetyInstructions: 'View Safety Instructions',
    evacuationInformation: 'Evacuation Information',
    autoCalculatedRoute: 'Auto-calculated safe path bypassing blocked roads',
    nearestSafeShelter: 'Nearest Safe Shelter',
    govtSchoolCamp: 'Govt. High School Relief Camp',
    openSpotsAvailable: 'Open (380 spots available)',
    estimatedWalkingTime: 'Estimated Walking Time',
    walkingTimeVal: '15 min (1.2 km)',
    viaLinkRoad: 'Via Village Link Arterial',
    turnByTurnGuidance: 'Turn-by-Turn Guidance',
    viewRouteMap: 'View Route Map',
    iAmSafe: 'I Am Safe',
    confirmed: '✓ Confirmed Safe',
    reportHazard: 'Report Hazard',
    roadStatus: 'Road Status',
    shelters: 'Shelters',
    alerts: 'Alerts',
    helpline: 'Helpline 108',
    communityUpdate: 'Community Update',
    familiesEvacuated: '320 families evacuated from Upper Village',

    // Volunteer Portal
    volunteerOpsTitle: 'Field Volunteer Operations',
    groundTeamConsole: 'Ground Team Console',
    onlineSyncActive: '🟢 Online Sync Active',
    offlineMode: 'Offline Mode',
    monitoredSector: 'Monitored Sector',
    sectorEvacProgress: 'Sector Evacuation Progress',
    assignedShelter: 'Assigned Shelter',
    householdChecklist: 'Household Evacuation Checklist',
    householdsLogged: 'Households Logged',
    submitFieldReport: 'Submit Mountain Field Report',
    observationType: 'Observation Type',
    fieldDesc: 'Field Observation Description',
    broadcastReport: 'Broadcast Field Report',

    // Map
    searchMapPlaceholder: 'Search city/village in India (e.g. Shillong, Gangtok, Mawsynram)...',
    locateMe: 'Locate Me',
    satellite: 'Satellite',
    street: 'Street',
    optimalShelter: 'Optimal Safe Shelter',
    bypassesBlockedRoad: 'Bypasses Blocked NH-106',
    switchAlternateShelter: 'Switch Alternate Safe Shelter:',
    calculateRouteBtn: 'Calculate Route to Safest Shelter'
  },

  hi: {
    // Brand & Header (हिंदी)
    appTitle: 'प्रहरी (PRAHARI)',
    appSubtitle: 'पूर्वोत्तर भारत भूस्खलन पूर्व चेतावनी प्रणाली',
    hubTitle: 'मेघालय एवं पूर्वोत्तर आपदा नियंत्रण कमान केंद्र',
    adminRole: 'प्रशासक - जिला आपदा नियंत्रण कक्ष',
    citizenRole: 'नागरिक - पूर्वी खासी हिल्स',
    volunteerRole: 'क्षेत्रीय राहत दल 04',
    earlyWarningSavesLives: 'पूर्व चेतावनी से बचती हैं जानें',
    bePrepared: 'सतर्क रहें, सुरक्षित रहें!',

    // Portals
    authorityPortal: 'प्राधिकरण नियंत्रण कक्ष',
    villagerPortal: 'नागरिक सुरक्षा पोर्टल',
    volunteerPortal: 'स्वयंसेवक कंसोल',

    // Workflow Stages
    predict: '1. पूर्वानुमान (AI व मृदा नमी)',
    warn: '2. चेतावनी (सायरन व SMS)',
    route: '3. सुरक्षित मार्ग (Detour)',
    evacuate: '4. निकासी (राहत शिविर)',
    account: '5. परिवार सत्यापन (Accountability)',
    rescue: '6. बचाव प्राथमिकता (NDRF)',

    // Alerts
    highRiskAlertBanner: '3 जिलों (पूर्वी खासी हिल्स, पश्चिम जयंतिया हिल्स, री भोई) हेतु गंभीर भूस्खलन चेतावनी',
    simulateDisasterBtn: '⚡ आपदा अनुकरण (LIVE SIMULATION)',
    simulatingDisaster: 'बादल फटने एवं भूस्खलन का अनुकरण जारी...',
    viewAlerts: 'अलर्ट देखें',
    viewDetails: 'विवरण देखें',

    // Overview & Gauges
    overallRiskOverview: 'कुल भूस्खलन जोखिम अवलोकन',
    totalAreas: 'कुल क्षेत्र',
    districtsAtHighRisk: 'अति संवेदनशील जिले',
    viewAllDistricts: 'सभी जिले देखें',
    critical: 'अति गंभीर संकटकालीन (>85%)',
    high: 'उच्च जोखिम (65-85%)',
    medium: 'मध्यम जोखिम (40-65%)',
    low: 'निम्न जोखिम (<40%)',
    safe: 'सुरक्षित क्षेत्र',

    // Multi-Channel Dispatch
    multiChannelTitle: 'बहु-माध्यम आपातकालीन चेतावनी प्रसारण स्थिति (फोन + गैर-फोन)',
    villageSirens: 'ग्राम सायरन प्रणाली',
    sirensActive: '🚨 8 टावर सक्रिय (Sounding)',
    loudspeakers: 'लाउडस्पीकर प्रसारण',
    loudspeakersActive: '📢 ध्वनि प्रसारण जारी',
    panchayatVans: 'पंचायत प्रचार वाहन',
    vansActive: '🚐 4 वाहन क्षेत्र में तैनात',
    citizenSmsApp: 'नागरिक SMS व मोबाइल संदेश',
    smsActive: '📱 11,400 संदेश प्रेषित',

    // Evacuation Accountability
    evacuationAccountability: 'निकासी जवाबदेही एवं सत्यापन (अनुमानित बनाम सत्यापित)',
    estimatedPop: 'कुल अनुमानित आबादी',
    confirmedSafe: 'सत्यापित सुरक्षित नागरिक',
    unconfirmedAtRisk: 'अपुष्ट नागरिक (जोखिम में)',
    accountabilityFootnote: '*क्षेत्रीय स्वयंसेवकों द्वारा घर-घर सत्यापन एवं राहत शिविर प्रविष्टि द्वारा प्रमाणित।',

    // Rescue Priority
    rescuePriorityQueue: 'राहत एवं बचाव दल प्राथमिकता सूची (NDRF Deployment Queue)',
    actionRequired: 'त्वरित कार्रवाई आवश्यक',
    accessFullConsole: 'पूर्ण बचाव संचालन कंसोल खोलें',

    // Live Telemetry
    liveEnvironmentalTelemetry: 'प्रत्यक्ष मौसम एवं भू-विज्ञान डेटा (OpenWeatherMap)',
    liveRadar: 'प्रत्यक्ष मौसम विज्ञान केंद्र',
    rainfall: 'वर्षा स्तर',
    soilSaturation: 'मृदा नमी संतृप्ति',
    windSpeed: 'वायु गति',
    aiDisclaimer: 'AI मॉडल ढलान घर्षण एवं जल-भूवैज्ञानिक मापदंडों के आधार पर जोखिम की संभावना का आकलन करता है।',

    // Cameras & Actions
    liveCameras: 'प्रत्यक्ष राजमार्ग कैमरा एवं ढलान निगरानी',
    sendAlert: 'अलर्ट भेजें',
    downloadReport: 'रिपोर्ट डाउनलोड करें',
    contactTeams: 'बचाव दल से संपर्क',

    // Villager Portal
    namaste: 'नमस्ते!',
    citizenSafetyPortal: 'नागरिक सुरक्षा एवं निकासी पोर्टल',
    staySafeAlert: 'सुरक्षित रहें, सतर्क रहें • पूर्वी खासी हिल्स',
    highLandslideRiskArea: '🚨 आपके क्षेत्र में गंभीर भूस्खलन का उच्च जोखिम',
    avoidHighSlopes: 'ऊंचे ढलानों से दूर रहें • आधिकारिक निकासी निर्देशों का पालन करें • जल निकासी घाटियों से तत्काल हटें',
    viewSafetyInstructions: 'सुरक्षा निर्देश देखें',
    evacuationInformation: 'आपातकालीन निकासी जानकारी',
    autoCalculatedRoute: 'अवरुद्ध मार्गों से बचते हुए स्वतः निर्धारित सुरक्षित मार्ग',
    nearestSafeShelter: 'निकटतम सुरक्षित राहत शिविर',
    govtSchoolCamp: 'शासकीय उच्चतर माध्यमिक विद्यालय राहत शिविर',
    openSpotsAvailable: 'खुला है (380 स्थान उपलब्ध)',
    estimatedWalkingTime: 'अनुमानित पैदल यात्रा समय',
    walkingTimeVal: '15 मिनट (1.2 किमी)',
    viaLinkRoad: 'ग्राम संपर्क मुख्य मार्ग द्वारा',
    turnByTurnGuidance: 'मार्गदर्शन (Turn-by-Turn)',
    viewRouteMap: 'सुरक्षित मार्ग मानचित्र देखें',
    iAmSafe: 'मैं सुरक्षित हूँ',
    confirmed: '✓ सुरक्षित दर्ज',
    reportHazard: 'खतरा / दरार दर्ज करें',
    roadStatus: 'सड़क मार्ग स्थिति',
    shelters: 'राहत शिविर',
    alerts: 'चेतावनी',
    helpline: 'हेल्पलाइन 108',
    communityUpdate: 'समुदाय स्थिति समाचार',
    familiesEvacuated: 'ऊपरी गांव से 320 परिवारों को सुरक्षित निकाला गया',

    // Volunteer Portal
    volunteerOpsTitle: 'क्षेत्रीय स्वयंसेवक आपदा संचालन केंद्र',
    groundTeamConsole: 'ग्राउंड टीम कंसोल',
    onlineSyncActive: '🟢 ऑनलाइन डेटा सिंक सक्रिय',
    offlineMode: 'ऑफ़लाइन मोड',
    monitoredSector: 'निगरानी क्षेत्र',
    sectorEvacProgress: 'क्षेत्रीय निकासी प्रगति',
    assignedShelter: 'निर्धारित राहत शिविर',
    householdChecklist: 'परिवार सत्यापन चेकलिस्ट (Household Register)',
    householdsLogged: 'परिवार पंजीकृत',
    submitFieldReport: 'पर्वतीय खतरा / दरार रिपोर्ट दर्ज करें',
    observationType: 'खतरे का प्रकार',
    fieldDesc: 'स्थलीय निरीक्षण विवरण',
    broadcastReport: 'रिपोर्ट प्रशासन को भेजें',

    // Map
    searchMapPlaceholder: 'भारत के किसी भी शहर/गांव को खोजें (उदा. शिलांग, गंगटोक, मौसिनराम, शिमला)...',
    locateMe: 'मेरा स्थान पहचानें (GPS)',
    satellite: 'सैटेलाइट (उपग्रह)',
    street: 'मानचित्र (Street)',
    optimalShelter: 'इष्टतम सुरक्षित राहत शिविर',
    bypassesBlockedRoad: 'अवरुद्ध NH-106 से सुरक्षित बचाव मार्ग',
    switchAlternateShelter: 'वैकल्पिक राहत शिविर चुनें:',
    calculateRouteBtn: 'निकटतम सुरक्षित शिविर हेतु मार्ग निकालें'
  },

  as: {
    // Assamese (অসমীয়া)
    appTitle: 'প্ৰহৰী (PRAHARI)',
    appSubtitle: 'উত্তৰ-পূৰ্বাঞ্চল ভূমিস্খলন সতৰ্কতা প্ৰণালী',
    hubTitle: 'মেঘালয় আৰু উত্তৰ-পূৰ্বাঞ্চল দুৰ্যোগ নিয়ন্ত্ৰণ কেন্দ্ৰ',
    adminRole: 'প্ৰশাসক - নিয়ন্ত্ৰণ কক্ষ',
    citizenRole: 'নাগৰিক - পূব খাছী পাহাৰ',
    volunteerRole: 'স্বেচ্ছাসেৱক দল ০৪',
    earlyWarningSavesLives: 'পূৰ্ব সতৰ্কতাই জীৱন ৰক্ষা কৰে',
    bePrepared: 'সতৰ্ক থাকক, সুৰক্ষিত থাকক!',

    // Portals
    authorityPortal: 'প্ৰশাসন নিয়ন্ত্ৰণ কেন্দ্ৰ',
    villagerPortal: 'নাগৰিক সুৰক্ষা প’ৰ্টেল',
    volunteerPortal: 'স্বেচ্ছাসেৱক কনচ’ল',

    // Workflow Stages
    predict: '১. পূৰ্বাভাস (AI)',
    warn: '২. সতৰ্কতা (SMS/ছাইৰেন)',
    route: '৩. সুৰক্ষিত পথ',
    evacuate: '৪. স্থানান্তৰ',
    account: '৫. পৰিয়াল সত্যায়ন',
    rescue: '৬. উদ্ধাৰ অগ্ৰাধিকাৰ',

    // Alerts
    highRiskAlertBanner: '৩ খন জিলাৰ বাবে গুৰুতৰ ভূমিস্খলন সতৰ্কবাৰ্তা',
    simulateDisasterBtn: '⚡ দুৰ্যোগ অনুকৰণ (LIVE SIMULATION)',
    simulatingDisaster: 'অনুকৰণ চলি আছে...',
    viewAlerts: 'সতৰ্কবাৰ্তা চাওক',
    viewDetails: 'বিৱৰণ চাওক',

    // Overview & Gauges
    overallRiskOverview: 'সামগ্ৰিক বিপদাশংকা',
    totalAreas: 'মুঠ অঞ্চল',
    districtsAtHighRisk: 'উচ্চ বিপদাপন্ন জিলা',
    viewAllDistricts: 'সকলো জিলা চাওক',
    critical: 'অতি গুৰুতৰ সংকটকালীন (>85%)',
    high: 'উচ্চ বিপদাশংকা (65-85%)',
    medium: 'মধ্যম বিপদাশংকা (40-65%)',
    low: 'নিম্ন বিপদাশংকা (<40%)',
    safe: 'সুৰক্ষিত অঞ্চল',

    // Multi-Channel Dispatch
    multiChannelTitle: 'বহু-মাধ্যম জৰুৰীকালীন সতৰ্কতা প্ৰচাৰ অৱস্থা',
    villageSirens: 'গাঁও ছাইৰেন ব্যৱস্থা',
    sirensActive: '🚨 ৮ টা টাৱাৰ সক্ৰিয়',
    loudspeakers: 'মাইক প্ৰচাৰ',
    loudspeakersActive: '📢 প্ৰচাৰ চলি আছে',
    panchayatVans: 'পঞ্চায়ত বাহন',
    vansActive: '🚐 ৪ খন বাহন নিয়োজিত',
    citizenSmsApp: 'নাগৰিক SMS বাৰ্তা',
    smsActive: '📱 ১১,৪০০ বাৰ্তা প্ৰেৰণ',

    // Evacuation Accountability
    evacuationAccountability: 'স্থানান্তৰ নিৰীক্ষণ আৰু সত্যায়ন',
    estimatedPop: 'মুঠ আনুমানিক জনসংখ্যা',
    confirmedSafe: 'সুৰক্ষিত নাগৰিক',
    unconfirmedAtRisk: 'অনিশ্চিত নাগৰিক (বিপদত)',
    accountabilityFootnote: '*স্বেচ্ছাসেৱকৰ দ্বাৰা ঘৰে ঘৰে সত্যায়ন কৰা হৈছে।',

    // Rescue Priority
    rescuePriorityQueue: 'উদ্ধাৰকাৰী দল অগ্ৰাধিকাৰ তালিকা (NDRF)',
    actionRequired: 'ক্ষিপ্ৰ ব্যৱস্থা প্ৰয়োজন',
    accessFullConsole: 'সম্পূৰ্ণ উদ্ধাৰ কনচ’ল খোলক',

    // Live Telemetry
    liveEnvironmentalTelemetry: 'প্ৰত্যক্ষ বতৰ আৰু মাটিৰ তথ্য (OpenWeatherMap)',
    liveRadar: 'বতৰ বিজ্ঞান কেন্দ্ৰ',
    rainfall: 'বৰষুণৰ পৰিমাণ',
    soilSaturation: 'মাটিৰ আৰ্দ্ৰতা',
    windSpeed: 'বতাহৰ গতি',
    aiDisclaimer: 'AI মডেলে সম্ভাৱনীয়তা গণনা কৰে।',

    // Cameras & Actions
    liveCameras: 'প্ৰত্যক্ষ কেমেৰা আৰু পথ নিৰীক্ষণ',
    sendAlert: 'সতৰ্কবাৰ্তা পঠিয়াওক',
    downloadReport: 'প্ৰতিবেদন ডাউনলোড',
    contactTeams: 'উদ্ধাৰকাৰী দলৰ সৈতে যোগাযোগ',

    // Villager Portal
    namaste: 'নমস্কাৰ!',
    citizenSafetyPortal: 'নাগৰিক সুৰক্ষা প’ৰ্টেল',
    staySafeAlert: 'সুৰক্ষিত থাকক • পূব খাছী পাহাৰ',
    highLandslideRiskArea: '🚨 আপোনাৰ অঞ্চলত গুৰুতৰ ভূমিস্খলনৰ আশংকা',
    avoidHighSlopes: 'ওখ পাহাৰীয়া ঢালৰ পৰা আঁতৰি থাকক • প্ৰশাসনৰ নিৰ্দেশনা মানি চলক',
    viewSafetyInstructions: 'সুৰক্ষা নিৰ্দেশাৱলী চাওক',
    evacuationInformation: 'স্থানান্তৰ তথ্য',
    autoCalculatedRoute: 'সুৰক্ষিত নিৰ্ধাৰিত পথ',
    nearestSafeShelter: 'নিকটতম আশ্ৰয় শিবিৰ',
    govtSchoolCamp: 'চৰকাৰী উচ্চতৰ মাধ্যমিক বিদ্যালয় শিবিৰ',
    openSpotsAvailable: 'খোলা আছে (৩৮০ স্থান খালি)',
    estimatedWalkingTime: 'আনুমানিক সময়',
    walkingTimeVal: '১৫ মিনিট (১.২ কিমি)',
    viaLinkRoad: 'গাঁৱৰ মূল সংযোগী পথেৰে',
    turnByTurnGuidance: 'পথ নিৰ্দেশনা',
    viewRouteMap: 'সুৰক্ষিত পথৰ মানচিত্ৰ চাওক',
    iAmSafe: 'মই সুৰক্ষিত',
    confirmed: '✓ সুৰক্ষিত',
    reportHazard: 'বিপদৰ খবৰ দিয়ক',
    roadStatus: 'পথৰ অৱস্থা',
    shelters: 'আশ্ৰয় শিবিৰ',
    alerts: 'সতৰ্কবাৰ্তা',
    helpline: 'হেল্পলাইন ১০৮',
    communityUpdate: 'সামাজিক বাৰ্তা',
    familiesEvacuated: '৩২০ টা পৰিয়ালক সুৰক্ষিত স্থানলৈ নিয়া হ’ল',

    // Volunteer Portal
    volunteerOpsTitle: 'স্বেচ্ছাসেৱক দুৰ্যোগ নিয়ন্ত্ৰণ কেন্দ্ৰ',
    groundTeamConsole: 'ফিল্ড কনচ’ল',
    onlineSyncActive: '🟢 অনলাইন ডাটা ছিংক সক্ৰিয়',
    offlineMode: 'অফলাইন ম’ড',
    monitoredSector: 'নিৰীক্ষণ অঞ্চল',
    sectorEvacProgress: 'স্থানান্তৰ অগ্ৰগতি',
    assignedShelter: 'নিৰ্ধাৰিত শিবিৰ',
    householdChecklist: 'পৰিয়াল সত্যায়ন তালিকা',
    householdsLogged: 'পঞ্জীকৃত পৰিয়াল',
    submitFieldReport: 'পাহাৰৰ ফাট বা বিপদৰ খবৰ দিয়ক',
    observationType: 'বিপদৰ প্ৰকাৰ',
    fieldDesc: 'বিৱৰণ',
    broadcastReport: 'প্ৰতিবেদন প্ৰেৰণ কৰক',

    // Map
    searchMapPlaceholder: 'ভাৰতৰ যিকোনো ঠাই সন্ধান কৰক...',
    locateMe: 'মোৰ স্থান (GPS)',
    satellite: 'উপগ্ৰহ চিত্ৰ',
    street: 'মানচিত্ৰ',
    optimalShelter: 'সুৰক্ষিত আশ্ৰয় শিবিৰ',
    bypassesBlockedRoad: 'অৱৰোধ এৰাই যোৱা পথ',
    switchAlternateShelter: 'অন্য শিবিৰ বাছক:',
    calculateRouteBtn: 'সুৰক্ষিত পথ নিৰ্ণয় কৰক'
  }
};
