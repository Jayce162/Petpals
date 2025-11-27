import React, { useEffect, useState } from 'react';
import { PetProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import { PLACEHOLDER_IMAGE } from '../constants';
import { Sparkles } from 'lucide-react';
import { generateMatchAnalysis } from '../services/geminiService';

interface MatchModalProps {
  myPet: PetProfile;
  matchedPet: PetProfile;
  onClose: () => void;
  onChat: (message?: string) => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ myPet, matchedPet, onClose, onChat }) => {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalysis = async () => {
        const result = await generateMatchAnalysis(myPet, matchedPet);
        if (isMounted) setAnalysis(result);
    };
    fetchAnalysis();
    return () => { isMounted = false; };
  }, [myPet, matchedPet]);

  // Default icebreakers based on the image provided
  const icebreaker1 = "Break the ice and message " + matchedPet.ownerName + " first!";
  const icebreaker2 = "Your dog is so cute! What breed is she?";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-8 animate-in fade-in duration-300">
      
      {/* Decorative confetti elements (Simple CSS shapes) */}
      <div className="absolute top-20 left-10 w-8 h-3 bg-yellow-300 rotate-45 rounded-sm animate-pulse" />
      <div className="absolute top-12 right-20 w-4 h-4 bg-blue-200 rotate-12 rounded-sm" />
      <div className="absolute top-32 right-8 w-6 h-6 bg-red-200 rounded-full opacity-50" />

      {/* Polaroid Stack */}
      <div className="relative w-full max-w-xs h-64 mb-8 flex justify-center items-center mt-10">
        {/* My Pet Photo (Left, Tilted Left) */}
        <div className="absolute transform -rotate-6 -translate-x-8 z-10 transition-transform hover:scale-105 duration-300">
          <div className="bg-white p-3 pb-10 shadow-2xl rounded-lg w-44 h-56 border border-gray-100">
            <img 
              src={myPet.images[0]} 
              alt={myPet.name} 
              className="w-full h-full object-cover rounded-md"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
            />
          </div>
        </div>

        {/* Matched Pet Photo (Right, Tilted Right) */}
        <div className="absolute transform rotate-6 translate-x-8 z-20 transition-transform hover:scale-105 duration-300">
           <div className="bg-white p-3 pb-10 shadow-2xl rounded-lg w-44 h-56 border border-gray-100">
            <img 
              src={matchedPet.images[0]} 
              alt={matchedPet.name} 
              className="w-full h-full object-cover rounded-md"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; e.currentTarget.onerror = null; }}
            />
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center mb-6 z-30 px-4">
        <h2 className="text-5xl font-black text-gray-900 mb-2 font-sans tracking-tight">
          {t('matches.matchTitle')}
        </h2>
        <p className="text-gray-500 text-lg mb-4">
          {t('matches.matchSub').replace('{name}', matchedPet.ownerName)}
        </p>

        {/* AI Analysis Badge */}
        <div className="bg-mint-50 border border-mint-200 p-4 rounded-xl max-w-xs mx-auto relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white text-mint-600 text-xs font-bold px-3 py-1 rounded-full border border-mint-200 flex items-center gap-1 shadow-sm">
                <Sparkles size={12} />
                AI Match Analysis
            </div>
            <p className="text-mint-900 text-sm font-medium italic leading-relaxed">
                {analysis ? `"${analysis}"` : "Analyzing compatibility..."}
            </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3 z-30">
        {/* Icebreaker 1 */}
        <button 
          onClick={() => onChat()}
          className="w-full py-3.5 px-4 bg-red-50 text-gray-800 rounded-full text-sm font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100"
        >
          {icebreaker1}
        </button>

        {/* Icebreaker 2 */}
        <button 
          onClick={() => onChat(icebreaker2)}
          className="w-full py-3.5 px-4 bg-red-50 text-gray-800 rounded-full text-sm font-bold hover:bg-red-100 transition-all active:scale-95 border border-red-100"
        >
          "{icebreaker2}"
        </button>

        {/* Main CTA */}
        <button 
          onClick={() => onChat()}
          className="w-full py-4 bg-gradient-to-r from-coral-400 to-coral-600 text-white rounded-full font-black text-lg shadow-xl shadow-coral-200 hover:shadow-coral-300 transform transition-all hover:-translate-y-1 active:scale-95 mt-2"
        >
          {t('matches.sendMessage')}
        </button>
        
        {/* Cancel */}
        <button 
          onClick={onClose}
          className="w-full py-3 text-gray-400 font-medium hover:text-gray-600 transition-colors active:scale-95"
        >
          {t('matches.keepSwiping')}
        </button>
      </div>
    </div>
  );
};
