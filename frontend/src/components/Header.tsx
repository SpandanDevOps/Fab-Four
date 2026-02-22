/**
 * Header Component
 * Navigation header with language selector, theme toggle, and auth
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Languages,
  User,
  UserCircle,
  ChevronDown,
  ArrowLeft,
} from 'lucide-react';
import { useApp, Language, languageNames } from '../context/AppContext.js';
import { LogoInline } from './Logo.js';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLang?: boolean;
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

export default function Header({
  title,
  showBack = false,
  showLang = true,
  onBack,
  onNavigate,
}: HeaderProps) {
  const {
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    auth,
  } = useApp();

  const [showLangDropdown, setShowLangDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {showBack && onBack && (
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        )}
        {title ? (
          <h1 className="text-lg font-semibold">{title}</h1>
        ) : (
          <LogoInline />
        )}
      </div>

      <div className="flex items-center gap-2">
        {showLang && (
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden sm:inline">{languageNames[language]}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showLangDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
              >
                {(Object.keys(languageNames) as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                      language === lang ? 'bg-primary/10 text-primary' : ''
                    }`}
                  >
                    {languageNames[lang]}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {!auth.isAuthenticated ? (
          <button
            onClick={() => onNavigate?.('LOGIN')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            <User className="w-4 h-4" />
            {t('auth.login')}
          </button>
        ) : (
          <button
            onClick={() => onNavigate?.('PROFILE')}
            className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <UserCircle className="w-6 h-6 text-primary" />
          </button>
        )}
      </div>
    </header>
  );
}
