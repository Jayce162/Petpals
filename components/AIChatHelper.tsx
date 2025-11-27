import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateIcebreaker } from '../services/geminiService';
import { PetProfile } from '../types';

interface AIChatHelperProps {
  myPet: PetProfile;
  theirPet: PetProfile;
  onSelectMessage: (msg: string) => void;
}

export const AIChatHelper: React.FC<AIChatHelperProps> = ({ myPet, theirPet, onSelectMessage }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setSuggestion(null);
    const result = await generateIcebreaker(myPet, theirPet);
    setSuggestion(result);
    setLoading(false);
  };

  return (
    <div className="p-4 bg-mint-50 rounded-xl border border-mint-100 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-mint-900 uppercase tracking-wide flex items-center gap-2">
          <Sparkles size={14} className="text-mint-600" />
          AI Wingman
        </h4>
      </div>
      
      {!suggestion && !loading && (
        <button 
          onClick={handleGenerate}
          className="w-full text-sm py-2 bg-white text-mint-600 font-medium rounded-lg border border-mint-200 hover:bg-mint-100 transition"
        >
          Generate Icebreaker
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center py-2 text-mint-600 gap-2">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Thinking...</span>
        </div>
      )}

      {suggestion && (
        <div className="animate-fade-in">
          <p className="text-sm text-gray-700 italic bg-white p-3 rounded-lg border border-mint-200 mb-2">
            "{suggestion}"
          </p>
          <div className="flex gap-2">
             <button 
              onClick={() => onSelectMessage(suggestion)}
              className="flex-1 py-1.5 bg-mint-500 text-white text-xs font-bold rounded-md hover:bg-mint-600"
            >
              Use This
            </button>
            <button 
              onClick={handleGenerate}
              className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-bold rounded-md hover:bg-gray-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};