
import React from 'react';
import { Heart, X, Lock, CheckCircle, BadgeCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { MOCK_LIKED_BY, PLACEHOLDER_AVATAR } from '../constants';
import { PetProfile } from '../types';

interface BeelineProps {
  isPremium: boolean;
  onOpenPremium: () => void;
  onMatch: (pet: PetProfile) => void;
  onReject: (petId: string) => void;
}

export const Beeline: React.FC<BeelineProps> = ({ isPremium, onOpenPremium, onMatch, onReject }) => {
  const { t } = useLanguage();
  
  const handleCardAction = (action: 'match' | 'reject', pet: PetProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (action === 'match') onMatch(pet);
    else onReject(pet.id);
  };

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in duration-300">
        {/* Header */}
        <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
             <h1 className="text-2xl font-bold text-gray-900">{t('beeline.title')}</h1>
             <p className="text-sm text-gray-500 font-medium">{MOCK_LIKED_BY.length} {t('beeline.waiting')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
            <div className="grid grid-cols-2 gap-4">
                {MOCK_LIKED_BY.map((pet) => (
                    <div key={pet.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-gray-100 group">
                        {/* Image Layer */}
                        <img 
                            src={pet.images[0]} 
                            alt={pet.name} 
                            className={`w-full h-full object-cover transition-all duration-500 ${isPremium ? '' : 'blur-xl scale-110'}`}
                        />

                        {/* Non-Premium Overlay */}
                        {!isPremium && (
                            <div className="absolute inset-0 bg-black/10 flex flex-col items-center justify-center p-2">
                                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg mb-2 animate-bounce">
                                    <Lock size={20} className="text-white" />
                                </div>
                            </div>
                        )}

                        {/* Premium Content */}
                        {isPremium && (
                            <>
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                                    <h3 className="text-white font-bold text-lg flex items-center gap-1">
                                        {pet.name}, {pet.age}
                                        {pet.isVerified && <BadgeCheck size={16} className="text-blue-400 fill-blue-500/20" />}
                                    </h3>
                                    <p className="text-white/80 text-xs truncate">{pet.breed}</p>
                                </div>

                                {/* Quick Actions Overlay (Visible on Tap/Hover in Premium) */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                     <button 
                                        onClick={(e) => handleCardAction('reject', pet, e)}
                                        className="w-12 h-12 bg-white rounded-full text-gray-400 hover:text-red-500 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                     >
                                         <X size={24} strokeWidth={3} />
                                     </button>
                                     <button 
                                        onClick={(e) => handleCardAction('match', pet, e)}
                                        className="w-12 h-12 bg-coral-500 rounded-full text-white hover:bg-coral-600 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                     >
                                         <Heart size={24} fill="currentColor" />
                                     </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Upgrade CTA (Sticky Bottom if not premium) */}
        {!isPremium && (
            <div className="absolute bottom-20 left-4 right-4">
                <button 
                    onClick={onOpenPremium}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full font-bold text-lg shadow-xl shadow-orange-200 hover:shadow-orange-300 transform active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                >
                    <span>{t('beeline.upgradeTitle')}</span>
                    <span className="text-[10px] opacity-90 font-medium uppercase tracking-wide">{t('beeline.unlock')}</span>
                </button>
            </div>
        )}
    </div>
  );
};
