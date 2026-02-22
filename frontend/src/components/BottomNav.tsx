/**
 * BottomNav Component
 * Fixed bottom navigation bar with tabs
 */

import { Home, FileText, MapPinned, UserCircle } from 'lucide-react';
import { useApp, NavTab } from '../context/AppContext.js';

interface BottomNavProps {
  onNavigate?: (screen: string) => void;
}

export default function BottomNav({ onNavigate }: BottomNavProps) {
  const { t, activeTab, setActiveTab } = useApp();

  const handleNavTab = (tab: NavTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'home':
        onNavigate?.('HOME');
        break;
      case 'reports':
        onNavigate?.('REPORTS_LIST');
        break;
      case 'nearby':
        onNavigate?.('NEARBY');
        break;
      case 'profile':
        onNavigate?.('PROFILE');
        break;
    }
  };

  const navItems = [
    { id: 'home' as NavTab, icon: Home, label: t('nav.home') },
    { id: 'reports' as NavTab, icon: FileText, label: t('nav.reports') },
    { id: 'nearby' as NavTab, icon: MapPinned, label: t('nav.nearby') },
    { id: 'profile' as NavTab, icon: UserCircle, label: t('nav.profile') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleNavTab(id)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-purple-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-[2.5]' : ''}`} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
