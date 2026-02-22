/**
 * AnalysisScreen Component
 * Display AI analysis results
 */

import { motion } from 'motion/react';
import { Check, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ReportData } from '../types/index.js';
import Header from '../components/Header.js';

interface AnalysisScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  report: ReportData;
}

export default function AnalysisScreen({
  onNavigate,
  onBack,
  report,
}: AnalysisScreenProps) {
  const { t } = useApp();

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'Critical':
        return 'text-red-500';
      case 'High':
        return 'text-orange-500';
      case 'Medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-background-dark">
      <Header title={t('analysis.title')} showBack onBack={onBack} />

      <main className="px-4 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{t('analysis.subtitle')}</p>
        </motion.div>

        <div className="space-y-4 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-500 mb-1">{t('analysis.category')}</div>
            <div className="text-xl font-semibold text-primary">
              {report.analysis?.category || 'General Incident'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-500 mb-1">{t('analysis.urgency')}</div>
            <div className={`text-xl font-semibold ${getUrgencyColor(report.analysis?.urgency)}`}>
              {report.analysis?.urgency || 'Medium'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                {t('analysis.routing')}
              </p>
            </div>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('REVIEW')}
          className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
        >
          {t('analysis.confirm')}
        </motion.button>
      </main>
    </div>
  );
}
