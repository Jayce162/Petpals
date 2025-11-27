
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Syringe, Pill, Stethoscope, Plus, Calendar, MapPin, Activity, Clock, X, Phone, Mail, UploadCloud, ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Medication, PetProfile, Vaccination, VetVisit } from '../types';
import { UploadDocuments } from './UploadDocuments';

interface HealthRecordsProps {
  activePet: PetProfile;
  onBack: () => void;
  onUpdatePet: (pet: PetProfile) => void;
}

export const HealthRecords: React.FC<HealthRecordsProps> = ({ activePet, onBack, onUpdatePet }) => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'vaccines' | 'visits' | 'meds'>('vaccines');
  const [showModal, setShowModal] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showVerificationCelebration, setShowVerificationCelebration] = useState(false);

  // Mock Data
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    { id: 'v1', name: 'Rabies', dateGiven: '2023-10-15', nextDueDate: '2024-10-15' },
    { id: 'v2', name: 'DHPP', dateGiven: '2023-09-01', nextDueDate: '2024-09-01' }
  ]);

  const [medications, setMedications] = useState<Medication[]>([
    { id: 'm1', name: 'Heartgard', dosage: '1 tablet', frequency: 'Monthly', endDate: '2024-12-31' }
  ]);

  const [visits, setVisits] = useState<VetVisit[]>([
    { 
        id: 'vis1', 
        date: '2023-10-15', 
        clinicName: 'City Paws Vet', 
        reason: 'Annual Checkup', 
        notes: 'Healthy weight, teeth look good.',
        phone: '555-0123',
        email: 'contact@citypawsvet.com'
    }
  ]);

  // Form States
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNextDate, setFormNextDate] = useState('');
  const [formClinic, setFormClinic] = useState('');
  const [formReason, setFormReason] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formNotes, setFormNotes] = useState('');
  
  // Contact info for vet visits
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const handleAdd = () => {
    let recordAdded = false;

    if (activeSection === 'vaccines') {
      if (!formName || !formDate) return;
      const newVac: Vaccination = {
        id: Date.now().toString(),
        name: formName,
        dateGiven: formDate,
        nextDueDate: formNextDate
      };
      setVaccinations([newVac, ...vaccinations]);
      recordAdded = true;
      
    } else if (activeSection === 'visits') {
      if (!formDate || !formClinic) return;
      const newVisit: VetVisit = {
        id: Date.now().toString(),
        date: formDate,
        clinicName: formClinic,
        reason: formReason,
        notes: formNotes,
        phone: formPhone,
        email: formEmail
      };
      setVisits([newVisit, ...visits]);
      recordAdded = true;

    } else if (activeSection === 'meds') {
      if (!formName) return;
      const newMed: Medication = {
        id: Date.now().toString(),
        name: formName,
        dosage: formDosage,
        frequency: formFrequency,
        endDate: formNextDate // recycling this state field for end date
      };
      setMedications([newMed, ...medications]);
      recordAdded = true;
    }

    // Auto-Verification Logic
    // If a record was successfully added and the pet isn't verified yet, verify them.
    if (recordAdded && !activePet.isVerified) {
      onUpdatePet({ ...activePet, isVerified: true });
      setShowVerificationCelebration(true);
      setTimeout(() => setShowVerificationCelebration(false), 4000);
    }

    closeModal();
  };
  
  const handleUploadComplete = () => {
      // Upon successful document upload, verify the pet if not already
      if (!activePet.isVerified) {
          onUpdatePet({ ...activePet, isVerified: true });
          setShowVerificationCelebration(true);
          setTimeout(() => setShowVerificationCelebration(false), 4000);
      }
      setShowUpload(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormName('');
    setFormDate('');
    setFormNextDate('');
    setFormClinic('');
    setFormReason('');
    setFormDosage('');
    setFormFrequency('');
    setFormNotes('');
    setFormPhone('');
    setFormEmail('');
  };

  if (showUpload) {
      return <UploadDocuments pet={activePet} onBack={() => setShowUpload(false)} onUploadComplete={handleUploadComplete} />;
  }

  const SectionTab = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all relative ${
        activeSection === id ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <Icon size={24} strokeWidth={activeSection === id ? 2.5 : 2} />
      <span className="text-xs font-bold">{label}</span>
      {activeSection === id && (
        <div className="absolute bottom-0 w-12 h-1 bg-teal-500 rounded-t-full" />
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 animate-in slide-in-from-right duration-300 relative overflow-hidden">
      {/* Celebration Overlay */}
      {showVerificationCelebration && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute top-10 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" />
          <div className="absolute top-20 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="absolute bottom-1/3 left-10 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-teal-100 flex items-center gap-3 animate-in zoom-in duration-500">
            <div className="bg-teal-100 p-2 rounded-full">
              <BadgeCheck className="text-teal-600" size={32} />
            </div>
            <div>
              <h3 className="text-teal-900 font-bold">Account Verified!</h3>
              <p className="text-teal-700 text-xs">Thanks for keeping your pet healthy.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4 flex items-center justify-between z-10 sticky top-0">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{t('health.title')}</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowUpload(true)}
                className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-teal-600 hover:border-teal-200 transition active:scale-95"
                title="Upload Documents"
            >
                <UploadCloud size={18} />
            </button>
            <button 
                onClick={() => setShowModal(true)}
                className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-teal-200 hover:bg-teal-600 transition active:scale-95"
            >
                <Plus size={20} />
            </button>
        </div>
      </div>
      
      {/* Verification Banner */}
      {!activePet.isVerified ? (
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-start gap-3 transition-colors duration-500">
            <ShieldCheck className="text-blue-500 shrink-0 mt-1" size={20} />
            <div>
                <h3 className="text-blue-900 font-bold text-sm">Get Verified</h3>
                <p className="text-blue-700 text-xs leading-tight">Add a vaccination, vet visit, or medication to automatically verify your pet profile.</p>
            </div>
        </div>
      ) : (
        <div className="bg-teal-50 px-4 py-3 border-b border-teal-100 flex items-center gap-3 justify-center transition-colors duration-500 animate-in fade-in">
             <BadgeCheck className="text-teal-500 shrink-0" size={20} />
             <p className="text-teal-800 font-bold text-sm">Verified Profile</p>
             {showVerificationCelebration && <Sparkles className="text-yellow-400 animate-spin" size={16} />}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        <SectionTab id="vaccines" label={t('health.vaccinations')} icon={Syringe} />
        <SectionTab id="visits" label={t('health.vetVisits')} icon={Stethoscope} />
        <SectionTab id="meds" label={t('health.medications')} icon={Pill} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        
        {/* Vaccinations List */}
        {activeSection === 'vaccines' && (
          <div className="space-y-3">
            {vaccinations.length === 0 ? (
                <EmptyState msg={t('health.empty')} />
            ) : vaccinations.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{v.name}</h3>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    Done
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Calendar size={14} className="text-teal-500" />
                  {t('health.date')}: {v.dateGiven}
                </div>
                {v.nextDueDate && (
                  <div className="flex items-center gap-2 text-orange-500 text-sm font-medium">
                    <Clock size={14} />
                    {t('health.nextDue')}: {v.nextDueDate}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vet Visits List */}
        {activeSection === 'visits' && (
          <div className="space-y-3 relative">
             {/* Decorative line for timeline effect */}
             <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 z-0" />
             
             {visits.length === 0 ? (
                <EmptyState msg={t('health.empty')} />
             ) : visits.map((v) => (
              <div key={v.id} className="relative pl-10 z-10">
                 <div className="absolute left-[11px] top-6 w-3 h-3 bg-teal-500 rounded-full border-2 border-white ring-2 ring-teal-100" />
                 
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{v.date}</div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{v.clinicName}</h3>
                    <p className="text-teal-600 font-medium text-sm mb-2">{v.reason}</p>
                    {v.notes && (
                        <p className="text-gray-500 text-sm bg-gray-50 p-2 rounded-lg italic mb-3">
                            "{v.notes}"
                        </p>
                    )}

                    {/* Call / Email Actions */}
                    {(v.phone || v.email) && (
                        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                            {v.phone && (
                                <a 
                                  href={`tel:${v.phone}`}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-700 rounded-xl text-sm font-bold hover:bg-teal-100 transition-colors flex-1 active:scale-95"
                                >
                                    <Phone size={18} />
                                    {t('health.callVet')}
                                </a>
                            )}
                            {v.email && (
                                <a 
                                  href={`mailto:${v.email}`}
                                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors flex-1 active:scale-95"
                                >
                                    <Mail size={18} />
                                    {t('health.emailVet')}
                                </a>
                            )}
                        </div>
                    )}
                 </div>
              </div>
            ))}
          </div>
        )}

        {/* Medications List */}
        {activeSection === 'meds' && (
          <div className="grid grid-cols-1 gap-3">
            {medications.length === 0 ? (
                <EmptyState msg={t('health.empty')} />
            ) : medications.map((m) => (
              <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-500">
                    <Pill size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-500">{m.dosage} • {m.frequency}</p>
                    {m.endDate && <p className="text-xs text-gray-400 mt-1">Until: {m.endDate}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{t('health.add')}</h2>
                    <button onClick={closeModal} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {activeSection === 'vaccines' && (
                        <>
                            <Input label={t('health.name')} value={formName} onChange={setFormName} placeholder="e.g. Rabies" />
                            <Input label={t('health.date')} type="date" value={formDate} onChange={setFormDate} />
                            <Input label={t('health.nextDue')} type="date" value={formNextDate} onChange={setFormNextDate} />
                        </>
                    )}
                    {activeSection === 'visits' && (
                        <>
                            <Input label={t('health.clinic')} value={formClinic} onChange={setFormClinic} placeholder="Vet Clinic Name" />
                            <Input label={t('health.date')} type="date" value={formDate} onChange={setFormDate} />
                            <Input label={t('health.reason')} value={formReason} onChange={setFormReason} placeholder="Checkup, Emergency..." />
                            <Input label={t('health.notes')} value={formNotes} onChange={setFormNotes} placeholder="Weight, advice..." />
                            
                            <div className="flex gap-3">
                                <Input label={t('health.phone')} type="tel" value={formPhone} onChange={setFormPhone} placeholder="555-0123" />
                                <Input label={t('health.email')} type="email" value={formEmail} onChange={setFormEmail} placeholder="vet@clinic.com" />
                            </div>
                        </>
                    )}
                    {activeSection === 'meds' && (
                        <>
                            <Input label={t('health.name')} value={formName} onChange={setFormName} placeholder="Medication Name" />
                            <div className="flex gap-3">
                                <Input label={t('health.dosage')} value={formDosage} onChange={setFormDosage} placeholder="10mg" />
                                <Input label={t('health.frequency')} value={formFrequency} onChange={setFormFrequency} placeholder="Daily" />
                            </div>
                            <Input label="End Date (Optional)" type="date" value={formNextDate} onChange={setFormNextDate} />
                        </>
                    )}
                </div>

                <button 
                    onClick={handleAdd}
                    className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-600 transition-colors"
                >
                    Save Record
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Activity size={48} className="mb-3 opacity-20" />
        <p className="font-medium">{msg}</p>
    </div>
);

const Input = ({ label, type = "text", value, onChange, placeholder }: any) => (
    <div className="w-full">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
        />
    </div>
);
