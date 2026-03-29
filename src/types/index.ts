export type SizeCategory = 'piccolo' | 'medio' | 'grande' | 'gigante';
export type EnergyLevel = 'basso' | 'medio' | 'alto';
export type Temperament = 'giocherellone' | 'timido' | 'dominante' | 'tranquillo';
export type LookingFor = 'amicizia' | 'dating' | 'socializzazione_cani';
export type SwipeDirection = 'like' | 'pass' | 'superlike';
export type Gender = 'uomo' | 'donna' | 'altro';

export interface Dog {
  id: string;
  userId: string;
  name: string;
  breed: string;
  isMixed: boolean;
  age: number;
  weight: number;
  sizeCategory: SizeCategory;
  energyLevel: EnergyLevel;
  temperament: Temperament;
  temperaments: Temperament[];
  isNeutered: boolean;
  vaccinationsUpToDate: boolean;
  photos: string[];
  bio: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  bio: string;
  birthDate: Date;
  birthYear: number;
  gender: Gender;
  profilePhotos: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
  walkAvailability: string;
  lookingFor: LookingFor[];
  isPremium: boolean;
  premiumExpiresAt: Date | null;
  dogs: Dog[];
  createdAt: Date;
  updatedAt: Date;
  profileComplete: boolean;
}

export interface Swipe {
  id: string;
  swiperUserId: string;
  swipedUserId: string;
  direction: SwipeDirection;
  createdAt: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: Date;
  status: 'active' | 'unmatched';
  lastMessageAt: Date | null;
  otherUser?: UserProfile;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  mediaUrl: string | null;
  messageType: 'text' | 'image' | 'video' | 'voice';
  readAt: Date | null;
  createdAt: Date;
}

export interface DiscoverCard {
  user: UserProfile;
  dog: Dog;
  matchScore: number;
  distance: number;
}