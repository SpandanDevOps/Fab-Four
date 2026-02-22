/**
 * ReviewScreen Component
 * Review and submit the report
 */

import { motion } from 'motion/react';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import { ReportData } from '../types/index.js';
import Header from '../components/Header.js';

interface ReviewScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  report: ReportData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function ReviewScreen({
  onNavigate,
  onBack,
  report,
  onSubmit,
  isSubmitting,
}: ReviewScreenProps) {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-background-dark">
      <Header title={t('review.title')} showBack onBack={onBack} />

      <main className="px-4 pt-6 pb-8">
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {t('review.subtitle')}
        </p>

        <div className="space-y-4 max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">{t('review.issueType')}</div>
            <div className="font-semibold">
              {report.analysis?.category || 'General Incident'}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">{t('review.description')}</div>
            <p className="text-sm">{report.description}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 mb-1">Location</div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{report.location.nearestStation}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{report.location.address}</p>
          </div>

          {report.evidence.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 mb-1">Evidence</div>
              <div className="font-medium">{report.evidence.length} file(s) attached</div>
            </div>
          )}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-5 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  {t('review.commitment')}
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  {t('review.commitmentDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('review.submitting')}
            </>
          ) : (
            t('review.submit')
          )}
        </motion.button>
      </main>
    </div>
  );
}
