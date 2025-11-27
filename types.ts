
export enum Species {
  DOG = 'Dog',
  CAT = 'Cat',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum EnergyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Size {
  MINI = 'Mini',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  GIANT = 'Giant',
}

export type Language = 'en' | 'vi';

export interface PetProfile {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: number;
  gender: Gender;
  isNeutered: boolean;
  images: string[];
  energyLevel: EnergyLevel;
  size: Size;
  vibes: string[];
  compatibility: string[];
  bio: string;
  distance: number; // km
  ownerName: string;
  isVerified?: boolean; // New field for verification status
}

export interface Match {
  id: string;
  petId: string;
  matchedAt: Date;
  lastMessage?: string;
  isFirstMoveYours: boolean; // Derived from Bumble logic
  expiresAt: Date;
  lastExtendedAt?: Date;
}

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorImage: string;
  isVerified?: boolean;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface Vaccination {
  id: string;
  name: string;
  dateGiven: string;
  nextDueDate?: string;
}

export interface VetVisit {
  id: string;
  date: string;
  clinicName: string;
  reason: string;
  notes?: string;
  phone?: string;
  email?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  endDate?: string;
}

export type Tab = 'social' | 'discovery' | 'beeline' | 'matches' | 'profile';
