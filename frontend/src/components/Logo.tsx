/**
 * Logo Component
 * Unique animated JAAGRUK logo with glow effects
 */

import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  size = 'md',
  animated = true,
  showTagline = false,
  className = '',
}: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 48, text: 'text-2xl', tagline: 'text-sm' },
    lg: { icon: 72, text: 'text-4xl', tagline: 'text-base' },
    xl: { icon: 96, text: 'text-5xl', tagline: 'text-lg' },
  };

  const { icon, text, tagline } = sizes[size];

  return (
    <div className={`logo-container flex flex-col items-center ${className}`}>
      {/* Glow effect behind logo */}
      <div className="logo-glow" />

      {/* Main logo container */}
      <motion.div
        initial={animated ? { scale: 0.8, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        {/* Outer ring with pulse animation */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-400/30 to-pink-400/30 animate-pulse-ring"
          style={{ width: icon + 16, height: icon + 16, margin: -8 }}
        />

        {/* Main icon container */}
        <motion.div
          className={`relative rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ${
            animated ? 'animate-glow-pulse' : ''
          }`}
          style={{ width: icon, height: icon }}
          whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
        >
          {/* Shield SVG Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
            style={{ width: icon * 0.55, height: icon * 0.55 }}
          >
            {/* Shield path */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            {/* Inner checkmark */}
            <motion.path
              d="M9 12l2 2 4-4"
              initial={animated ? { pathLength: 0 } : false}
              animate={animated ? { pathLength: 1 } : false}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </svg>

          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-white/10" />
        </motion.div>

        {/* Decorative rings */}
        <motion.div
          className="absolute -inset-2 rounded-3xl border border-purple-500/20"
          animate={
            animated
              ? {
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.1, 0.3],
                }
              : false
          }
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Text logo */}
      <motion.div
        initial={animated ? { y: 10, opacity: 0 } : false}
        animate={animated ? { y: 0, opacity: 1 } : false}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-4 text-center"
      >
        <h1
          className={`font-black tracking-tight ${text} ${
            animated ? 'logo-text logo-text-animated' : ''
          }`}
        >
          <span className="text-indigo-500">JAAG</span>
          <span className="text-purple-500">RUK</span>
        </h1>

        {showTagline && (
          <motion.p
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            transition={{ delay: 0.4 }}
            className={`${tagline} text-gray-600 dark:text-gray-400 font-medium mt-1 tracking-wide`}
          >
            — Your Voice —
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

/**
 * Inline Logo for Header
 */
export function LogoInline({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      {/* Mini icon */}
      <motion.div
        className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-purple-500/30 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </motion.div>

      {/* Text */}
      <span className="font-bold text-lg tracking-tight">
        <span className="text-indigo-500 group-hover:text-indigo-600 transition-colors">
          JAAG
        </span>
        <span className="text-purple-500 group-hover:text-purple-400 transition-colors">
          RUK
        </span>
      </span>
    </div>
  );
}
