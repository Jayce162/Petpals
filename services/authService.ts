
import { EnergyLevel, Gender, PetProfile, Size, Species } from "../types";

// Mock profiles returned from different social providers
const GOOGLE_USER_PET: PetProfile = {
  id: 'google_user_1',
  name: 'Cooper',
  species: Species.DOG,
  breed: 'Golden Retriever',
  age: 3,
  gender: Gender.MALE,
  isNeutered: true,
  images: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'],
  energyLevel: EnergyLevel.HIGH,
  size: Size.LARGE,
  vibes: ['Friendly', 'Swimmer', 'Fetch'],
  compatibility: ['Kids', 'Dogs'],
  bio: 'Just a happy go lucky golden looking for friends!',
  distance: 0,
  ownerName: 'Alex',
  isVerified: true,
};

const FACEBOOK_USER_PET: PetProfile = {
  id: 'fb_user_1',
  name: 'Whiskers',
  species: Species.CAT,
  breed: 'Siamese',
  age: 5,
  gender: Gender.FEMALE,
  isNeutered: true,
  images: ['https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80'],
  energyLevel: EnergyLevel.MEDIUM,
  size: Size.SMALL,
  vibes: ['Vocal', 'Cuddly'],
  compatibility: ['Cats'],
  bio: 'I run this house. Message me if you have treats.',
  distance: 0,
  ownerName: 'Jordan',
  isVerified: true,
};

const APPLE_USER_PET: PetProfile = {
  id: 'apple_user_1',
  name: 'Shadow',
  species: Species.DOG,
  breed: 'Husky',
  age: 2,
  gender: Gender.MALE,
  isNeutered: true,
  images: ['https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80'],
  energyLevel: EnergyLevel.HIGH,
  size: Size.LARGE,
  vibes: ['Howling', 'Running', 'Snow'],
  compatibility: ['Active Owners'],
  bio: 'Born to run. Looking for a hiking buddy.',
  distance: 0,
  ownerName: 'Taylor',
  isVerified: true,
};

export const authService = {
  loginWithGoogle: async (): Promise<PetProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(GOOGLE_USER_PET), 1500);
    });
  },

  loginWithFacebook: async (): Promise<PetProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(FACEBOOK_USER_PET), 1500);
    });
  },

  loginWithApple: async (): Promise<PetProfile> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(APPLE_USER_PET), 1500);
    });
  }
};
