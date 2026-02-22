/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Global App Context — Theme, Language, Auth, Navigation
 * ============================================================
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService.js';

// ─── Types ───────────────────────────────────────────────────

export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr';
export type Theme = 'light' | 'dark';
export type NavTab = 'home' | 'reports' | 'nearby' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AppContextType {
  // Theme
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  
  // Navigation
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  
  // Auth
  auth: AuthState;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  loginWithOtp: (phone: string, otp: string, name?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isLoading: boolean;
  
  // User Reports
  userReports: any[];
  fetchUserReports: () => Promise<void>;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// ─── Translations ────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reports': 'Reports',
    'nav.nearby': 'Nearby',
    'nav.profile': 'Profile',
    
    // Home
    'home.tagline': 'Secure. Trusted. Anonymous.',
    'home.description': 'Your report is securely saved and forwarded to authorities.',
    'home.reportIssue': 'Report an Issue',
    'home.emergencySOS': 'Emergency SOS',
    'home.officialPlatform': 'Official Platform',
    'home.officialDesc': 'End-to-end encrypted reporting system directly linked with local law enforcement and civic bodies.',
    'home.yourReports': 'Your Reports',
    'home.resolved': 'Resolved',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.loginSuccess': 'Logged in successfully!',
    'auth.signupSuccess': 'Account created successfully!',
    'auth.logout': 'Logout',
    'auth.or': 'or',
    'auth.continueAsGuest': 'Continue as Guest',
    
    // Identity
    'identity.title': 'How would you like to report?',
    'identity.subtitle': 'Choose how you want to be identified in the JAAGRUK - Your Voice system.',
    'identity.withName': 'Report with Name',
    'identity.withNameBadge': 'Recommended for official action',
    'identity.withNameDesc': 'Providing your identity helps authorities validate and process your report faster. Your data is encrypted and legally protected.',
    'identity.anonymous': 'Report Anonymously',
    'identity.anonymousBadge': 'Complete Privacy',
    'identity.anonymousDesc': 'Your personal details will not be stored or visible to anyone. Perfect for sensitive civic issues where you wish to remain unknown.',
    
    // Chat
    'chat.greeting': "Namaste. Welcome to JAAGRUK - Your Voice. I am here to listen and guide you through this process with care. Your safety and privacy are our top priorities.",
    'chat.prompt': "Please describe what happened in your own words. I'm here for as long as you need.",
    'chat.placeholder': 'Tell us more details...',
    'chat.analyzing': 'Analyzing incident...',
    'chat.secure': 'Secure & Confidential • JAAGRUK Trust',
    'chat.attachFile': 'Attach file',
    
    // Location
    'location.search': 'Search area...',
    'location.confirm': 'Confirm Location',
    'location.nearestHub': 'Nearest Reporting Hub',
    'location.selectPoliceStation': 'Select Police Station',
    'location.confirmStation': 'Confirm this police station?',
    
    // Evidence
    'evidence.title': 'Add Evidence',
    'evidence.subtitle': 'Adding visuals helps authorities understand the situation faster.',
    'evidence.takePhoto': 'Take Photo or Video',
    'evidence.takePhotoDesc': 'Use your camera directly',
    'evidence.uploadGallery': 'Upload from Gallery',
    'evidence.uploadGalleryDesc': 'Select from your phone',
    'evidence.continue': 'Continue to Details',
    'evidence.skip': 'Skip for now',
    'evidence.uploading': 'Uploading...',
    
    // Analysis
    'analysis.title': 'Issue Analyzed',
    'analysis.subtitle': 'JAAGRUK Smart Classification',
    'analysis.category': 'Detected Category',
    'analysis.urgency': 'Urgency Level',
    'analysis.routing': 'Your report is being routed to the Priority Emergency Desk.',
    'analysis.confirm': 'Confirm & Alert Authorities',
    
    // Review
    'review.title': 'Check details',
    'review.subtitle': 'Review your report before final submission to the JAAGRUK blockchain.',
    'review.issueType': 'Issue Type',
    'review.description': 'Description',
    'review.commitment': 'JAAGRUK Commitment',
    'review.commitmentDesc': 'By submitting, you acknowledge this report will be officially recorded on the blockchain. False reporting is a punishable offense.',
    'review.submit': 'Submit to JAAGRUK',
    'review.submitting': 'Recording on Blockchain...',
    
    // Confirmation
    'confirmation.title': 'Report Confirmed',
    'confirmation.subtitle': 'Your report has been permanently recorded on the blockchain — it cannot be deleted or altered.',
    'confirmation.referenceId': 'Reference ID',
    'confirmation.verify': 'Verify on Blockchain',
    'confirmation.timeline': 'Status Timeline',
    'confirmation.submitted': 'Report Submitted',
    'confirmation.submittedDesc': 'Blockchain recorded • Tamper-proof',
    'confirmation.underReview': 'Under Review',
    'confirmation.underReviewDesc': 'Officers verifying details.',
    'confirmation.returnHome': 'Return to Home',
    
    // Emergency
    'emergency.title': 'Emergency SOS',
    'emergency.subtitle': 'Help is on the way.',
    'emergency.distance': 'Distance',
    'emergency.eta': 'ETA',
    'emergency.callPolice': 'CALL POLICE (100)',
    'emergency.directions': 'GET DIRECTIONS',
    'emergency.dispatching': 'Dispatching your current coordinates to the station. Please stay in a safe location until help arrives.',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.editProfile': 'Edit Profile',
    'profile.settings': 'Settings',
    'profile.myReports': 'My Reports',
    'profile.pending': 'Pending',
    'profile.inProgress': 'In Progress',
    'profile.resolved': 'Resolved',
    'profile.helpSupport': 'Help & Support',
    'profile.privacyPolicy': 'Privacy Policy',
    'profile.termsOfService': 'Terms of Service',
    'profile.logout': 'Logout',
    
    // Reports List
    'reports.title': 'My Reports',
    'reports.empty': 'No reports yet',
    'reports.emptyDesc': 'Your submitted reports will appear here.',
    'reports.viewDetails': 'View Details',
    'reports.status': 'Status',
    
    // Nearby
    'nearby.title': 'Nearby Stations',
    'nearby.searchArea': 'Search area...',
    'nearby.policeStations': 'Police Stations',
    'nearby.civicOffices': 'Civic Offices',
    'nearby.hospitals': 'Hospitals',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',
    'common.close': 'Close',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
  },
  
  hi: {
    // Navigation
    'nav.home': 'होम',
    'nav.reports': 'रिपोर्ट',
    'nav.nearby': 'पास में',
    'nav.profile': 'प्रोफाइल',
    
    // Home
    'home.tagline': 'सुरक्षित। विश्वसनीय। गुमनाम।',
    'home.description': 'आपकी रिपोर्ट सुरक्षित रूप से सहेजी और अधिकारियों को भेजी जाती है।',
    'home.reportIssue': 'समस्या दर्ज करें',
    'home.emergencySOS': 'आपातकालीन SOS',
    'home.officialPlatform': 'आधिकारिक मंच',
    'home.officialDesc': 'स्थानीय कानून प्रवर्तन और नागरिक निकायों से सीधे जुड़ी एंड-टू-एंड एन्क्रिप्टेड रिपोर्टिंग प्रणाली।',
    'home.yourReports': 'आपकी रिपोर्ट',
    'home.resolved': 'हल किया गया',
    
    // Auth
    'auth.login': 'लॉग इन',
    'auth.signup': 'साइन अप',
    'auth.email': 'ईमेल पता',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.name': 'पूरा नाम',
    'auth.phone': 'फोन नंबर',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.noAccount': 'खाता नहीं है?',
    'auth.hasAccount': 'पहले से खाता है?',
    'auth.loginSuccess': 'सफलतापूर्वक लॉग इन हुआ!',
    'auth.signupSuccess': 'खाता सफलतापूर्वक बनाया गया!',
    'auth.logout': 'लॉग आउट',
    'auth.or': 'या',
    'auth.continueAsGuest': 'अतिथि के रूप में जारी रखें',
    
    // Identity
    'identity.title': 'आप कैसे रिपोर्ट करना चाहेंगे?',
    'identity.subtitle': 'JAAGRUK - Your Voice में अपनी पहचान कैसे रखना चाहते हैं चुनें।',
    'identity.withName': 'नाम के साथ रिपोर्ट करें',
    'identity.withNameBadge': 'आधिकारिक कार्रवाई के लिए अनुशंसित',
    'identity.withNameDesc': 'आपकी पहचान देने से अधिकारियों को आपकी रिपोर्ट को तेज़ी से सत्यापित और संसाधित करने में मदद मिलती है।',
    'identity.anonymous': 'गुमनाम रूप से रिपोर्ट करें',
    'identity.anonymousBadge': 'पूर्ण गोपनीयता',
    'identity.anonymousDesc': 'आपका व्यक्तिगत विवरण किसी को भी संग्रहीत या दिखाई नहीं देगा।',
    
    // Chat
    'chat.greeting': 'नमस्ते। JAAGRUK में आपका स्वागत है। मैं आपकी बात सुनने और इस प्रक्रिया में मार्गदर्शन करने के लिए यहाँ हूँ।',
    'chat.prompt': 'कृपया अपने शब्दों में बताएं क्या हुआ। मैं आपके साथ हूँ।',
    'chat.placeholder': 'अधिक विवरण बताएं...',
    'chat.analyzing': 'घटना का विश्लेषण...',
    'chat.secure': 'सुरक्षित और गोपनीय • JAAGRUK ट्रस्ट',
    'chat.attachFile': 'फाइल जोड़ें',
    
    // Location
    'location.search': 'क्षेत्र खोजें...',
    'location.confirm': 'स्थान की पुष्टि करें',
    'location.nearestHub': 'निकटतम रिपोर्टिंग हब',
    'location.selectPoliceStation': 'पुलिस स्टेशन चुनें',
    'location.confirmStation': 'इस पुलिस स्टेशन की पुष्टि करें?',
    
    // Evidence
    'evidence.title': 'साक्ष्य जोड़ें',
    'evidence.subtitle': 'दृश्य जोड़ने से अधिकारियों को स्थिति को तेज़ी से समझने में मदद मिलती है।',
    'evidence.takePhoto': 'फोटो या वीडियो लें',
    'evidence.takePhotoDesc': 'सीधे अपने कैमरे का उपयोग करें',
    'evidence.uploadGallery': 'गैलरी से अपलोड करें',
    'evidence.uploadGalleryDesc': 'अपने फोन से चुनें',
    'evidence.continue': 'विवरण पर जारी रखें',
    'evidence.skip': 'अभी के लिए छोड़ें',
    'evidence.uploading': 'अपलोड हो रहा है...',
    
    // Analysis
    'analysis.title': 'समस्या का विश्लेषण',
    'analysis.subtitle': 'JAAGRUK स्मार्ट वर्गीकरण',
    'analysis.category': 'पता लगाई गई श्रेणी',
    'analysis.urgency': 'तात्कालिकता स्तर',
    'analysis.routing': 'आपकी रिपोर्ट प्राथमिकता आपातकालीन डेस्क पर भेजी जा रही है।',
    'analysis.confirm': 'पुष्टि करें और अधिकारियों को सूचित करें',
    
    // Review
    'review.title': 'विवरण जांचें',
    'review.subtitle': 'JAAGRUK ब्लॉकचेन पर अंतिम सबमिशन से पहले अपनी रिपोर्ट की समीक्षा करें।',
    'review.issueType': 'समस्या का प्रकार',
    'review.description': 'विवरण',
    'review.commitment': 'JAAGRUK प्रतिबद्धता',
    'review.commitmentDesc': 'सबमिट करके, आप स्वीकार करते हैं कि यह रिपोर्ट आधिकारिक रूप से ब्लॉकचेन पर दर्ज की जाएगी।',
    'review.submit': 'JAAGRUK को सबमिट करें',
    'review.submitting': 'ब्लॉकचेन पर रिकॉर्ड हो रहा है...',
    
    // Confirmation
    'confirmation.title': 'रिपोर्ट पुष्टि',
    'confirmation.subtitle': 'आपकी रिपोर्ट स्थायी रूप से ब्लॉकचेन पर दर्ज हो गई है — इसे हटाया या बदला नहीं जा सकता।',
    'confirmation.referenceId': 'संदर्भ आईडी',
    'confirmation.verify': 'ब्लॉकचेन पर सत्यापित करें',
    'confirmation.timeline': 'स्थिति समयरेखा',
    'confirmation.submitted': 'रिपोर्ट सबमिट',
    'confirmation.submittedDesc': 'ब्लॉकचेन पर दर्ज • छेड़छाड़-रोधी',
    'confirmation.underReview': 'समीक्षाधीन',
    'confirmation.underReviewDesc': 'अधिकारी विवरण सत्यापित कर रहे हैं।',
    'confirmation.returnHome': 'होम पर लौटें',
    
    // Emergency
    'emergency.title': 'आपातकालीन SOS',
    'emergency.subtitle': 'मदद रास्ते में है।',
    'emergency.distance': 'दूरी',
    'emergency.eta': 'अनुमानित समय',
    'emergency.callPolice': 'पुलिस को कॉल करें (100)',
    'emergency.directions': 'दिशाएं प्राप्त करें',
    'emergency.dispatching': 'आपके वर्तमान निर्देशांक स्टेशन को भेजे जा रहे हैं।',
    
    // Profile
    'profile.title': 'मेरा प्रोफाइल',
    'profile.editProfile': 'प्रोफाइल संपादित करें',
    'profile.settings': 'सेटिंग्स',
    'profile.myReports': 'मेरी रिपोर्ट',
    'profile.pending': 'लंबित',
    'profile.inProgress': 'प्रगति पर',
    'profile.resolved': 'हल किया गया',
    'profile.helpSupport': 'सहायता और समर्थन',
    'profile.privacyPolicy': 'गोपनीयता नीति',
    'profile.termsOfService': 'सेवा की शर्तें',
    'profile.logout': 'लॉग आउट',
    
    // Reports List
    'reports.title': 'मेरी रिपोर्ट',
    'reports.empty': 'अभी तक कोई रिपोर्ट नहीं',
    'reports.emptyDesc': 'आपकी सबमिट की गई रिपोर्ट यहां दिखाई देंगी।',
    'reports.viewDetails': 'विवरण देखें',
    'reports.status': 'स्थिति',
    
    // Nearby
    'nearby.title': 'पास के स्टेशन',
    'nearby.searchArea': 'क्षेत्र खोजें...',
    'nearby.policeStations': 'पुलिस स्टेशन',
    'nearby.civicOffices': 'नागरिक कार्यालय',
    'nearby.hospitals': 'अस्पताल',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'कुछ गलत हो गया',
    'common.retry': 'पुनः प्रयास',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.done': 'हो गया',
    'common.close': 'बंद करें',
    'common.copy': 'कॉपी',
    'common.copied': 'कॉपी हो गया!',
  },
  
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.reports': 'রিপোর্ট',
    'nav.nearby': 'কাছাকাছি',
    'nav.profile': 'প্রোফাইল',
    
    // Home
    'home.tagline': 'নিরাপদ। বিশ্বস্ত। বেনামী।',
    'home.description': 'আপনার রিপোর্ট নিরাপদে সংরক্ষিত এবং কর্তৃপক্ষের কাছে পাঠানো হয়।',
    'home.reportIssue': 'সমস্যা রিপোর্ট করুন',
    'home.emergencySOS': 'জরুরি SOS',
    'home.officialPlatform': 'সরকারি প্ল্যাটফর্ম',
    'home.officialDesc': 'স্থানীয় আইন প্রয়োগকারী ও নাগরিক সংস্থার সাথে সরাসরি সংযুক্ত এন্ড-টু-এন্ড এনক্রিপ্টেড রিপোর্টিং সিস্টেম।',
    'home.yourReports': 'আপনার রিপোর্ট',
    'home.resolved': 'সমাধান হয়েছে',
    
    // Auth
    'auth.login': 'লগইন',
    'auth.signup': 'সাইন আপ',
    'auth.email': 'ইমেইল ঠিকানা',
    'auth.password': 'পাসওয়ার্ড',
    'auth.confirmPassword': 'পাসওয়ার্ড নিশ্চিত করুন',
    'auth.name': 'পুরো নাম',
    'auth.phone': 'ফোন নম্বর',
    'auth.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
    'auth.noAccount': 'অ্যাকাউন্ট নেই?',
    'auth.hasAccount': 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    'auth.loginSuccess': 'সফলভাবে লগইন হয়েছে!',
    'auth.signupSuccess': 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
    'auth.logout': 'লগআউট',
    'auth.or': 'অথবা',
    'auth.continueAsGuest': 'অতিথি হিসেবে চালিয়ে যান',
    
    // Identity
    'identity.title': 'আপনি কিভাবে রিপোর্ট করতে চান?',
    'identity.subtitle': 'JAAGRUK - Your Voice এ আপনার পরিচয় কিভাবে রাখতে চান তা বেছে নিন।',
    'identity.withName': 'নাম সহ রিপোর্ট করুন',
    'identity.withNameBadge': 'সরকারি পদক্ষেপের জন্য সুপারিশকৃত',
    'identity.withNameDesc': 'আপনার পরিচয় দিলে কর্তৃপক্ষ দ্রুত আপনার রিপোর্ট যাচাই ও প্রক্রিয়া করতে পারবে।',
    'identity.anonymous': 'বেনামে রিপোর্ট করুন',
    'identity.anonymousBadge': 'সম্পূর্ণ গোপনীয়তা',
    'identity.anonymousDesc': 'আপনার ব্যক্তিগত তথ্য সংরক্ষণ বা প্রদর্শন করা হবে না।',
    
    // Chat
    'chat.greeting': 'নমস্কার। JAAGRUK এ স্বাগতম। আমি আপনার কথা শুনতে এবং এই প্রক্রিয়ায় গাইড করতে এখানে আছি।',
    'chat.prompt': 'অনুগ্রহ করে আপনার ভাষায় বলুন কি হয়েছে। আমি আপনার সাথে আছি।',
    'chat.placeholder': 'আরও বিস্তারিত বলুন...',
    'chat.analyzing': 'ঘটনা বিশ্লেষণ করা হচ্ছে...',
    'chat.secure': 'নিরাপদ ও গোপনীয় • JAAGRUK ট্রাস্ট',
    'chat.attachFile': 'ফাইল সংযুক্ত করুন',
    
    // Location
    'location.search': 'এলাকা খুঁজুন...',
    'location.confirm': 'অবস্থান নিশ্চিত করুন',
    'location.nearestHub': 'নিকটতম রিপোর্টিং হাব',
    'location.selectPoliceStation': 'থানা নির্বাচন করুন',
    'location.confirmStation': 'এই থানা নিশ্চিত করুন?',
    
    // Evidence
    'evidence.title': 'প্রমাণ যোগ করুন',
    'evidence.subtitle': 'ছবি যোগ করলে কর্তৃপক্ষ দ্রুত পরিস্থিতি বুঝতে পারবে।',
    'evidence.takePhoto': 'ফটো বা ভিডিও তুলুন',
    'evidence.takePhotoDesc': 'সরাসরি আপনার ক্যামেরা ব্যবহার করুন',
    'evidence.uploadGallery': 'গ্যালারি থেকে আপলোড করুন',
    'evidence.uploadGalleryDesc': 'আপনার ফোন থেকে নির্বাচন করুন',
    'evidence.continue': 'বিস্তারিতে যান',
    'evidence.skip': 'এখন এড়িয়ে যান',
    'evidence.uploading': 'আপলোড হচ্ছে...',
    
    // Analysis
    'analysis.title': 'সমস্যা বিশ্লেষণ',
    'analysis.subtitle': 'JAAGRUK স্মার্ট শ্রেণীবিভাগ',
    'analysis.category': 'সনাক্তকৃত বিভাগ',
    'analysis.urgency': 'জরুরিতার মাত্রা',
    'analysis.routing': 'আপনার রিপোর্ট অগ্রাধিকার জরুরি ডেস্কে পাঠানো হচ্ছে।',
    'analysis.confirm': 'নিশ্চিত করুন এবং কর্তৃপক্ষকে সতর্ক করুন',
    
    // Common
    'common.loading': 'লোড হচ্ছে...',
    'common.error': 'কিছু ভুল হয়েছে',
    'common.retry': 'পুনরায় চেষ্টা করুন',
    'common.cancel': 'বাতিল',
    'common.save': 'সংরক্ষণ',
    'common.delete': 'মুছুন',
    'common.edit': 'সম্পাদনা',
    'common.back': 'ফিরে যান',
    'common.next': 'পরবর্তী',
    'common.done': 'সম্পন্ন',
    'common.close': 'বন্ধ করুন',
    'common.copy': 'কপি',
    'common.copied': 'কপি হয়েছে!',
    
    // Review
    'review.title': 'বিস্তারিত যাচাই করুন',
    'review.subtitle': 'JAAGRUK ব্লকচেইনে চূড়ান্ত জমা দেওয়ার আগে আপনার রিপোর্ট পর্যালোচনা করুন।',
    'review.issueType': 'সমস্যার ধরন',
    'review.description': 'বিবরণ',
    'review.commitment': 'JAAGRUK প্রতিশ্রুতি',
    'review.commitmentDesc': 'জমা দিয়ে, আপনি স্বীকার করছেন যে এই রিপোর্ট আনুষ্ঠানিকভাবে ব্লকচেইনে রেকর্ড হবে।',
    'review.submit': 'JAAGRUK এ জমা দিন',
    'review.submitting': 'ব্লকচেইনে রেকর্ড হচ্ছে...',
    
    // Confirmation
    'confirmation.title': 'রিপোর্ট নিশ্চিত',
    'confirmation.subtitle': 'আপনার রিপোর্ট স্থায়ীভাবে ব্লকচেইনে রেকর্ড হয়েছে — এটি মুছে ফেলা বা পরিবর্তন করা যাবে না।',
    'confirmation.referenceId': 'রেফারেন্স আইডি',
    'confirmation.verify': 'ব্লকচেইনে যাচাই করুন',
    'confirmation.timeline': 'স্ট্যাটাস টাইমলাইন',
    'confirmation.submitted': 'রিপোর্ট জমা হয়েছে',
    'confirmation.submittedDesc': 'ব্লকচেইনে রেকর্ড • টেম্পার-প্রুফ',
    'confirmation.underReview': 'পর্যালোচনাধীন',
    'confirmation.underReviewDesc': 'কর্মকর্তারা বিস্তারিত যাচাই করছেন।',
    'confirmation.returnHome': 'হোমে ফিরে যান',
    
    // Emergency
    'emergency.title': 'জরুরি SOS',
    'emergency.subtitle': 'সাহায্য আসছে।',
    'emergency.distance': 'দূরত্ব',
    'emergency.eta': 'আনুমানিক সময়',
    'emergency.callPolice': 'পুলিশ কল করুন (100)',
    'emergency.directions': 'দিকনির্দেশ পান',
    'emergency.dispatching': 'আপনার বর্তমান স্থানাঙ্ক থানায় পাঠানো হচ্ছে।',
    
    // Profile
    'profile.title': 'আমার প্রোফাইল',
    'profile.editProfile': 'প্রোফাইল সম্পাদনা',
    'profile.settings': 'সেটিংস',
    'profile.myReports': 'আমার রিপোর্ট',
    'profile.pending': 'বিচারাধীন',
    'profile.inProgress': 'চলমান',
    'profile.resolved': 'সমাধান হয়েছে',
    'profile.helpSupport': 'সাহায্য ও সমর্থন',
    'profile.privacyPolicy': 'গোপনীয়তা নীতি',
    'profile.termsOfService': 'সেবার শর্তাবলী',
    'profile.logout': 'লগআউট',
    
    // Reports List
    'reports.title': 'আমার রিপোর্ট',
    'reports.empty': 'এখনো কোনো রিপোর্ট নেই',
    'reports.emptyDesc': 'আপনার জমা দেওয়া রিপোর্ট এখানে দেখা যাবে।',
    'reports.viewDetails': 'বিস্তারিত দেখুন',
    'reports.status': 'অবস্থা',
    
    // Nearby
    'nearby.title': 'কাছাকাছি স্টেশন',
    'nearby.searchArea': 'এলাকা খুঁজুন...',
    'nearby.policeStations': 'থানা',
    'nearby.civicOffices': 'নাগরিক অফিস',
    'nearby.hospitals': 'হাসপাতাল',
  },
  
  // Tamil
  ta: {
    'nav.home': 'முகப்பு',
    'nav.reports': 'அறிக்கைகள்',
    'nav.nearby': 'அருகில்',
    'nav.profile': 'சுயவிவரம்',
    'home.tagline': 'பாதுகாப்பான. நம்பகமான. அநாமதேய.',
    'home.description': 'உங்கள் அறிக்கை பாதுகாப்பாக சேமிக்கப்பட்டு அதிகாரிகளுக்கு அனுப்பப்படுகிறது.',
    'home.reportIssue': 'சிக்கலைப் புகாரளியுங்கள்',
    'home.emergencySOS': 'அவசர SOS',
    'auth.login': 'உள்நுழைக',
    'auth.signup': 'பதிவு செய்க',
    'common.loading': 'ஏற்றுகிறது...',
  },
  
  // Telugu
  te: {
    'nav.home': 'హోమ్',
    'nav.reports': 'నివేదికలు',
    'nav.nearby': 'సమీపంలో',
    'nav.profile': 'ప్రొఫైల్',
    'home.tagline': 'సురక్షితమైన. విశ్వసనీయ. అజ్ఞాత.',
    'home.description': 'మీ నివేదిక సురక్షితంగా సేవ్ చేయబడి అధికారులకు పంపబడుతుంది.',
    'home.reportIssue': 'సమస్యను నివేదించండి',
    'home.emergencySOS': 'అత్యవసర SOS',
    'auth.login': 'లాగిన్',
    'auth.signup': 'సైన్ అప్',
    'common.loading': 'లోడ్ అవుతోంది...',
  },
  
  // Marathi
  mr: {
    'nav.home': 'होम',
    'nav.reports': 'अहवाल',
    'nav.nearby': 'जवळ',
    'nav.profile': 'प्रोफाइल',
    'home.tagline': 'सुरक्षित. विश्वसनीय. अनामिक.',
    'home.description': 'तुमचा अहवाल सुरक्षितपणे जतन केला जातो आणि अधिकाऱ्यांना पाठवला जातो.',
    'home.reportIssue': 'समस्या नोंदवा',
    'home.emergencySOS': 'आणीबाणी SOS',
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'common.loading': 'लोड होत आहे...',
  },
};

// ─── Language Names ──────────────────────────────────────────

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  bn: 'বাংলা',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  mr: 'मराठी',
};

// ─── Context ─────────────────────────────────────────────────

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('jaagruk-theme');
    return (saved as Theme) || 'dark';
  });
  
  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('jaagruk-language');
    return (saved as Language) || 'en';
  });
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  // Auth state
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('jaagruk-auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { isAuthenticated: false, user: null, token: null };
      }
    }
    return { isAuthenticated: false, user: null, token: null };
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [userReports, setUserReports] = useState<any[]>([]);
  
  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('jaagruk-theme', theme);
  }, [theme]);
  
  // Language effect
  useEffect(() => {
    localStorage.setItem('jaagruk-language', language);
    document.documentElement.lang = language;
  }, [language]);
  
  // Auth persistence
  useEffect(() => {
    localStorage.setItem('jaagruk-auth', JSON.stringify(auth));
  }, [auth]);
  
  // Translation function
  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };
  
  // Theme toggle
  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  // Language setter
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  // Auth methods
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        setAuth({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token,
        });
        return { success: true, message: t('auth.loginSuccess') };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (data: SignupData) => {
    setIsLoading(true);
    try {
      const response = await apiService.signup(data);
      if (response.success) {
        setAuth({
          isAuthenticated: true,
          user: response.data.user,
          token: response.data.token,
        });
        return { success: true, message: t('auth.signupSuccess') };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.message || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  // OTP-based login (simplified for demo)
  const loginWithOtp = async (phone: string, otp: string, name?: string) => {
    setIsLoading(true);
    try {
      // For demo: simulate OTP verification
      // In production, this would call a real OTP verification API
      const isValidOtp = otp.length === 6 && /^\d{6}$/.test(otp);
      
      if (!isValidOtp) {
        return { success: false, message: 'Invalid OTP format' };
      }
      
      // Simulate user creation/login
      const userId = `user_${phone}_${Date.now()}`;
      const user: User = {
        id: userId,
        name: name || `User ${phone.slice(-4)}`,
        email: `${phone}@jaagruk.app`,
        phone: phone,
        verified: true,
        createdAt: new Date().toISOString(),
      };
      
      setAuth({
        isAuthenticated: true,
        user,
        token: `demo_token_${userId}`,
      });
      
      return { success: true, message: t('auth.loginSuccess') };
    } catch (error: any) {
      return { success: false, message: error.message || 'OTP verification failed' };
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setAuth({ isAuthenticated: false, user: null, token: null });
    setUserReports([]);
    localStorage.removeItem('jaagruk-auth');
  };
  
  // Fetch user reports
  const fetchUserReports = async () => {
    if (!auth.isAuthenticated) return;
    try {
      const response = await apiService.getReports();
      if (response.success) {
        setUserReports(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    }
  };
  
  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      setTheme,
      language,
      setLanguage,
      t,
      activeTab,
      setActiveTab,
      auth,
      login,
      signup,
      loginWithOtp,
      logout,
      isLoading,
      userReports,
      fetchUserReports,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
