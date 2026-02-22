/**
 * ProfileScreen Component
 * User profile and settings
 */

import { motion } from 'motion/react';
import {
  User,
  UserCircle,
  FileText,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';
import BottomNav from '../components/BottomNav.js';
import Footer from '../components/Footer.js';

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { t, auth, logout, userReports, setActiveTab, theme } = useApp();

  const handleLogout = () => {
    logout();
    onNavigate('HOME');
  };

  const handleViewReports = () => {
    setActiveTab('reports');
    onNavigate('REPORTS_LIST');
  };

  const menuItems = [
    { icon: FileText, label: t('profile.myReports'), action: handleViewReports },
    { icon: Settings, label: t('profile.settings'), action: () => {} },
    { icon: HelpCircle, label: t('profile.helpSupport'), action: () => {} },
    { icon: Shield, label: t('profile.privacyPolicy'), action: () => {} },
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header title={t('profile.title')} onNavigate={onNavigate} />

      <main className="px-4 pt-6 pb-24 relative">
        {auth.isAuthenticated ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{auth.user?.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">{auth.user?.phone || auth.user?.email}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3 mb-6"
            >
              <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-purple-500">
                  {userReports.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.myReports')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-yellow-500">
                  {userReports.filter((r) => r.status === 'PENDING').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.pending')}</div>
              </div>
              <div className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700">
                <div className="text-2xl font-bold text-green-500">
                  {userReports.filter((r) => r.status === 'RESOLVED').length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{t('profile.resolved')}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {menuItems.map(({ icon: Icon, label, action }, i) => (
                <button
                  key={label}
                  onClick={action}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-purple-500" />
                  <span className="flex-1 text-left text-gray-900 dark:text-white">{label}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleLogout}
              className="w-full mt-4 py-3 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('profile.logout')}
            </motion.button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <UserCircle className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Not logged in</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Sign in to access your profile and reports
            </p>
            <button
              onClick={() => onNavigate('AUTH')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25"
            >
              Login / Sign Up
            </button>
          </motion.div>
        )}

        <Footer variant="minimal" className="mt-8" />
      </main>

      <BottomNav onNavigate={onNavigate} />
    </div>
  );
}
