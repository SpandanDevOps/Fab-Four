/**
 * ReportsListScreen Component
 * Display user's submitted reports
 */

import { motion } from 'motion/react';
import { FileText, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';
import BottomNav from '../components/BottomNav.js';
import Footer from '../components/Footer.js';

interface ReportsListScreenProps {
  onNavigate: (screen: string) => void;
  onStartReport: () => void;
}

export default function ReportsListScreen({
  onNavigate,
  onStartReport,
}: ReportsListScreenProps) {
  const { t, userReports, theme } = useApp();

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header title={t('reports.title')} onNavigate={onNavigate} />

      <main className="px-4 pt-4 pb-24 relative">
        {userReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">{t('reports.empty')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('reports.emptyDesc')}</p>
            <button
              onClick={onStartReport}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25"
            >
              {t('home.reportIssue')}
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {userReports.map((rpt, index) => (
              <motion.div
                key={rpt.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {rpt.category || 'General Incident'}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyles(
                      rpt.status
                    )}`}
                  >
                    {rpt.status || 'PENDING'}
                  </span>
                </div>
                <div className="text-sm text-purple-500 mb-2">
                  {rpt.reference_id || rpt.referenceId}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {rpt.nearest_station || rpt.location?.nearestStation || 'Unknown'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <Footer variant="minimal" className="mt-8" />
      </main>

      <BottomNav onNavigate={onNavigate} />
    </div>
  );
}
