/**
 * EmergencyScreen Component
 * Emergency SOS with quick access to help
 */

import { motion } from 'motion/react';
import { AlertTriangle, Building, Phone, Navigation, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext.js';

interface EmergencyScreenProps {
  onBack: () => void;
}

export default function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  const { t } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 dark:from-red-900 dark:to-red-950">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">{t('emergency.title')}</h1>
        <div className="w-9" />
      </header>

      <main className="px-4 pt-6 pb-8 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse"
        >
          <AlertTriangle className="w-12 h-12" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">{t('emergency.subtitle')}</h2>
          <p className="text-white/80">{t('emergency.dispatching')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Saket Police Station</div>
              <div className="text-sm text-white/70">Saket, New Delhi</div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            <div className="flex-1 text-center">
              <div className="text-sm text-white/70">{t('emergency.distance')}</div>
              <div className="text-lg font-semibold">1.2 km</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex-1 text-center">
              <div className="text-sm text-white/70">{t('emergency.eta')}</div>
              <div className="text-lg font-semibold">~5 min</div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          <motion.a
            href="tel:100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full py-4 rounded-xl bg-white text-red-600 font-bold flex items-center justify-center gap-3"
          >
            <Phone className="w-6 h-6" />
            {t('emergency.callPolice')}
          </motion.a>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full py-4 rounded-xl bg-white/20 font-semibold flex items-center justify-center gap-3"
          >
            <Navigation className="w-6 h-6" />
            {t('emergency.directions')}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
