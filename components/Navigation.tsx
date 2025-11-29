
import React from 'react';
import { Home, MessageCircle, User, Heart, PawPrint } from 'lucide-react'; 
import { Tab } from '../types';
import { useLanguage } from '../LanguageContext';

interface NavigationProps {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { t } = useLanguage();
  
  const getIconClass = (tab: Tab) => 
    `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      currentTab === tab ? 'text-coral-500' : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
        <button onClick={() => onTabChange('social')} className={getIconClass('social')}>
          <Home size={24} strokeWidth={currentTab === 'social' ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate w-full">{t('nav.feed')}</span>
        </button>
        <button onClick={() => onTabChange('discovery')} className={getIconClass('discovery')}>
          <PawPrint size={24} strokeWidth={currentTab === 'discovery' ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate w-full">{t('nav.discovery')}</span>
        </button>
        <button onClick={() => onTabChange('beeline')} className={getIconClass('beeline')}>
          <div className="relative">
             <Heart size={24} strokeWidth={currentTab === 'beeline' ? 2.5 : 2} />
             {/* Badge for Beeline (Mocked) */}
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <span className="text-[9px] font-medium truncate w-full">{t('nav.beeline')}</span>
        </button>
        <button onClick={() => onTabChange('matches')} className={getIconClass('matches')}>
          <MessageCircle size={24} strokeWidth={currentTab === 'matches' ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate w-full">{t('nav.matches')}</span>
        </button>
        <button onClick={() => onTabChange('profile')} className={getIconClass('profile')}>
          <User size={24} strokeWidth={currentTab === 'profile' ? 2.5 : 2} />
          <span className="text-[9px] font-medium truncate w-full">{t('nav.profile')}</span>
        </button>
      </div>
    </div>
  );
};
