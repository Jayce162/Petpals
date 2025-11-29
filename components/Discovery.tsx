
import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Star, SlidersHorizontal, PawPrint, Info, ChevronDown, MapPin, Ruler, Zap, CheckCircle, ShieldCheck, Flag, AlertTriangle, BadgeCheck, Lock, RotateCcw, Bone } from 'lucide-react';
import { PetProfile } from '../types';
import { useLanguage } from '../LanguageContext';
import { PLACEHOLDER_AVATAR, PLACEHOLDER_IMAGE } from '../constants';

interface DiscoveryProps {
  pets: PetProfile[];
  onSwipe: (direction: 'left' | 'right', pet: PetProfile) => void;
  isPremium: boolean;
  onOpenPremium: () => void;
}

export const Discovery: React.FC<DiscoveryProps> = ({ pets, onSwipe, isPremium, onOpenPremium }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter States
  const [playPalsMode, setPlayPalsMode] = useState(false);
  
  // Swipe History for Undo
  const [history, setHistory] = useState<('left' | 'right')[]>([]);
  
  // Photo Navigation State
  const [photoIndex, setPhotoIndex] = useState(0);
  
  // Report Logic State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  
  // Swipe State
  const [isDragging, setIsDragging] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false); 
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartTime, setDragStartTime] = useState(0); 
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Pull to Close State
  const [pullStartY, setPullStartY] = useState<number | null>(null);
  const [pullStartX, setPullStartX] = useState<number | null>(null);
  const [pullOffset, setPullOffset] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);

  const currentPet = pets[currentIndex];
  const nextPet = pets[currentIndex + 1];
  const thirdPet = pets[currentIndex + 2];

  const SWIPE_THRESHOLD = 80;
  const PULL_CLOSE_THRESHOLD = 120;
  const SCREEN_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 400;

  useEffect(() => {
    if (detailScrollRef.current) {
      detailScrollRef.current.scrollTop = 0;
    }
    setPullOffset(0);
    setPhotoIndex(0); 
    setIsReportModalOpen(false);
    setReportReason(null);
  }, [currentIndex, showInfo]);

  const handleSwipeAction = (direction: 'left' | 'right') => {
    if (isSwiping || !currentPet) return;
    
    setIsSwiping(true);
    triggerFlyAway(direction);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
        if (!isPremium) {
            onOpenPremium();
            return;
        }
        
        // Determine which side to bring it back from based on history
        const lastDirection = history[history.length - 1] || 'left';
        const startX = lastDirection === 'right' ? SCREEN_WIDTH + 200 : -(SCREEN_WIDTH + 200);
        
        // Update History
        setHistory(prev => prev.slice(0, -1));
        
        // 1. Position card off-screen immediately (disable transition)
        setIsDragging(true); 
        setDragOffset({ x: startX, y: 0 });
        
        // 2. Set index back to previous pet
        setCurrentIndex(prev => prev - 1);
        
        // 3. Animate back to center (enable transition)
        setTimeout(() => {
            setIsDragging(false);
            setDragOffset({ x: 0, y: 0 });
        }, 50);
    }
  };

  const triggerFlyAway = (direction: 'left' | 'right') => {
      const flyAwayX = direction === 'right' ? SCREEN_WIDTH + 200 : -(SCREEN_WIDTH + 200);
      setDragOffset({ x: flyAwayX, y: 0 });

      setTimeout(() => {
          onSwipe(direction, currentPet);
          setHistory(prev => [...prev, direction]);
          setCurrentIndex(prev => prev + 1);
          setDragOffset({ x: 0, y: 0 });
          setIsSwiping(false);
          setShowInfo(false); 
          setPullOffset(0);
      }, 300);
  };

  const handleSubmitReport = () => {
      setIsReportModalOpen(false);
      setReportReason(null);
      setShowInfo(false);
      setTimeout(() => {
          triggerFlyAway('left');
      }, 400);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (showInfo || isSwiping) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setDragStartTime(Date.now());
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || showInfo || isSwiping) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging || showInfo || isSwiping) return;
    setIsDragging(false);
    
    const timeElapsed = Date.now() - dragStartTime;
    const movedDistance = Math.sqrt(dragOffset.x * dragOffset.x + dragOffset.y * dragOffset.y);

    if (timeElapsed < 250 && movedDistance < 10) {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const relativeX = dragStart.x - rect.left;
            if (relativeX < rect.width / 2) {
                setPhotoIndex(prev => Math.max(0, prev - 1));
            } else {
                setPhotoIndex(prev => Math.min(currentPet.images.length - 1, prev + 1));
            }
        }
        setDragOffset({ x: 0, y: 0 });
        return;
    }
    
    if (dragOffset.x > SWIPE_THRESHOLD) {
        handleSwipeAction('right');
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
        handleSwipeAction('left');
    } else {
        setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleDetailTouchStart = (e: React.TouchEvent) => {
      if (isReportModalOpen) return;
      setPullStartY(e.touches[0].clientY);
      setPullStartX(e.touches[0].clientX);
  };

  const handleDetailTouchMove = (e: React.TouchEvent) => {
      if (pullStartY === null || pullStartX === null || isReportModalOpen) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - pullStartX;
      const diffY = currentY - pullStartY;

      if (!isPulling && !isDragging) {
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
              setIsDragging(true); 
          } else if (diffY > 10 && (detailScrollRef.current?.scrollTop || 0) <= 0) {
              setIsPulling(true); 
          }
      }

      if (isDragging) {
          setDragOffset({ x: diffX, y: 0 });
          if (e.cancelable) e.preventDefault(); 
      } else if (isPulling) {
          if (diffY > 0) {
              setPullOffset(diffY * 0.5);
              if (e.cancelable) e.preventDefault();
          } else {
              setPullOffset(0);
          }
      }
  };

  const handleDetailTouchEnd = () => {
      if (isDragging) {
          if (dragOffset.x > SWIPE_THRESHOLD) {
              handleSwipeAction('right');
          } else if (dragOffset.x < -SWIPE_THRESHOLD) {
              handleSwipeAction('left');
          } else {
              setDragOffset({ x: 0, y: 0 }); 
          }
          setIsDragging(false);
      } else if (isPulling) {
          if (pullOffset > PULL_CLOSE_THRESHOLD) setShowInfo(false);
          setIsPulling(false);
          setPullOffset(0);
      }
      setPullStartY(null);
      setPullStartX(null);
  };

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY);
  const onMouseUp = () => handleDragEnd();
  const onMouseLeave = () => { if(isDragging) handleDragEnd(); };
  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleDragEnd();

  const swipeProgress = Math.min(Math.abs(dragOffset.x) / (SWIPE_THRESHOLD * 2), 1);
  const rotation = dragOffset.x * 0.05;

  const getCardStyle = () => ({
    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: 30,
    willChange: 'transform'
  });

  const getDetailViewStyle = () => ({
      transform: showInfo 
        ? `translate3d(${dragOffset.x}px, ${pullOffset}px, 0) rotate(${dragOffset.x * 0.02}deg)` 
        : 'translate3d(0, 100%, 0)',
      transition: (isDragging || isPulling) ? 'none' : 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
      willChange: 'transform'
  });

  const getNextCardStyle = () => {
    const baseScale = 0.95;
    const targetScale = 1.0;
    const currentScale = baseScale + (targetScale - baseScale) * swipeProgress;
    return {
        transform: `scale(${currentScale}) translate3d(0,0,0)`,
        opacity: 1,
        transition: isDragging ? 'none' : 'all 0.4s ease',
        zIndex: 20,
        willChange: 'transform, opacity'
    };
  };

  const getOverlayOpacity = (direction: 'left' | 'right') => {
      const opacity = direction === 'right' 
        ? Math.max(0, dragOffset.x / (SWIPE_THRESHOLD * 1.5))
        : Math.max(0, -dragOffset.x / (SWIPE_THRESHOLD * 1.5));
      return Math.min(opacity, 1);
  };

  const LockedFilter = ({ label }: { label: string }) => (
    <div 
        onClick={onOpenPremium}
        className="relative p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-amber-300 transition-colors overflow-hidden"
    >
        <span className="text-gray-500 font-medium group-hover:text-gray-800">{label}</span>
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
            <Lock size={16} />
        </div>
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent transform skew-x-12" />
    </div>
  );

  // Check if a pet qualifies as a Play Pal (Mock logic: has 'Playful', 'Fetch' vibes, or high energy)
  const isPlayPal = (pet: PetProfile) => {
      return pet.energyLevel === 'High' || pet.vibes.some(v => 
          ['Playful', 'Fetch', 'Zoomies', 'Toys', 'Ball is Life', 'High Energy'].some(k => v.includes(k))
      );
  };

  if (!currentPet) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white animate-in fade-in">
        <div className="w-24 h-24 bg-mint-50 rounded-full mb-6 flex items-center justify-center animate-bounce">
            <PawPrint size={48} className="text-mint-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('discovery.allCaughtUp')}</h2>
        <p className="text-gray-500 text-lg">{t('discovery.checkLater')}</p>
        <div className="flex items-center gap-4 mt-8">
            {currentIndex > 0 && (
                <button 
                    onClick={handleUndo} 
                    aria-label="Undo swipe"
                    className="w-14 h-14 bg-white rounded-full shadow-lg text-amber-400 hover:text-amber-500 flex items-center justify-center border border-gray-100 transition-all active:scale-95"
                >
                    <RotateCcw size={24} strokeWidth={2.5} />
                </button>
            )}
            <button 
                onClick={() => window.location.reload()}
                className="px-8 py-4 bg-coral-500 text-white rounded-full font-bold shadow-xl shadow-coral-200 hover:bg-coral-600 transition active:scale-95"
            >
                {t('discovery.refresh')}
            </button>
        </div>
      </div>
    );
  }

  // --- NEON CARD COMPONENT ---
  const NeonCard = ({ pet, isMain = false, style = {}, onInteract }: { pet: PetProfile, isMain?: boolean, style?: React.CSSProperties, onInteract?: any }) => (
    <div 
        ref={isMain ? cardRef : undefined}
        style={style}
        className={`absolute w-[90%] h-[65%] max-h-[580px] bg-black rounded-[32px] shadow-2xl overflow-hidden top-32 touch-none ${isMain ? '' : 'pointer-events-none'}`}
        {...onInteract}
    >
        {isMain && pet.images.length > 1 && (
            <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-40">
                {pet.images.map((_, idx) => (
                    <div key={idx} className={`h-1 rounded-full flex-1 transition-colors duration-300 ${idx === photoIndex ? 'bg-white' : 'bg-white/30'}`} />
                ))}
            </div>
        )}
        
        {/* Like Stamp - Paw Bubble */}
        {isMain && (
            <div 
                className="absolute top-8 left-8 z-30 pointer-events-none transition-all duration-200 flex flex-col items-center justify-center origin-top-left"
                style={{ 
                    opacity: getOverlayOpacity('right'),
                    transform: `scale(${0.8 + Math.min(0.5, dragOffset.x / (SWIPE_THRESHOLD * 2))}) rotate(-15deg)`
                }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-pulse">
                    <PawPrint size={48} className="text-white fill-white/50" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-300 rounded-full border-2 border-white"></div>
                <div className="absolute bottom-0 -left-2 w-4 h-4 bg-green-300 rounded-full border-2 border-white"></div>
            </div>
        )}

        {/* Play Pal Badge */}
        {(playPalsMode || isPlayPal(pet)) && (
            <div className="absolute top-16 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200 flex items-center gap-1 z-20 shadow-md animate-in slide-in-from-left-2 fade-in">
                <Bone size={12} fill="currentColor" /> Play Pal
            </div>
        )}

        <img 
            src={pet.images[isMain ? photoIndex : 0] || pet.images[0]} 
            alt={pet.name} 
            className="w-full h-full object-cover pointer-events-none select-none transition-opacity duration-200"
            draggable={false}
        />

        {isMain && (
            <button 
                onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
                className="absolute top-4 right-4 bg-black/20 backdrop-blur-md p-2 rounded-full text-white/80 hover:bg-black/40 transition z-30 hover:scale-110"
            >
                <Info size={24} />
            </button>
        )}
        
        <div 
            className="absolute bottom-0 left-0 w-full h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 pb-8 cursor-pointer"
            onClick={isMain ? (e) => { e.stopPropagation(); setShowInfo(true); } : undefined}
        >
            <div className="flex items-end gap-3 mb-2">
                <h2 className="text-4xl font-bold text-white shadow-sm flex items-center gap-2">
                    {pet.name}, {pet.age}
                    {pet.isVerified && <BadgeCheck size={32} className="text-white fill-blue-500" />}
                </h2>
                <span className="text-xl font-medium text-white/80 mb-1.5">{pet.gender === 'Female' ? '♀' : '♂'}</span>
            </div>
            <p className="text-xl font-medium text-white/90 mb-3">{pet.breed}</p>
            <div className="flex items-center text-white/70 text-sm mb-4">
                <MapPin size={16} className="mr-1" /> {pet.distance} {t('discovery.distance')}
            </div>
            {isMain && (
                <div className="flex justify-center mt-4">
                    <ChevronDown className="text-white/50 animate-bounce" size={24} />
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="relative w-full h-full overflow-hidden bg-white flex flex-col select-none touch-none">
      {/* Header */}
      <div className={`px-6 pt-12 pb-4 flex justify-between items-center bg-white z-40 transition-all duration-300 ${showInfo ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100'}`}>
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
            <PawPrint size={20} className="text-coral-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('discovery.title')}</h1>
        <button 
            onClick={() => setIsFiltersOpen(true)}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-800 relative"
        >
          <SlidersHorizontal size={24} />
          {!isPremium && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white"></div>}
        </button>
      </div>

      <div className="flex-1 relative w-full h-full flex flex-col items-center overflow-hidden">
        
        {/* --- CARD STACK MODE --- */}
        <div className={`absolute top-0 w-full h-full flex flex-col items-center justify-start pt-32 pb-32 transition-all duration-500 ease-in-out will-change-transform ${showInfo ? 'scale-95 opacity-50 blur-sm pointer-events-none' : 'scale-100 opacity-100'}`}>
            {/* 3rd Card */}
            {thirdPet && (
                <NeonCard 
                    pet={thirdPet} 
                    style={{ transform: 'scale(0.9) translate3d(0, 30px, 0)', opacity: 0.5, zIndex: 5 }} 
                />
            )}

            {/* Next Card */}
            {nextPet && (
                <NeonCard 
                    pet={nextPet} 
                    style={getNextCardStyle()} 
                />
            )}

            {/* Main Card */}
            <NeonCard 
                pet={currentPet} 
                isMain={true}
                style={getCardStyle()}
                onInteract={{
                    onMouseDown, onMouseMove, onMouseUp, onMouseLeave,
                    onTouchStart, onTouchMove, onTouchEnd
                }}
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-8 flex items-center gap-6 z-50">
                {/* Undo Button - Leftmost */}
                {(currentIndex > 0 || history.length > 0) && (
                    <button 
                        onClick={handleUndo} 
                        disabled={isSwiping}
                        aria-label="Undo swipe"
                        className="w-14 h-14 bg-white rounded-full shadow-lg text-amber-400 hover:text-amber-500 flex items-center justify-center border border-gray-100 backdrop-blur-sm bg-white/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RotateCcw size={24} strokeWidth={2.5} />
                    </button>
                )}

                <button onClick={() => handleSwipeAction('left')} disabled={isSwiping} className="w-16 h-16 bg-white rounded-full shadow-lg text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-100 backdrop-blur-sm bg-white/90 transition-all active:scale-90 disabled:opacity-50">
                    <X size={32} strokeWidth={3} />
                </button>
                <button onClick={() => handleSwipeAction('right')} disabled={isSwiping} className="w-20 h-20 bg-coral-500 rounded-full shadow-2xl shadow-coral-200 text-white hover:bg-coral-600 flex items-center justify-center transition-all active:scale-90 transform hover:-translate-y-1 disabled:opacity-50">
                    <Heart size={40} fill="currentColor" />
                </button>
                <button onClick={() => handleSwipeAction('right')} disabled={isSwiping} className="w-16 h-16 bg-white rounded-full shadow-lg text-blue-400 hover:text-blue-500 flex items-center justify-center border border-gray-100 backdrop-blur-sm bg-white/90 transition-all active:scale-90 disabled:opacity-50">
                    <Star size={32} fill="currentColor" className="text-blue-100 stroke-blue-500" strokeWidth={2} />
                </button>
            </div>
        </div>

        {/* --- DETAILED INFO MODE --- */}
        <div 
            className={`fixed inset-0 z-50 bg-white transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) will-change-transform ${showInfo ? 'translate-y-0' : 'translate-y-full'}`}
            style={getDetailViewStyle()}
        >
            <div 
                ref={detailScrollRef}
                className="w-full h-full overflow-y-auto pb-32 overscroll-none touch-pan-y"
                onTouchStart={handleDetailTouchStart}
                onTouchMove={handleDetailTouchMove}
                onTouchEnd={handleDetailTouchEnd}
            >
                {/* Stamps for Detail View */}
                {showInfo && (
                    <>
                        <div 
                            className="fixed top-20 left-8 z-[60] pointer-events-none transition-all duration-200 flex flex-col items-center justify-center origin-top-left"
                            style={{ 
                                opacity: getOverlayOpacity('right'),
                                transform: `scale(${0.8 + Math.min(0.5, dragOffset.x / (SWIPE_THRESHOLD * 2))}) rotate(-15deg)`
                            }}
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-pulse">
                                <PawPrint size={48} className="text-white fill-white/50" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-300 rounded-full border-2 border-white"></div>
                            <div className="absolute bottom-0 -left-2 w-4 h-4 bg-green-300 rounded-full border-2 border-white"></div>
                        </div>
                    </>
                )}

                <div className="w-full h-[55vh] relative will-change-transform" style={{ transform: `translate3d(0, ${Math.min(0, pullOffset * 0.5)}px, 0)` }}>
                    <img 
                        src={currentPet.images[photoIndex] || currentPet.images[0]} 
                        alt={currentPet.name} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
                    <div className="absolute top-4 left-0 w-full flex justify-center opacity-70 animate-pulse pointer-events-none">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-1">
                            <ChevronDown className="text-white" size={24} />
                        </div>
                    </div>
                </div>

                <div className="relative -mt-20 z-10">
                    <div className="bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] min-h-screen relative">
                        <div className="w-full flex justify-center pt-4 pb-4 cursor-grab active:cursor-grabbing">
                            <div className="w-14 h-1.5 bg-gray-300 rounded-full" />
                        </div>
                        <div className="px-8 pt-2">
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                            {currentPet.name}, {currentPet.age}
                                            {currentPet.isVerified && <BadgeCheck size={32} className="text-white fill-blue-500" />}
                                        </h1>
                                        <p className="text-xl text-gray-500 font-medium mt-1">{currentPet.breed}</p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center border border-red-100 mb-1">
                                        <span className="text-3xl text-red-400 font-bold">{currentPet.gender === 'Female' ? '♀' : '♂'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-500 text-base mt-2">
                                    <MapPin size={18} className="mr-2 text-coral-500" />{currentPet.distance} {t('discovery.distance')}
                                </div>
                            </div>
                            <hr className="border-gray-100 mb-8" />

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase"><Ruler size={14} /> Size</div>
                                    <span className="text-gray-800 font-semibold text-lg">{currentPet.size}</span>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs font-bold uppercase"><Zap size={14} /> Energy</div>
                                    <span className="text-gray-800 font-semibold text-lg">{currentPet.energyLevel}</span>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">{t('discovery.about')} {currentPet.name}</h3>
                                <div className="relative bg-yellow-50/50 p-6 rounded-3xl border border-yellow-100">
                                    <div className="text-gray-700 leading-loose text-base" dangerouslySetInnerHTML={{ __html: currentPet.bio }} />
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">{t('discovery.vibeCheck')}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {currentPet.vibes.map((vibe) => (
                                        <span key={vibe} className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 font-medium shadow-sm">{vibe}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-16">
                                <h3 className="font-bold text-gray-900 text-lg mb-4">{t('discovery.morePhotos')}</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {currentPet.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="Gallery" className="w-full h-56 object-cover rounded-2xl shadow-sm" />
                                    ))}
                                </div>
                            </div>

                            <div className="pb-40 px-6 flex flex-col gap-4 items-center mt-10 border-t border-gray-100 pt-10">
                                <button onClick={() => setIsReportModalOpen(true)} className="flex items-center gap-2 text-gray-400 font-semibold text-sm hover:text-red-500 transition-colors py-2">
                                    <Flag size={18} /> {t('discovery.report')} {currentPet.name}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Floating Buttons (Detail Mode) */}
                <div className="fixed bottom-8 left-0 w-full flex justify-center items-center gap-8 p-4 z-40 pointer-events-none">
                    <button onClick={() => handleSwipeAction('left')} disabled={isSwiping} className="pointer-events-auto w-16 h-16 bg-white rounded-full shadow-lg text-gray-400 hover:text-red-500 flex items-center justify-center border border-gray-100 backdrop-blur-sm bg-white/90 transition-all active:scale-90 disabled:opacity-50">
                        <X size={32} strokeWidth={3} />
                    </button>
                    <button onClick={() => handleSwipeAction('right')} disabled={isSwiping} className="pointer-events-auto w-20 h-20 bg-coral-500 rounded-full shadow-xl text-white hover:bg-coral-600 flex items-center justify-center transform hover:-translate-y-1 active:scale-90 transition-all disabled:opacity-50">
                        <Heart size={40} fill="currentColor" />
                    </button>
                    <button onClick={() => handleSwipeAction('right')} disabled={isSwiping} className="pointer-events-auto w-16 h-16 bg-white rounded-full shadow-lg text-blue-400 hover:text-blue-500 flex items-center justify-center border border-gray-100 backdrop-blur-sm bg-white/90 transition-all active:scale-90 disabled:opacity-50">
                        <Star size={32} fill="currentColor" className="text-blue-100 stroke-blue-500" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </div>

        {/* --- FILTERS DRAWER --- */}
        {isFiltersOpen && (
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{t('discovery.filters')}</h2>
                        <button onClick={() => setIsFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6 mb-8">
                        {/* Play Pals Filter */}
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                                    <Bone size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Looking for Play Pals</h3>
                                    <p className="text-xs text-gray-500">Find pets for playdates</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setPlayPalsMode(!playPalsMode)}
                                className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${playPalsMode ? 'bg-yellow-400' : 'bg-gray-200'}`}
                            >
                                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${playPalsMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* Free Filters */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Maximum Distance (km)</label>
                            <input type="range" className="w-full accent-coral-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1"><span>1km</span><span>50km+</span></div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Age Range</label>
                            <div className="flex items-center gap-4">
                                <input type="number" placeholder="Min" className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                                <span className="text-gray-400">-</span>
                                <input type="number" placeholder="Max" className="w-full p-3 bg-gray-50 rounded-xl border-none" />
                            </div>
                        </div>

                        {/* Premium Filters Header */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <h3 className="text-amber-500 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                <Star size={14} fill="currentColor" /> {t('discovery.premiumFeature')}
                            </h3>
                        </div>

                        {/* Locked Filters */}
                        {!isPremium ? (
                            <div className="space-y-3">
                                <LockedFilter label="Energy Level" />
                                <LockedFilter label="Compatibility (Kids, Cats)" />
                                <LockedFilter label="Vaccination Status" />
                                <LockedFilter label="Specific Breed" />
                                <p className="text-xs text-center text-gray-400 mt-2 italic">{t('discovery.unlockFilters')}</p>
                            </div>
                        ) : (
                             /* Unlocked View (Mocked) */
                            <div className="space-y-3 opacity-100">
                                <select className="w-full p-3 bg-white border border-gray-200 rounded-xl"><option>Any Energy Level</option></select>
                                <select className="w-full p-3 bg-white border border-gray-200 rounded-xl"><option>Any Compatibility</option></select>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setIsFiltersOpen(false)}
                        className="w-full py-3.5 bg-coral-500 text-white font-bold rounded-xl shadow-lg shadow-coral-200 hover:bg-coral-600 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        )}

        {/* --- REPORT MODAL --- */}
        {isReportModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500"><AlertTriangle size={24} /></div>
                        <h2 className="text-xl font-bold text-gray-900">Report {currentPet.name}?</h2>
                    </div>
                    <div className="space-y-2 mb-6">
                        {['Inappropriate Photos', 'Spam or Scam', 'Not a Pet', 'Other'].map((reason) => (
                            <button key={reason} onClick={() => setReportReason(reason)} className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-colors border ${reportReason === reason ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-700'}`}>{reason}</button>
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => { setIsReportModalOpen(false); setReportReason(null); }} className="flex-1 py-3 rounded-full bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200">Cancel</button>
                        <button onClick={handleSubmitReport} disabled={!reportReason} className="flex-1 py-3 rounded-full bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-50">Submit</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
