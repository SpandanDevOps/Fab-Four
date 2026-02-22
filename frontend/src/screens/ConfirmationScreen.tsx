/**
 * ConfirmationScreen Component
 * Display submission confirmation with reference ID
 */

import { motion } from 'motion/react';
import { Check, Copy, ExternalLink, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';

interface ConfirmationScreenProps {
  onNavigate: (screen: string) => void;
  referenceId: string;
  blockHash?: string;
}

export default function ConfirmationScreen({
  onNavigate,
  referenceId,
  blockHash,
}: ConfirmationScreenProps) {
  const { t, setActiveTab } = useApp();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReturnHome = () => {
    setActiveTab('home');
    onNavigate('HOME');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-background-dark">
      <Header onNavigate={onNavigate} />

      <main className="px-4 pt-8 pb-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold mb-2">{t('confirmation.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('confirmation.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm text-gray-500 mb-2">
            {t('confirmation.referenceId')}
          </div>
          <div className="flex items-center justify-between">
            <code className="text-lg font-mono font-bold text-primary">
              {referenceId}
            </code>
            <button
              onClick={() => copyToClipboard(referenceId)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl border border-primary text-primary font-medium flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors mb-6"
        >
          <ExternalLink className="w-5 h-5" />
          {t('confirmation.verify')}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="font-semibold mb-4">{t('confirmation.timeline')}</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-medium">{t('confirmation.submitted')}</div>
                <p className="text-sm text-gray-500">
                  {t('confirmation.submittedDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="font-medium">{t('confirmation.underReview')}</div>
                <p className="text-sm text-gray-500">
                  {t('confirmation.underReviewDesc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReturnHome}
          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold"
        >
          {t('confirmation.returnHome')}
        </motion.button>
      </main>
    </div>
  );
}
