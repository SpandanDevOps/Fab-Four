/**
 * LandingScreen Component
 * Initial landing page with Login, Signup, and Emergency SOS buttons
 */

import { motion } from 'motion/react';
import { LogIn, UserPlus, AlertTriangle, Shield, Sparkles, Phone } from 'lucide-react';
import Logo from '../components/Logo.js';
import Footer from '../components/Footer.js';

interface LandingScreenProps {
  onNavigate: (screen: string) => void;
}

export default function LandingScreen({ onNavigate }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 flex flex-col">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-300/10 to-indigo-400/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo and branding */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Logo size="xl" animated showTagline />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Blockchain-Secured Civic Reporting</span>
          </motion.div>
        </motion.div>

        {/* Auth button - Single unified auth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm space-y-4 mb-8"
        >
          {/* Login / Signup Button (OTP-based) */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('AUTH')}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-purple-500/40"
          >
            <Phone className="w-6 h-6" />
            Login / Sign Up with Phone
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 w-full max-w-sm mb-8"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">or</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
        </motion.div>

        {/* Emergency SOS Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('EMERGENCY_DETAILS')}
          className="w-full max-w-sm py-4 px-6 rounded-2xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-lg shadow-lg shadow-red-500/30 flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-red-500/40"
        >
          <AlertTriangle className="w-6 h-6" />
          Emergency SOS
        </motion.button>

        {/* Continue as guest link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => onNavigate('HOME')}
          className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors underline-offset-4 hover:underline"
        >
          Continue as Guest
        </motion.button>
      </main>

      <Footer />
    </div>
  );
}
