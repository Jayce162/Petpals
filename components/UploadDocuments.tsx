
import React, { useState } from 'react';
import { ArrowLeft, CloudUpload, Camera, Image, FileText, X, ChevronDown, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { PetProfile } from '../types';
import { PLACEHOLDER_AVATAR } from '../constants';

interface UploadDocumentsProps {
  pet: PetProfile;
  onBack: () => void;
  onUploadComplete: () => void;
}

export const UploadDocuments: React.FC<UploadDocumentsProps> = ({ pet, onBack, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([
    { 
        id: 1, 
        name: 'Vaccination_Record_2024.pdf', 
        size: '2.1 MB', 
        progress: 75, 
        type: 'Vaccination Record',
        date: '2024-07-15',
        isImage: false,
        thumbnail: ''
    },
    { 
        id: 2, 
        name: 'Lab_Results_June.jpg', 
        size: '4.5 MB', 
        progress: 100, 
        type: 'Lab Results',
        date: '2024-06-28',
        isImage: true,
        thumbnail: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=100&q=80'
    }
  ]);

  const handleAddMockFile = () => {
    const id = Date.now();
    const newFile = {
        id,
        name: `Scan_${new Date().toLocaleDateString().replace(/\//g, '-')}.jpg`,
        size: '3.2 MB',
        progress: 0,
        type: 'Other',
        date: new Date().toISOString().split('T')[0],
        isImage: true,
        thumbnail: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=100&q=80'
    };
    
    setFiles(prev => [newFile, ...prev]);

    // Simulate upload progress
    setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 45 } : f));
    }, 500);
    setTimeout(() => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: 100 } : f));
    }, 1200);
  };

  const handleUploadSubmit = () => {
      setIsUploading(true);
      // Simulate API upload delay
      setTimeout(() => {
          setIsUploading(false);
          onUploadComplete();
      }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50 text-gray-900 font-sans animate-in slide-in-from-right duration-300">
      {/* Top App Bar */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-gray-100">
        <button 
            onClick={onBack}
            className="text-gray-800 hover:bg-gray-100 p-2 -ml-2 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center">Upload Documents</h2>
        <div className="w-10" /> {/* Spacer to balance header */}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Pet Profile Snippet */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
            <img 
                src={pet.images[0]} 
                alt={pet.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-100"
                onError={(e) => { e.currentTarget.src = PLACEHOLDER_AVATAR; e.currentTarget.onerror = null; }}
            />
            <p className="text-base font-medium flex-1 truncate text-gray-800">For {pet.name}</p>
          </div>
        </div>

        {/* Empty State / File Upload Area */}
        <div className="flex flex-col p-4">
          <div 
            onClick={handleAddMockFile}
            className="flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-coral-200 bg-coral-50/30 px-6 py-10 hover:bg-coral-50/50 transition-colors cursor-pointer active:scale-[0.99]"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <CloudUpload size={48} className="text-coral-500 mb-2" />
              <p className="text-lg font-bold leading-tight text-gray-900">Tap here to upload a file</p>
              <p className="text-gray-500 text-sm font-normal leading-normal max-w-[280px]">
                Add vaccination records, lab results, and more. Supported files: PDF, JPG, PNG.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Method Buttons */}
        <div className="flex justify-center px-4">
          <div className="flex flex-row w-full gap-3 justify-center">
            <button 
                onClick={handleAddMockFile}
                className="flex flex-1 items-center justify-center gap-2 h-12 px-4 bg-white border border-gray-200 rounded-full text-gray-800 text-sm font-bold hover:bg-gray-50 transition active:scale-95 shadow-sm"
            >
              <Camera size={20} />
              <span className="truncate">Take Photo</span>
            </button>
            <button 
                onClick={handleAddMockFile}
                className="flex flex-1 items-center justify-center gap-2 h-12 px-4 bg-white border border-gray-200 rounded-full text-gray-800 text-sm font-bold hover:bg-gray-50 transition active:scale-95 shadow-sm"
            >
              <Image size={20} />
              <span className="truncate">Library</span>
            </button>
          </div>
        </div>

        {/* File Upload List */}
        <h3 className="text-lg font-bold px-4 pb-2 pt-6 text-gray-900">Uploading {files.length} Files</h3>
        <div className="flex flex-col gap-3 px-4">
          
          {files.map((file) => (
            <div key={file.id} className="bg-white p-4 rounded-2xl flex flex-col gap-4 border border-gray-100 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                {/* File Info Header */}
                <div className="flex items-start gap-4">
                    {file.isImage ? (
                        <img 
                            src={file.thumbnail} 
                            alt="Thumbnail" 
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="bg-coral-50 text-coral-500 flex items-center justify-center rounded-lg h-12 w-12 shrink-0">
                            <FileText size={24} />
                        </div>
                    )}
                    
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <p className="text-base font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-gray-500 text-sm">{file.size}</p>
                    </div>
                    <button 
                        onClick={() => setFiles(files.filter(f => f.id !== file.id))}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Input Fields */}
                <div className="flex flex-col gap-3">
                    {/* Document Type Select */}
                    <div className="relative">
                        <select 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl h-12 text-gray-900 text-sm pl-4 pr-10 appearance-none focus:ring-2 focus:ring-coral-200 focus:border-coral-400 outline-none transition-all font-medium"
                            defaultValue={file.type}
                        >
                            <option>Vaccination Record</option>
                            <option>Vet Report</option>
                            <option>Lab Results</option>
                            <option>Other</option>
                        </select>
                        <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    
                    {/* Date Input */}
                    <div className="relative">
                        <input 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl h-12 text-gray-900 text-sm pl-4 pr-10 focus:ring-2 focus:ring-coral-200 focus:border-coral-400 outline-none transition-all font-medium"
                            placeholder="Date of Visit"
                            type="text"
                            defaultValue={file.date}
                        />
                        <Calendar size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Progress Bar */}
                {file.progress < 100 ? (
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-coral-500 h-2 rounded-full transition-all duration-500" style={{ width: `${file.progress}%` }}></div>
                    </div>
                ) : (
                    <div className="w-full bg-green-50 rounded-full h-8 flex items-center justify-between px-3 animate-in fade-in">
                        <p className="text-xs font-bold text-green-600">Upload Complete</p>
                        <CheckCircle size={16} className="text-green-500" />
                    </div>
                )}
            </div>
          ))}

        </div>
      </div>

      {/* Primary CTA */}
      <div className="p-4 pb-8 bg-white border-t border-gray-100 sticky bottom-0 z-20">
        <button 
            onClick={handleUploadSubmit}
            disabled={isUploading || files.length === 0}
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-6 bg-gray-900 text-white text-base font-bold hover:bg-gray-800 active:scale-95 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isUploading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-2" />
                Processing...
              </>
          ) : (
              <span className="truncate">Upload {files.length} Documents</span>
          )}
        </button>
      </div>
    </div>
  );
};
