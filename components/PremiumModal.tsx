
import React from 'react';
import { Crown, Check, X, Zap, Filter, Eye, Rewind } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface PremiumModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ onClose, onUpgrade }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
        
        {/* Header Image & Gradient */}
        <div className="relative h-40 bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 p-6 flex flex-col justify-center items-center text-center shrink-0">
            <button 
                onClick={onClose}
                className="absolute top-4 left-4 p-2 bg-black/10 rounded-full text-white hover:bg-black/20 transition-colors"
            >
                <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border-2 border-white/50 shadow-lg">
                <Crown size={32} className="text-white fill-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase drop-shadow-sm">
                {t('premium.title')}
            </h2>
        </div>

        {/* Benefits List */}
        <div className="px-6 py-6 flex-1 overflow-y-auto">
            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Eye size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t('premium.benefits.beeline')}</h3>
                        <p className="text-xs text-gray-500">Instant match with admirers.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Filter size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t('premium.benefits.filters')}</h3>
                        <p className="text-xs text-gray-500">Find your perfect breed & vibe.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Rewind size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t('premium.benefits.undo')}</h3>
                        <p className="text-xs text-gray-500">Accidentally swiped left? Bring them back.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <Crown size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{t('premium.benefits.badge')}</h3>
                        <p className="text-xs text-gray-500">Stand out with a golden badge.</p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {/* 1 Month */}
                <div className="border-2 border-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center relative cursor-pointer hover:border-amber-300 transition-colors">
                    <span className="text-xl font-black text-gray-900">1</span>
                    <span className="text-xs font-bold text-gray-400 uppercase mb-1">{t('premium.month')}</span>
                    <span className="text-sm font-bold text-gray-900">99k</span>
                </div>

                {/* 6 Months - Best Value */}
                <div className="border-2 border-amber-400 bg-amber-50 rounded-2xl p-2 flex flex-col items-center justify-center relative cursor-pointer shadow-md transform scale-105 z-10">
                    <div className="absolute -top-3 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {t('premium.bestValue')}
                    </div>
                    <span className="text-xl font-black text-amber-600">6</span>
                    <span className="text-xs font-bold text-amber-400 uppercase mb-1">{t('premium.month')}</span>
                    <span className="text-sm font-bold text-amber-600">399k</span>
                    <span className="text-[9px] text-amber-500 font-bold bg-amber-200/50 px-1 rounded mt-1">{t('premium.save')} 33%</span>
                </div>

                {/* 3 Months */}
                <div className="border-2 border-gray-100 rounded-2xl p-2 flex flex-col items-center justify-center relative cursor-pointer hover:border-amber-300 transition-colors">
                     <div className="absolute -top-2 bg-gray-200 text-gray-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {t('premium.popular')}
                    </div>
                    <span className="text-xl font-black text-gray-900">3</span>
                    <span className="text-xs font-bold text-gray-400 uppercase mb-1">{t('premium.month')}</span>
                    <span className="text-sm font-bold text-gray-900">249k</span>
                </div>
            </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 pt-2 border-t border-gray-100 bg-white shrink-0 z-20">
            <button 
                onClick={onUpgrade}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-lg shadow-xl shadow-orange-200 hover:shadow-orange-300 transform active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                {t('premium.cta')} <Zap size={20} className="fill-white" />
            </button>
            <button className="w-full mt-3 text-xs font-bold text-gray-400 uppercase hover:text-gray-600">
                {t('premium.restore')}
            </button>
        </div>
      </div>
    </div>
  );
};
