
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Camera, PawPrint, Zap, Users, User, Edit2, Check, X, Loader2, Plus, Search, Star, Activity, Bold, Italic, ChevronRight, AlertCircle, BadgeCheck, Wand2, ShieldCheck } from 'lucide-react';
import { EnergyLevel, Gender, PetProfile, Size, Species } from '../types';
import { useLanguage } from '../LanguageContext';
import { PLACEHOLDER_AVATAR } from '../constants';
import { generateBio } from '../services/geminiService';

interface EditProfileProps {
  pets: PetProfile[];
  activePetId: string;
  setActivePetId: (id: string) => void;
  onSavePet: (pet: PetProfile) => void;
  onOpenSettings: () => void;
  onOpenHealth: () => void;
}

// Predefined suggestions
const SUGGESTED_VIBES = [
  'Ball is Life', 'Foodie', 'Cuddles', 'Zoomies', 'Hiking', 
  'Swimming', 'Napping', 'Tug of War', 'Frisbee', 'Agility',
  'Squeaky Toys', 'Car Rides', 'Beach Day', 'Squirrel Patrol'
];

const SUGGESTED_COMPATIBILITY = [
  'Kids', 'Dogs', 'Cats', 'Seniors', 'Apartment Living', 
  'Large Yard', 'Active Owner', 'Quiet Home', 'Farm Life',
  'City Life', 'Other Small Pets', 'Multi-dog Home'
];

// Helper to count characters stripping HTML
const getCharCount = (html: string) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim().length;
};

// Interactive Tag Component
const EditableTag: React.FC<{ text: string; colorClass: string; onRemove: () => void }> = ({ text, colorClass, onRemove }) => (
  <span className={`group flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold ${colorClass} mr-2 mb-2 transition-all duration-200 border border-transparent hover:border-red-200`}>
    {text}
    <button 
      onClick={onRemove}
      className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/20"
    >
      <X size={10} />
    </button>
  </span>
);

export const EditProfile: React.FC<EditProfileProps> = ({ 
    pets, 
    activePetId, 
    setActivePetId, 
    onSavePet,
    onOpenSettings, 
    onOpenHealth 
}) => {
  const { t } = useLanguage();
  
  // Mode state to handle "Creating New" vs "Editing Existing"
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [profileImage, setProfileImage] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [compatibility, setCompatibility] = useState<string[]>([]);
  const [gender, setGender] = useState<Gender>(Gender.FEMALE);
  const [breed, setBreed] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  
  // Tag Modal State
  const [activeModal, setActiveModal] = useState<'vibes' | 'compatibility' | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bioEditorRef = useRef<HTMLDivElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize form when activePetId changes
  useEffect(() => {
    setFormError(null);
    if (activePetId === 'new') {
        setIsCreating(true);
        // Reset form for new pet
        setName('');
        setAge('');
        setBio('');
        setVibes([]);
        setCompatibility([]);
        setProfileImage('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'); // Default placeholder
        setGender(Gender.FEMALE);
        setBreed('');
        setIsVerified(false);
        
        // Clear rich text editor immediately
        if(bioEditorRef.current) bioEditorRef.current.innerHTML = '';
    } else {
        const currentPet = pets.find(p => p.id === activePetId);
        if (currentPet) {
            setIsCreating(false);
            setName(currentPet.name);
            setAge(currentPet.age.toString());
            setBio(currentPet.bio);
            setVibes(currentPet.vibes);
            setCompatibility(currentPet.compatibility);
            setProfileImage(currentPet.images[0]);
            setGender(currentPet.gender);
            setBreed(currentPet.breed);
            setIsVerified(!!currentPet.isVerified);
            
            // Sync editor content immediately with the new pet data
            if (bioEditorRef.current) {
                bioEditorRef.current.innerHTML = currentPet.bio;
            }
        }
    }
  }, [activePetId, pets]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const handleSave = () => {
    // Basic Validation
    if (!name.trim()) {
        setFormError("Please enter a name for your pet.");
        return;
    }
    if (!breed.trim()) {
        setFormError("Please enter a breed.");
        return;
    }
    
    setIsSaving(true);
    setFormError(null);
    
    // Generate ID if creating
    const newId = isCreating ? `pet_${Date.now()}` : activePetId;
    
    // Create pet object
    const petToSave: PetProfile = {
        id: newId,
        name: name || 'Unnamed',
        species: Species.DOG, // Default for now, could add selector
        breed: breed || 'Mixed',
        age: parseInt(age) || 0, // Default to 0 if empty
        gender: gender,
        isNeutered: true,
        images: [profileImage],
        energyLevel: EnergyLevel.MEDIUM,
        size: Size.MEDIUM,
        vibes: vibes,
        compatibility: compatibility,
        bio: bio,
        distance: 0,
        ownerName: 'You',
        isVerified: isVerified
    };

    // Simulate API call delay
    setTimeout(() => {
      onSavePet(petToSave); 
      setIsSaving(false);
      setSaveStatus('saved');
      
      // If creating, calling onSavePet usually switches the active ID in parent,
      // but we can ensure UI consistency here.
      if (isCreating) {
          setIsCreating(false);
      }

      // Reset status after 2 seconds
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleGenerateBio = async () => {
    if (!name || !breed) {
        setFormError("Enter name and breed first to generate a bio!");
        return;
    }
    setIsGeneratingBio(true);
    const aiBio = await generateBio(name, breed, vibes);
    setBio(aiBio);
    if (bioEditorRef.current) {
        bioEditorRef.current.innerHTML = aiBio;
    }
    setIsGeneratingBio(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeVibe = (index: number) => {
    setVibes(vibes.filter((_, i) => i !== index));
  };

  const removeCompatibility = (index: number) => {
    setCompatibility(compatibility.filter((_, i) => i !== index));
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;

    if (activeModal === 'vibes') {
      if (!vibes.includes(trimmedTag)) {
        setVibes([...vibes, trimmedTag]);
      }
    } else if (activeModal === 'compatibility') {
      if (!compatibility.includes(trimmedTag)) {
        setCompatibility([...compatibility, trimmedTag]);
      }
    }
    setCustomTagInput('');
  };

  const toggleGender = () => {
      setGender(prev => prev === Gender.FEMALE ? Gender.MALE : Gender.FEMALE);
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false, undefined);
    if (bioEditorRef.current) {
        bioEditorRef.current.focus();
        setBio(bioEditorRef.current.innerHTML);
    }
  };

  const handleBioInput = () => {
      if (bioEditorRef.current) {
          setBio(bioEditorRef.current.innerHTML);
      }
  };

  const currentBioLength = getCharCount(bio);
  const isBioTooLong = currentBioLength > 300;

  return (
    <div className="bg-white h-full flex flex-col relative animate-in fade-in duration-300">
        {/* Top Pet Switcher Bar - Adjusted padding */}
        <div className="bg-white z-30 px-4 pt-20 pb-4 flex items-center gap-3 overflow-x-auto hide-scrollbar border-b border-gray-50 shadow-sm">
             <h3 className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap mr-2">{t('profile.myPets')}</h3>
             {pets.map(pet => (
                 <button 
                    key={pet.id}
                    onClick={() => setActivePetId(pet.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap flex-shrink-0 ${
                        activePetId === pet.id 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                 >
                     <img 
                        src={pet.images[0]} 
                        alt={pet.name} 
                        className="w-6 h-6 rounded-full object-cover border border-white" 
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
                     />
                     <span className="text-sm font-bold">{pet.name}</span>
                 </button>
             ))}
             <button 
                onClick={() => setActivePetId('new')}
                className={`flex items-center justify-center w-10 h-10 rounded-full border border-dashed border-gray-300 flex-shrink-0 transition-colors ${
                    activePetId === 'new' ? 'bg-coral-50 border-coral-400 text-coral-500' : 'text-gray-400 hover:text-coral-500 hover:border-coral-400'
                }`}
             >
                 <Plus size={18} />
             </button>
        </div>

        {/* Header with Settings Button */}
        <div className="absolute top-0 w-full p-4 z-20 flex justify-between items-center pointer-events-none mt-8">
            <div className="bg-white/30 backdrop-blur-md rounded-full p-2 pointer-events-auto shadow-sm active:scale-95 transition-transform ml-2">
                <button 
                    onClick={triggerFileInput}
                    className="text-white hover:text-gray-100 flex items-center justify-center w-8 h-8"
                >
                   <Camera size={24} className="drop-shadow-md" />
                </button>
            </div>
            <div className="bg-white/30 backdrop-blur-md rounded-full p-2 pointer-events-auto shadow-sm active:scale-95 transition-transform mr-2">
                <button onClick={onOpenSettings} className="text-white hover:text-gray-100 flex items-center justify-center w-8 h-8">
                    <Settings size={24} className="drop-shadow-md" />
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-40 hide-scrollbar">
            
            {/* Top Image Section */}
            <div 
                className="relative w-full h-80 group cursor-pointer" 
                onClick={triggerFileInput}
            >
                <img 
                    src={profileImage} 
                    alt="Profile" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'; // Fallback dog image
                    }}
                    className={`w-full h-full object-cover rounded-b-[48px] brightness-95 group-hover:brightness-100 transition-all duration-500 shadow-lg ${isCreating ? 'grayscale-[0.3]' : ''}`}
                />
                
                {/* Creation Mode Indicator Overlay */}
                {isCreating && (
                    <div className="absolute top-24 left-0 w-full flex justify-center pointer-events-none z-10">
                        <span className="bg-coral-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                            Creating New Profile
                        </span>
                    </div>
                )}
                
                {/* Edit Photo Overlay Hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                   <span className="bg-black/40 text-white px-5 py-2.5 rounded-full backdrop-blur-sm text-sm font-medium flex items-center gap-2">
                      <Camera size={18} /> {t('profile.editPhoto')}
                   </span>
                </div>

                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Profile Info Form */}
            <div className="px-8 pt-8">
                {/* Error Message */}
                {formError && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{formError}</span>
                    </div>
                )}

                {/* Name & Age Inputs */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2 flex-1">
                        <div className="flex items-center gap-2">
                            <input 
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="text-4xl font-black text-gray-900 bg-transparent border-b-2 border-transparent focus:border-coral-200 focus:outline-none w-full max-w-[220px] placeholder-gray-300 transition-colors"
                              placeholder={t('profile.name')}
                              required
                            />
                            {isVerified && <BadgeCheck size={28} className="text-blue-400 fill-blue-500/10" />}
                        </div>
                        <span className="text-3xl font-bold text-gray-300">,</span>
                        <input 
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="text-3xl font-bold text-gray-600 bg-transparent border-b-2 border-transparent focus:border-coral-200 focus:outline-none w-20 placeholder-gray-300 transition-colors"
                          placeholder={t('profile.age')}
                        />
                    </div>
                    <div 
                        onClick={toggleGender}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border shadow-sm cursor-pointer transition active:scale-95 ${
                            gender === Gender.MALE 
                            ? 'bg-blue-50 border-blue-100 hover:bg-blue-100' 
                            : 'bg-red-50 border-red-100 hover:bg-red-100'
                        }`}
                    >
                         <span className={`text-3xl font-bold select-none ${gender === Gender.MALE ? 'text-blue-500' : 'text-red-400'}`}>
                             {gender === Gender.FEMALE ? '♀' : '♂'}
                         </span>
                    </div>
                </div>
                
                <input 
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="text-xl font-medium text-gray-400 bg-transparent border-b border-transparent focus:border-gray-200 focus:outline-none w-full mb-10 pl-1"
                    placeholder="Breed (e.g. Corgi)"
                />

                {/* Verified Status (Read-Only) */}
                <div className="mb-10 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isVerified ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <BadgeCheck size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-bold ${isVerified ? 'text-blue-900' : 'text-gray-900'}`}>
                                {isVerified ? 'Verified Profile' : 'Unverified Profile'}
                            </span>
                            <span className="text-xs text-gray-500 leading-tight max-w-[180px]">
                                {isVerified 
                                    ? 'Identity confirmed via health records' 
                                    : 'Upload health records to get verified badge'
                                }
                            </span>
                        </div>
                    </div>
                    {!isVerified ? (
                         <button 
                            onClick={onOpenHealth}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-blue-500 px-4 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-200 active:scale-95"
                         >
                            <ShieldCheck size={16} />
                            Verify Now
                         </button>
                    ) : (
                        <button 
                            onClick={onOpenHealth}
                            className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2 transition-colors"
                        >
                            View Records
                        </button>
                    )}
                </div>

                {/* About Me - Rich Text Editor */}
                <div className="mb-10 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PawPrint size={22} className="text-gray-900 group-focus-within:text-coral-500 transition-colors" />
                            <h3 className="font-bold text-gray-900 text-xl group-focus-within:text-coral-500 transition-colors">{t('profile.aboutMe')}</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleGenerateBio}
                                disabled={isGeneratingBio}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 transition-colors mr-2"
                            >
                                {isGeneratingBio ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14} />}
                                AI Write
                            </button>
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                <button 
                                    onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
                                    className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-all active:scale-95"
                                    title="Bold"
                                >
                                    <Bold size={16} strokeWidth={2.5} />
                                </button>
                                <button 
                                    onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
                                    className="p-1.5 hover:bg-white rounded-md text-gray-600 hover:text-gray-900 transition-all active:scale-95"
                                    title="Italic"
                                >
                                    <Italic size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            ref={bioEditorRef}
                            contentEditable
                            onInput={handleBioInput}
                            className={`w-full p-5 bg-gray-50 rounded-3xl text-gray-700 leading-relaxed border-2 focus:bg-white focus:outline-none min-h-[150px] transition-all shadow-sm focus:shadow-md text-base overflow-hidden ${isBioTooLong ? 'border-red-300 focus:border-red-400' : 'border-transparent focus:border-coral-200'}`}
                            style={{ whiteSpace: 'pre-wrap' }}
                            data-placeholder={t('profile.placeholderBio')}
                        />
                        {/* Placeholder overlay if empty */}
                        {!bio && (
                            <div className="absolute top-5 left-5 text-gray-400 pointer-events-none select-none">
                                {t('profile.placeholderBio')}
                            </div>
                        )}
                        
                        {/* Character Counter */}
                        <div className={`absolute bottom-4 right-4 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm ${isBioTooLong ? 'text-red-500 bg-red-50' : 'text-gray-400 bg-white/50'}`}>
                            {currentBioLength}/300
                        </div>
                    </div>
                    {isBioTooLong && (
                        <p className="text-red-500 text-xs mt-2 font-bold px-2 flex items-center gap-1 animate-pulse">
                            <X size={12} /> Description is too long. Please shorten it to save.
                        </p>
                    )}
                </div>

                {/* Interests & Energy */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={22} className="text-gray-900" />
                        <h3 className="font-bold text-gray-900 text-xl">{t('profile.interests')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {vibes.map((vibe, i) => (
                            <EditableTag 
                              key={vibe} 
                              text={vibe} 
                              colorClass={i % 2 === 0 ? "bg-red-100 text-red-500" : "bg-orange-50 text-orange-400"} 
                              onRemove={() => removeVibe(i)}
                            />
                        ))}
                        <button 
                          onClick={() => setActiveModal('vibes')}
                          className="flex items-center gap-1 px-5 py-2 rounded-full text-sm font-semibold bg-white text-gray-400 border border-dashed border-gray-300 hover:border-coral-400 hover:text-coral-500 transition-colors active:scale-95 mb-2"
                        >
                            <Plus size={16} /> {t('profile.add')}
                        </button>
                    </div>
                </div>

                {/* Compatibility */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={22} className="text-gray-900" />
                        <h3 className="font-bold text-gray-900 text-xl">{t('profile.compatibility')}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {compatibility.map((tag, i) => (
                            <EditableTag 
                              key={tag} 
                              text={tag} 
                              colorClass="bg-green-50 text-green-600" 
                              onRemove={() => removeCompatibility(i)}
                            />
                        ))}
                         <button 
                            onClick={() => setActiveModal('compatibility')}
                            className="flex items-center gap-1 px-5 py-2 rounded-full text-sm font-semibold bg-white text-gray-400 border border-dashed border-gray-300 hover:border-green-400 hover:text-green-500 transition-colors active:scale-95 mb-2"
                         >
                            <Plus size={16} /> {t('profile.add')}
                        </button>
                    </div>
                </div>
                
                {/* Health Records Button - Hidden in Create Mode */}
                {!isCreating && (
                    <div className="mb-4">
                    <div className="flex items-center gap-2 mb-4">
                            <Activity size={22} className="text-gray-900" />
                            <h3 className="font-bold text-gray-900 text-xl">{t('profile.healthRecords')}</h3>
                        </div>
                    <button 
                            onClick={onOpenHealth}
                            className="w-full flex items-center justify-between p-5 bg-teal-50 border border-teal-100 rounded-3xl text-teal-700 font-bold hover:bg-teal-100 transition-colors shadow-sm hover:shadow-md"
                    >
                            <div className="flex items-center gap-3">
                                <div className="bg-teal-200 p-2.5 rounded-full text-teal-700 relative">
                                    <Activity size={24} />
                                    {isVerified && <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full border-2 border-teal-200 w-3 h-3"></div>}
                                </div>
                                <div>
                                   <span className="text-lg block">View Health Records</span>
                                   {isVerified && <span className="text-xs text-blue-500 flex items-center gap-1"><BadgeCheck size={12}/> Verified</span>}
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded-full">
                                <Plus size={18} />
                            </div>
                    </button>
                    </div>
                )}

                {/* Settings Button (Inline) */}
                <div className="mb-10">
                   <button 
                        onClick={onOpenSettings}
                        className="w-full flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-3xl text-gray-700 font-bold hover:bg-gray-100 transition-colors shadow-sm hover:shadow-md"
                   >
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-200 p-2.5 rounded-full text-gray-600">
                                <Settings size={24} />
                            </div>
                            <span className="text-lg">{t('settings.title')}</span>
                        </div>
                        <div className="bg-white p-2 rounded-full text-gray-400">
                             <ChevronRight size={18} />
                        </div>
                   </button>
                </div>

                {/* My Human - Editable later */}
                <div className="mb-16">
                     <div className="flex items-center gap-2 mb-4">
                        <User size={22} className="text-gray-900" />
                        <h3 className="font-bold text-gray-900 text-xl">{t('discovery.myHuman')}</h3>
                    </div>
                    <div className="flex items-center p-5 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                        <img 
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" 
                            alt="Owner" 
                            className="w-16 h-16 rounded-full object-cover mr-5 ring-4 ring-gray-50"
                            onError={(e) => {
                                e.currentTarget.src = PLACEHOLDER_AVATAR;
                                e.currentTarget.onerror = null;
                            }}
                        />
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">Linh</h4>
                            <p className="text-sm text-gray-500">Looking for weekend playdates!</p>
                        </div>
                        <button className="ml-auto p-3 text-gray-300 hover:text-coral-500 transition-colors bg-gray-50 rounded-full">
                            <Edit2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Floating Save Button - Optimized placement */}
        <div className="absolute bottom-24 left-0 w-full px-8 flex justify-center pointer-events-none z-30">
             <button 
                onClick={handleSave}
                disabled={isSaving || isBioTooLong}
                className={`
                  pointer-events-auto 
                  flex items-center gap-2 px-10 py-4 rounded-full font-black text-white text-lg shadow-xl 
                  transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed
                  ${saveStatus === 'saved' ? 'bg-green-500 shadow-green-200' : 'bg-coral-500 shadow-coral-200 hover:bg-coral-600'}
                  ${isBioTooLong ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
             >
                {isSaving ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    {t('profile.saving')}
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <Check size={22} />
                    {t('profile.saved')}
                  </>
                ) : (
                  <>
                    <Check size={22} />
                    {isCreating ? t('profile.create') : t('profile.save')}
                  </>
                )}
             </button>
        </div>

        {/* IMPROVED SUCCESS OVERLAY */}
        {saveStatus === 'saved' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                 <div className="bg-white/95 backdrop-blur-xl px-12 py-12 rounded-[40px] shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300 max-w-[85%] text-center border border-white/20 relative overflow-hidden ring-1 ring-black/5">
                    
                    {/* Confetti/Decoration using simple circular divs */}
                    <div className="absolute top-5 right-10 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute bottom-8 left-8 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute top-1/2 left-4 w-2 h-2 bg-red-400 rounded-full animate-pulse" />

                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-green-200 ring-8 ring-green-50 animate-in zoom-in duration-500">
                            <Check size={48} strokeWidth={4} className="text-white drop-shadow-md" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">{t('profile.successTitle')}</h3>
                    <p className="text-gray-500 font-medium text-base leading-relaxed">{t('profile.successMsg')}</p>
                 </div>
            </div>
        )}

        {/* Tag Selection Modal */}
        {activeModal && (
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto rounded-t-3xl sm:rounded-3xl p-6 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {t('profile.add')} {activeModal === 'vibes' ? t('profile.interests') : t('profile.compatibility')}
                        </h3>
                        <button 
                            onClick={() => { setActiveModal(null); setCustomTagInput(''); }}
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Custom Input */}
                    <div className="flex gap-2 mb-6">
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={customTagInput}
                                onChange={(e) => setCustomTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(customTagInput)}
                                placeholder="Type your own..." 
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button 
                            onClick={() => handleAddTag(customTagInput)}
                            disabled={!customTagInput.trim()}
                            className="bg-gray-900 text-white px-4 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-800"
                        >
                            {t('profile.add')}
                        </button>
                    </div>

                    {/* Suggestions Grid */}
                    <div className="flex-1 overflow-y-auto mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Suggestions</h4>
                        <div className="flex flex-wrap gap-2">
                            {(activeModal === 'vibes' ? SUGGESTED_VIBES : SUGGESTED_COMPATIBILITY).map((tag) => {
                                const isSelected = activeModal === 'vibes' ? vibes.includes(tag) : compatibility.includes(tag);
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => !isSelected && handleAddTag(tag)}
                                        disabled={isSelected}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                                            isSelected 
                                            ? 'bg-green-100 border-green-200 text-green-700 opacity-50 cursor-default' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-coral-400 hover:text-coral-500'
                                        }`}
                                    >
                                        {tag} {isSelected && <Check size={12} className="inline ml-1" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={() => { setActiveModal(null); setCustomTagInput(''); }}
                        className="w-full py-3.5 bg-coral-500 text-white font-bold rounded-xl shadow-lg shadow-coral-200 hover:bg-coral-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
