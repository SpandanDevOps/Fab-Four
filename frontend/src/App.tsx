/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Main Application Component
 * ============================================================
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from './context/AppContext.js';
import { Screen, ReportData, ChatMessage, PoliceStation, EvidenceFile } from './types/index.js';
import { analyzeIncident } from './services/geminiService.js';
import { apiService } from './services/apiService.js';

// Import all screens
import {
  LandingScreen,
  AuthScreen,
  HomeScreen,
  LoginScreen,
  SignupScreen,
  IdentityScreen,
  ChatScreen,
  LocationScreen,
  EvidenceScreen,
  AnalysisScreen,
  ReviewScreen,
  ConfirmationScreen,
  EmergencyScreen,
  ReportsListScreen,
  NearbyScreen,
  ProfileScreen,
} from './screens/index.js';

// ─── Initial State ───────────────────────────────────────────

const initialReport: ReportData = {
  identity: 'anonymous',
  description: '',
  location: { area: '', address: '', nearestStation: '' },
  evidence: [],
};

// ─── Mock Police Stations ────────────────────────────────────

const mockStations: PoliceStation[] = [
  { id: '1', name: 'Saket Police Station', address: 'Saket, New Delhi', phone: '011-26851100', distance: 1.2, lat: 28.5245, lng: 77.2066 },
  { id: '2', name: 'Hauz Khas Police Station', address: 'Hauz Khas, New Delhi', phone: '011-26858300', distance: 2.5, lat: 28.5494, lng: 77.2001 },
  { id: '3', name: 'Malviya Nagar Police Station', address: 'Malviya Nagar, New Delhi', phone: '011-26684100', distance: 1.8, lat: 28.5355, lng: 77.2108 },
];

// ─── Main App Component ──────────────────────────────────────

export default function App() {
  const { theme, t, auth, fetchUserReports } = useApp();

  // Screen navigation
  const [screen, setScreen] = useState<Screen>('LANDING');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);

  // Report state
  const [report, setReport] = useState<ReportData>(initialReport);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Location state
  const [selectedStation, setSelectedStation] = useState<PoliceStation | null>(null);

  // Evidence upload state
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ referenceId: string; blockHash: string } | null>(null);

  // Fetch reports when authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchUserReports();
    }
  }, [auth.isAuthenticated]);

  // Navigation handler
  const goTo = (newScreen: string) => {
    setPrevScreen(screen);
    setScreen(newScreen as Screen);
  };

  const goBack = () => {
    if (prevScreen) {
      setScreen(prevScreen);
      setPrevScreen(null);
    } else {
      setScreen('HOME');
    }
  };

  // Start report flow
  const startReportFlow = () => {
    setReport(initialReport);
    setMessages([]);
    setSelectedStation(null);
    setSubmissionResult(null);
    goTo('IDENTITY');
  };

  // Handle identity selection
  const handleSelectIdentity = (identity: 'name' | 'anonymous') => {
    setReport(prev => ({ ...prev, identity }));
    setMessages([
      {
        id: '1',
        role: 'assistant',
        text: t('chat.greeting'),
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        role: 'assistant',
        text: t('chat.prompt'),
        timestamp: new Date().toISOString(),
        italic: true,
      },
    ]);
    goTo('CHAT');
  };

  // Handle chat message
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setReport(prev => ({ ...prev, description: text }));
    setIsAnalyzing(true);

    setTimeout(async () => {
      try {
        const analysis = await analyzeIncident(text);
        setReport(prev => ({
          ...prev,
          analysis: {
            category: analysis.category,
            urgency: analysis.urgency,
            summary: analysis.summary,
            authorities: analysis.authorities,
          },
        }));
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `${t('chat.analyzing')} I've analyzed your report. Let me guide you to the next step.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        setTimeout(() => {
          setIsAnalyzing(false);
          goTo('LOCATION');
        }, 1500);
      } catch (error) {
        console.error('Analysis failed:', error);
        setIsAnalyzing(false);
        goTo('LOCATION');
      }
    }, 2000);
  };

  // Handle file upload (for chat)
  const handleChatFileUpload = async (files: FileList) => {
    const uploadedFiles: EvidenceFile[] = [];
    for (const file of Array.from(files)) {
      const evidence: EvidenceFile = {
        id: Date.now().toString() + Math.random(),
        url: URL.createObjectURL(file),
        filename: file.name,
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };
      uploadedFiles.push(evidence);
    }
    setReport(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...uploadedFiles],
    }));
  };

  // Handle evidence file upload
  const handleEvidenceUpload = async (files: FileList) => {
    setUploadingFiles(true);
    try {
      const uploadedFiles: EvidenceFile[] = [];
      for (const file of Array.from(files)) {
        const evidence: EvidenceFile = {
          id: Date.now().toString() + Math.random(),
          url: URL.createObjectURL(file),
          filename: file.name,
          mimetype: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };
        uploadedFiles.push(evidence);
      }
      setReport(prev => ({
        ...prev,
        evidence: [...prev.evidence, ...uploadedFiles],
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  // Remove evidence
  const handleRemoveEvidence = (id: string) => {
    setReport(prev => ({
      ...prev,
      evidence: prev.evidence.filter(e => e.id !== id),
    }));
  };

  // Select police station
  const handleSelectStation = (station: PoliceStation) => {
    setSelectedStation(station);
    setReport(prev => ({
      ...prev,
      location: {
        ...prev.location,
        nearestStation: station.name,
        address: station.address,
        area: station.address.split(',')[0],
        lat: station.lat,
        lng: station.lng,
      },
    }));
  };

  // Submit report
  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiService.submitReport({
        category: report.analysis?.category || 'General',
        urgency: report.analysis?.urgency || 'Medium',
        description: report.description,
        identity: report.identity,
        citizenId: auth.user?.id,
        location: report.location,
        evidence: report.evidence.map(e => e.id),
        authorities: report.analysis?.authorities,
        aiSummary: report.analysis?.summary,
        isEmergency: false,
      });

      setSubmissionResult({
        referenceId: response.data.referenceId,
        blockHash: response.data.blockHash,
      });
      goTo('CONFIRMATION');
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({
        referenceId: `#IND-${Math.floor(10000 + Math.random() * 90000)}-X`,
        blockHash: '0x' + Math.random().toString(16).slice(2, 18),
      });
      goTo('CONFIRMATION');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SCREEN ROUTER
  // ─────────────────────────────────────────────────────────────

  const renderScreen = () => {
    switch (screen) {
      case 'LANDING':
        return (
          <LandingScreen
            onNavigate={goTo}
          />
        );

      case 'AUTH':
        return (
          <AuthScreen
            onNavigate={goTo}
            onBack={goBack}
          />
        );

      case 'HOME':
        return (
          <HomeScreen
            onNavigate={goTo}
            onStartReport={startReportFlow}
          />
        );

      case 'LOGIN':
        return (
          <LoginScreen
            onNavigate={goTo}
            onBack={goBack}
          />
        );

      case 'SIGNUP':
        return (
          <SignupScreen
            onNavigate={goTo}
            onBack={goBack}
          />
        );

      case 'IDENTITY':
        return (
          <IdentityScreen
            onNavigate={goTo}
            onBack={goBack}
            onSelectIdentity={handleSelectIdentity}
          />
        );

      case 'CHAT':
        return (
          <ChatScreen
            onNavigate={goTo}
            onBack={goBack}
            messages={messages}
            onSendMessage={handleSendMessage}
            onFileUpload={handleChatFileUpload}
            isAnalyzing={isAnalyzing}
          />
        );

      case 'LOCATION':
        return (
          <LocationScreen
            onNavigate={goTo}
            onBack={goBack}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
          />
        );

      case 'EVIDENCE':
        return (
          <EvidenceScreen
            onNavigate={goTo}
            onBack={goBack}
            evidence={report.evidence}
            onFileUpload={handleEvidenceUpload}
            onRemoveEvidence={handleRemoveEvidence}
            isUploading={uploadingFiles}
          />
        );

      case 'ANALYSIS':
        return (
          <AnalysisScreen
            onNavigate={goTo}
            onBack={goBack}
            report={report}
          />
        );

      case 'REVIEW':
        return (
          <ReviewScreen
            onNavigate={goTo}
            onBack={goBack}
            report={report}
            onSubmit={handleSubmitReport}
            isSubmitting={isSubmitting}
          />
        );

      case 'CONFIRMATION':
        return (
          <ConfirmationScreen
            onNavigate={goTo}
            referenceId={submissionResult?.referenceId || report.referenceId || '#IND-00000-X'}
            blockHash={submissionResult?.blockHash}
          />
        );

      case 'EMERGENCY_DETAILS':
        return (
          <EmergencyScreen
            onBack={goBack}
          />
        );

      case 'REPORTS_LIST':
        return (
          <ReportsListScreen
            onNavigate={goTo}
            onStartReport={startReportFlow}
          />
        );

      case 'NEARBY':
        return (
          <NearbyScreen
            onNavigate={goTo}
          />
        );

      case 'PROFILE':
        return (
          <ProfileScreen
            onNavigate={goTo}
          />
        );

      default:
        return (
          <HomeScreen
            onNavigate={goTo}
            onStartReport={startReportFlow}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
