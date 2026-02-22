/**
 * Footer Component
 * App footer with branding and links
 */

import { motion } from 'motion/react';
import { Shield, Heart } from 'lucide-react';

interface FooterProps {
  variant?: 'full' | 'minimal';
  className?: string;
}

export default function Footer({ variant = 'full', className = '' }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className={`py-4 px-4 text-center ${className}`}>
        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          JAAGRUK — Your Voice
        </p>
      </footer>
    );
  }

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className={`py-6 px-4 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm ${className}`}
    >
      <div className="max-w-md mx-auto text-center space-y-3">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">
            <span className="text-indigo-600 dark:text-indigo-400">JAAG</span>
            <span className="text-purple-600 dark:text-purple-400">RUK</span>
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          "Your Voice for a Better Tomorrow"
        </p>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Blockchain-powered civic reporting platform. Secure, transparent, and tamper-proof.
        </p>

        {/* Links */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <button className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Privacy Policy
          </button>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <button className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Terms of Service
          </button>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <button className="text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            Contact
          </button>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
        </p>
      </div>
    </motion.footer>
  );
}
