
import React, { useState } from 'react';
import { 
  User, Mail, Lock, Trash2, Eye, Share2, Bell, AtSign, 
  Globe, HelpCircle, FileText, Shield, ChevronRight, ArrowLeft, Check, Loader2, Phone, MessageCircle 
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { language, setLanguage, t } = useLanguage();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  
  // Modal States
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    // Simulate logout
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    setIsDeleting(true);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3 px-2">{title}</h3>
  );

  const SettingsItem = ({ 
    icon: Icon, 
    iconColor, 
    bgColor, 
    label, 
    subLabel, 
    action, 
    isDestructive = false,
    onClick
  }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white mb-3 rounded-2xl shadow-sm cursor-pointer hover:bg-gray-50 transition ${isDestructive ? 'hover:bg-red-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="flex flex-col">
          <span className={`font-medium ${isDestructive ? 'text-red-500' : 'text-gray-800'}`}>
            {label}
          </span>
          {subLabel && <span className="text-xs text-gray-400">{subLabel}</span>}
        </div>
      </div>
      <div>
        {action}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <div 
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`w-12 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${checked ? 'bg-red-300' : 'bg-gray-200'}`}
    >
      <div 
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} 
      />
    </div>
  );

  const Chevron = () => <ChevronRight size={20} className="text-gray-400" />;

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-in slide-in-from-right duration-300 relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="text-gray-800 p-2 -ml-2 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 hide-scrollbar">
        
        {/* Account Section */}
        <SectionHeader title={t('settings.account')} />
        <SettingsItem 
          icon={User} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.profileInfo')}
          onClick={onBack} // Return to profile editor
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={Mail} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.changeEmail')}
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={Lock} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.changePassword')}
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={Trash2} 
          bgColor="bg-red-50" 
          iconColor="text-red-500" 
          label={t('settings.deleteAccount')}
          isDestructive={true}
          onClick={() => setShowDeleteModal(true)}
          action={<Chevron />} 
        />

        {/* Privacy Section */}
        <SectionHeader title={t('settings.privacy')} />
        <SettingsItem 
          icon={Eye} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label="Profile Visibility" 
          subLabel="Public"
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={Share2} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label="Manage Data Sharing" 
          action={<Chevron />} 
        />

        {/* Notifications Section */}
        <SectionHeader title={t('settings.notifications')} />
        <SettingsItem 
          icon={Bell} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.pushNotifs')}
          action={<Toggle checked={pushEnabled} onChange={() => setPushEnabled(!pushEnabled)} />} 
        />
        <SettingsItem 
          icon={AtSign} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.emailNotifs')}
          action={<Toggle checked={emailEnabled} onChange={() => setEmailEnabled(!emailEnabled)} />} 
        />

        {/* General Section */}
        <SectionHeader title={t('settings.general')} />
        <SettingsItem 
          icon={Globe} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.language')}
          subLabel={language === 'en' ? 'English' : 'Tiếng Việt'}
          onClick={() => setShowLanguageModal(true)}
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={HelpCircle} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.help')}
          onClick={() => setShowHelpModal(true)}
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={FileText} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label={t('settings.terms')}
          action={<Chevron />} 
        />
        <SettingsItem 
          icon={Shield} 
          bgColor="bg-red-100" 
          iconColor="text-red-400" 
          label="Privacy Policy" 
          action={<Chevron />} 
        />

        {/* Footer */}
        <div className="mt-8 mb-4">
            <button 
                onClick={() => setShowLogoutModal(true)}
                className="w-full py-4 bg-red-50 text-red-400 font-semibold rounded-3xl hover:bg-red-100 transition active:scale-95"
            >
                {t('settings.logout')}
            </button>
            <p className="text-center text-gray-400 text-sm mt-4">App Version 1.2.3</p>
        </div>
      </div>

      {/* Language Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-xl font-bold text-gray-900 mb-4">{t('settings.selectLanguage')}</h3>
             
             <div className="space-y-2">
               <button 
                  onClick={() => { setLanguage('en'); setShowLanguageModal(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border ${language === 'en' ? 'border-coral-500 bg-coral-50 text-coral-600' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
               >
                 <span className="font-bold">English</span>
                 {language === 'en' && <Check size={20} />}
               </button>
               
               <button 
                  onClick={() => { setLanguage('vi'); setShowLanguageModal(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border ${language === 'vi' ? 'border-coral-500 bg-coral-50 text-coral-600' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
               >
                 <span className="font-bold">Tiếng Việt</span>
                 {language === 'vi' && <Check size={20} />}
               </button>
             </div>

             <button 
                onClick={() => setShowLanguageModal(false)}
                className="mt-6 w-full py-3 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
             >
               Cancel
             </button>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-gray-900 mb-2">{t('settings.logout')}?</h3>
             <p className="text-gray-500 mb-6">Are you sure you want to log out of PetPals?</p>
             <div className="flex gap-3">
               <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 rounded-full bg-gray-100 font-bold text-gray-700 hover:bg-gray-200">Cancel</button>
               <button onClick={handleLogout} className="flex-1 py-3 rounded-full bg-red-500 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-600">Log Out</button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 mx-auto">
                <Trash2 size={24} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{t('settings.deleteAccount')}?</h3>
             <p className="text-gray-500 mb-6 text-center">This action cannot be undone. All your data and matches will be permanently removed.</p>
             
             {isDeleting ? (
                 <div className="flex flex-col items-center py-4">
                    <Loader2 size={32} className="text-red-500 animate-spin mb-2" />
                    <span className="text-sm font-medium text-gray-400">Goodbye...</span>
                 </div>
             ) : (
                 <div className="flex gap-3">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-full bg-gray-100 font-bold text-gray-700 hover:bg-gray-200">Cancel</button>
                    <button onClick={handleDeleteAccount} className="flex-1 py-3 rounded-full bg-red-500 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-600">Delete</button>
                 </div>
             )}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
             <h3 className="text-xl font-bold text-gray-900 mb-4">{t('settings.help')}</h3>
             <div className="space-y-4 mb-6">
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                     <div className="bg-white p-2 rounded-full shadow-sm">
                        <Phone size={20} className="text-coral-500" />
                     </div>
                     <div>
                         <p className="text-xs text-gray-400 font-bold uppercase">Support Line</p>
                         <p className="text-gray-800 font-semibold">1-800-PET-PALS</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                     <div className="bg-white p-2 rounded-full shadow-sm">
                        <MessageCircle size={20} className="text-coral-500" />
                     </div>
                     <div>
                         <p className="text-xs text-gray-400 font-bold uppercase">Email Support</p>
                         <p className="text-gray-800 font-semibold">help@petpals.app</p>
                     </div>
                 </div>
             </div>
             <button onClick={() => setShowHelpModal(false)} className="w-full py-3 rounded-full bg-coral-500 font-bold text-white shadow-lg shadow-coral-200 hover:bg-coral-600">
                Got it
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
