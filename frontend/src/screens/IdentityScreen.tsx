/**
 * IdentityScreen Component
 * Choose anonymous or named reporting
 */

import { motion } from 'motion/react';
import { User, EyeOff, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.js';
import Header from '../components/Header.js';

interface IdentityScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  onSelectIdentity: (identity: 'name' | 'anonymous') => void;
}

export default function IdentityScreen({
  onNavigate,
  onBack,
  onSelectIdentity,
}: IdentityScreenProps) {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:bg-background-dark">
      <Header title={t('identity.title')} showBack onBack={onBack} />

      <main className="px-4 pt-6 pb-8">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 dark:text-gray-400 mb-8"
        >
          {t('identity.subtitle')}
        </motion.p>

        <div className="space-y-4 max-w-md mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectIdentity('name')}
            className="w-full p-5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{t('identity.withName')}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                    {t('identity.withNameBadge')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('identity.withNameDesc')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 mt-3" />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectIdentity('anonymous')}
            className="w-full p-5 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-primary transition-colors text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{t('identity.anonymous')}</h3>
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                    {t('identity.anonymousBadge')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('identity.anonymousDesc')}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 mt-3" />
            </div>
          </motion.button>
        </div>
      </main>
    </div>
  );
}
