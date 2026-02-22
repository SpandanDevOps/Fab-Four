/**
 * HomeScreen Component
 * Main landing screen with report options
 */

import { motion } from 'motion/react';
import { FileText, AlertTriangle, Shield, Sparkles, Lock, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';
import BottomNav from '../components/BottomNav.js';
import Logo from '../components/Logo.js';
import Footer from '../components/Footer.js';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  onStartReport: () => void;
}

export default function HomeScreen({ onNavigate, onStartReport }: HomeScreenProps) {
  const { t, auth, userReports, theme } = useApp();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {/* Mesh gradient overlay for dark mode */}
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header onNavigate={onNavigate} />

      <main className="relative pb-24 px-4 pt-8">
        {/* Hero Section with Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Logo size="lg" animated showTagline />
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-gray-600 dark:text-gray-400 max-w-xs mx-auto"
          >
            {t('home.tagline')}
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8 max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartReport}
            className="btn-hover-glow w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 flex items-center justify-center gap-3"
          >
            <FileText className="w-6 h-6" />
            {t('home.reportIssue')}
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('EMERGENCY_DETAILS')}
            className="btn-hover-glow w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold text-lg shadow-lg shadow-red-500/25 flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-6 h-6" />
            {t('home.emergencySOS')}
          </motion.button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
          {[
            { icon: Sparkles, label: 'AI-Powered', color: 'text-purple-500' },
            { icon: Lock, label: 'Blockchain', color: 'text-indigo-500' },
            { icon: Globe, label: 'Multi-lingual', color: 'text-blue-500' },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="card-hover bg-white dark:bg-gray-900/50 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800"
            >
              <Icon className={`w-6 h-6 mx-auto mb-1 ${color}`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* Official Platform Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-hover bg-white dark:bg-gray-900/50 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 mb-6 max-w-md mx-auto backdrop-blur-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{t('home.officialPlatform')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.officialDesc')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* User Reports Summary */}
        {auth.isAuthenticated && userReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card-hover bg-white dark:bg-gray-900/50 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 max-w-md mx-auto backdrop-blur-sm"
          >
            <h3 className="font-semibold mb-3">{t('home.yourReports')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {userReports.length}
                </div>
                <div className="text-xs text-gray-500">{t('profile.myReports')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {userReports.filter((r) => r.status === 'PENDING').length}
                </div>
                <div className="text-xs text-gray-500">{t('profile.pending')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {userReports.filter((r) => r.status === 'RESOLVED').length}
                </div>
                <div className="text-xs text-gray-500">{t('home.resolved')}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <Footer variant="minimal" className="mt-8" />
      </main>

      <BottomNav onNavigate={onNavigate} />
    </div>
  );
}
