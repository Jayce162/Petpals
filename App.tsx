
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Discovery } from './components/Discovery';
import { SocialFeed } from './components/SocialFeed';
import { MatchModal } from './components/MatchModal';
import { ChatInterface } from './components/ChatInterface';
import { Settings } from './components/Settings';
import { EditProfile } from './components/EditProfile';
import { HealthRecords } from './components/HealthRecords';
import { Login } from './components/Login';
import { SignUp } from './components/SignUp';
import { PremiumModal } from './components/PremiumModal';
import { Beeline } from './components/Beeline';
import { CURRENT_USER_PET, MOCK_PETS, MOCK_POSTS, PLACEHOLDER_AVATAR } from './constants';
import { Match, PetProfile, SocialPost, Tab } from './types';
import { Plus } from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';

const AppContent: React.FC<{ initialUserPet?: PetProfile }> = ({ initialUserPet }) => {
  const [currentTab, setCurrentTab] = useState<Tab>('discovery');
  const { t } = useLanguage();
  
  // User Pets State
  const [myPets, setMyPets] = useState<PetProfile[]>(initialUserPet ? [initialUserPet] : [{...CURRENT_USER_PET, isVerified: false}]);
  const [activePetId, setActivePetId] = useState<string>(initialUserPet ? initialUserPet.id : CURRENT_USER_PET.id);
  
  // Premium State
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Centralized Data State
  const [posts, setPosts] = useState<SocialPost[]>(MOCK_POSTS);
  const [matches, setMatches] = useState<Match[]>([
    {
      id: 'demo-expiring',
      petId: '3', // Bơ
      matchedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
      isFirstMoveYours: true,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), 
    }
  ]);
  
  const [showMatchModal, setShowMatchModal] = useState<{
    isOpen: boolean;
    matchedPet?: PetProfile;
  }>({ isOpen: false });
  
  // Chat State
  const [activeChatPetId, setActiveChatPetId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Profile State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHealthOpen, setIsHealthOpen] = useState(false);

  // Derived Active Pet
  const activePet = myPets.find(p => p.id === activePetId) || myPets[0];

  const [, setTick] = useState(0);
  useEffect(() => {
    if (currentTab !== 'matches' && !activeChatPetId) return;

    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [currentTab, activeChatPetId]);

  const handleSavePet = (petToSave: PetProfile) => {
      if (myPets.some(p => p.id === petToSave.id)) {
          // Update existing
          setMyPets(prev => prev.map(p => p.id === petToSave.id ? petToSave : p));
      } else {
          // Add new
          setMyPets(prev => [...prev, petToSave]);
          setActivePetId(petToSave.id); // Switch to new pet
      }
  };

  // Handle Premium Upgrade
  const handleUpgrade = () => {
      setIsPremium(true);
      setShowPremiumModal(false);
      // Could add success toast here
  };

  // Beeline Match Handler
  const handleBeelineMatch = (pet: PetProfile) => {
      const newMatch: Match = {
          id: Date.now().toString(),
          petId: pet.id,
          matchedAt: new Date(),
          isFirstMoveYours: true, 
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
      };
      setMatches(prev => [...prev, newMatch]);
      openChat(pet.id); // Directly open chat
  };

  // Swipe Handler
  const handleSwipe = (direction: 'left' | 'right', pet: PetProfile) => {
    if (direction === 'right') {
      const isMatch = Math.random() > 0.3; 
      
      if (isMatch) {
        const newMatch: Match = {
          id: Date.now().toString(),
          petId: pet.id,
          matchedAt: new Date(),
          isFirstMoveYours: activePet.gender === 'Female' || pet.gender === activePet.gender, 
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
        
        setTimeout(() => {
          setMatches(prev => [...prev, newMatch]);
          setShowMatchModal({ isOpen: true, matchedPet: pet });
        }, 300);
      }
    }
  };

  const handleExtendMatch = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening chat
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          expiresAt: new Date(m.expiresAt.getTime() + 24 * 60 * 60 * 1000), // Add 24h
          lastExtendedAt: new Date(),
        };
      }
      return m;
    }));
  };

  const handleAddPost = (newPost: SocialPost) => {
      setPosts([newPost, ...posts]);
  };

  const openChat = (petId: string, initialMsg: string = '') => {
    setActiveChatPetId(petId);
    setChatInput(initialMsg);
    if (currentTab !== 'matches') setCurrentTab('matches');
  };

  const renderMatchesList = () => {
    if (activeChatPetId) {
      const chatPartner = [...MOCK_PETS, ...MOCK_PETS].find(p => p.id === activeChatPetId); // Hack: look in mock pets, real impl would query db
      // Also check MOCK_LIKED_BY just in case
      const beelinePartner = matches.find(m => m.petId === activeChatPetId); // Find if existing match
      // If not found easily, fallback to dummy
      
      const partner = chatPartner || { ...MOCK_PETS[0], id: activeChatPetId, name: 'Unknown' };

      return (
        <ChatInterface 
          myPet={activePet}
          chatPartner={partner}
          onBack={() => setActiveChatPetId(null)}
          initialMessage={chatInput}
        />
      );
    }

    return (
      <div className="p-4 bg-white h-full pb-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">{t('matches.connect')}</h1>
        
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('matches.newMatches')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar min-h-[110px]">
          {matches.map(match => {
            // Look in both lists
            const pet = MOCK_PETS.find(p => p.id === match.petId); // || MOCK_LIKED_BY.find(p => p.id === match.petId);
            if (!pet) return null;

            const now = Date.now();
            const timeLeftMs = match.expiresAt.getTime() - now;
            const hoursLeft = Math.max(0, Math.ceil(timeLeftMs / (1000 * 60 * 60)));
            const isExpiringSoon = timeLeftMs > 0 && timeLeftMs < 2 * 60 * 60 * 1000;
            
            const canExtend = isExpiringSoon && 
              (!match.lastExtendedAt || (now - match.lastExtendedAt.getTime() > 24 * 60 * 60 * 1000));

            return (
              <div key={match.id} className="flex flex-col items-center space-y-2 min-w-[80px] relative group cursor-pointer transition-transform active:scale-95" onClick={() => openChat(pet.id)}>
                 <div className="relative">
                   <img 
                    src={pet.images[0]} 
                    alt={pet.name} 
                    className={`w-16 h-16 rounded-full object-cover border-2 p-0.5 transition-all ${isExpiringSoon ? 'border-red-500 animate-pulse' : 'border-coral-500'}`} 
                    onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                   />
                   {match.isFirstMoveYours && !isExpiringSoon && (
                     <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-white shadow-sm">{t('matches.yourTurn')}</span>
                   )}
                   {isExpiringSoon && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center z-10 w-full justify-center">
                           <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold border border-white whitespace-nowrap shadow-sm">{hoursLeft}h {t('matches.expiring')}</span>
                      </div>
                   )}
                   {canExtend && (
                      <button 
                          onClick={(e) => handleExtendMatch(match.id, e)}
                          className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-md hover:bg-blue-600 z-20 animate-bounce"
                      >
                          <Plus size={12} strokeWidth={3} />
                      </button>
                   )}
                 </div>
                 <span className="text-sm font-semibold truncate w-full text-center text-gray-700">{pet.name}</span>
              </div>
            );
          })}
          {matches.length === 0 && (
            <div className="flex items-center justify-center w-full py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <span className="text-gray-400 text-sm font-medium">{t('matches.noMatches')}</span>
            </div>
          )}
        </div>

        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{t('matches.messages')}</h2>
        <div className="space-y-2">
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors active:bg-gray-100" onClick={() => openChat('1')}>
                <div className="relative">
                    <img src={MOCK_PETS[0].images[0]} alt={MOCK_PETS[0].name} className="w-14 h-14 rounded-full object-cover shadow-sm" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 border-b border-gray-100 pb-3">
                    <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{MOCK_PETS[0].ownerName} & {MOCK_PETS[0].name}</h3>
                        <span className="text-xs text-gray-400 font-medium">5m ago</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate font-medium text-gray-800">Aww, what a happy pup! 😍 We should...</p>
                </div>
            </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'discovery':
        return (
            <Discovery 
                pets={MOCK_PETS} 
                onSwipe={handleSwipe} 
                isPremium={isPremium} 
                onOpenPremium={() => setShowPremiumModal(true)}
            />
        );
      case 'social':
        return <SocialFeed posts={posts} currentUser={activePet} onAddPost={handleAddPost} />;
      case 'beeline':
        return (
            <Beeline 
                isPremium={isPremium} 
                onOpenPremium={() => setShowPremiumModal(true)}
                onMatch={handleBeelineMatch}
                onReject={(id) => console.log('Rejected', id)}
            />
        );
      case 'matches':
        return renderMatchesList(); 
      case 'profile':
        if (isSettingsOpen) return <Settings onBack={() => setIsSettingsOpen(false)} />;
        if (isHealthOpen) return <HealthRecords activePet={activePet} onUpdatePet={handleSavePet} onBack={() => setIsHealthOpen(false)} />;
        return <EditProfile pets={myPets} activePetId={activePetId} setActivePetId={setActivePetId} onSavePet={handleSavePet} onOpenSettings={() => setIsSettingsOpen(true)} onOpenHealth={() => setIsHealthOpen(true)} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white overflow-hidden font-sans text-gray-900">
      <div className="flex-1 relative overflow-hidden">
        {renderContent()}
      </div>
      
      <Navigation currentTab={currentTab} onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'profile') {
              setIsSettingsOpen(false);
              setIsHealthOpen(false);
          }
          if (tab === 'matches' && activeChatPetId) setActiveChatPetId(null);
      }} />

      {showMatchModal.isOpen && showMatchModal.matchedPet && (
        <MatchModal 
          myPet={activePet}
          matchedPet={showMatchModal.matchedPet}
          onClose={() => setShowMatchModal({ isOpen: false })}
          onChat={(startMessage) => {
            setShowMatchModal({ isOpen: false });
            openChat(showMatchModal.matchedPet!.id, startMessage);
          }}
        />
      )}

      {showPremiumModal && (
          <PremiumModal 
            onClose={() => setShowPremiumModal(false)}
            onUpgrade={handleUpgrade}
          />
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [initialUser, setInitialUser] = useState<PetProfile | undefined>(undefined);

  const handleLogin = (userProfile?: PetProfile) => {
      if (userProfile) {
          setInitialUser(userProfile);
      }
      setIsAuthenticated(true);
  };

  return (
    <LanguageProvider>
        {isAuthenticated ? (
             <AppContent initialUserPet={initialUser} />
        ) : (
             authMode === 'login' ? (
                <Login onLogin={handleLogin} onGoToSignUp={() => setAuthMode('signup')} />
             ) : (
                <SignUp onSignUp={() => setIsAuthenticated(true)} onBackToLogin={() => setAuthMode('login')} />
             )
        )}
    </LanguageProvider>
  );
};

export default App;
