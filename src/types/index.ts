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

// ── Report & Block ──

export type ReportReason =
  | 'impersonation'
  | 'harassment'
  | 'minor'
  | 'scam'
  | 'nudity'
  | 'hate_speech'
  | 'offplatform'
  | 'animal_abuse'
  | 'other';

export type ReportStatus = 'pending' | 'reviewing' | 'actioned' | 'dismissed';

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  impersonation: 'Impersonificazione',
  harassment: 'Molestie',
  minor: 'Minorenne',
  scam: 'Truffa',
  nudity: 'Nudità',
  hate_speech: 'Odio / discriminazione',
  offplatform: 'Contatto fuori piattaforma',
  animal_abuse: 'Maltrattamento animali',
  other: 'Altro',
};

export interface Report {
  id: string;
  reporterId: string;
  reportedProfileId?: string;
  reportedDogId?: string;
  reportedMessageId?: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  createdAt: Date;
}

export interface Block {
  blockerId: string;
  blockedId: string;
  createdAt: Date;
}

// ── Settings / Notifications ──

export interface NotificationPrefs {
  matches: boolean;
  messages: boolean;
  likes: boolean;
  events: boolean;
}

// ── Account deletion ──

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
  notificationPrefs?: NotificationPrefs;
  hideFromDiscovery?: boolean;
  deletedAt?: Date | null;
  role?: UserRole;
  isSeed?: boolean;
}

// ── Cookie consent ──

export interface CookieConsent {
  necessary: boolean; // always true
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

// ── Admin / Roles ──

export type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType?: 'profile' | 'dog' | 'message' | 'report';
  targetId?: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPct: number;
  description: string;
  updatedAt: Date;
}

// ── Seed profile ──

export interface SeedProfile {
  id: string;
  city: string;
  neighborhood: string;
  isSeed: true;
  createdAt: Date;
}

// ── Push notification subscription ──

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

// ── Photo moderation ──

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface PhotoModerationItem {
  id: string;
  dogId: string;
  userId: string;
  photoUrl: string;
  nsfwScore: number;
  status: ModerationStatus;
  reviewedBy?: string;
  createdAt: Date;
  reviewedAt?: Date;
}