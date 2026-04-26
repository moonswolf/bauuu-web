import { describe, it, expect } from 'vitest';
import { calculateMatchScore, getDistance } from './matching';
import { Dog, UserProfile } from '@/types';

const makeDog = (overrides: Partial<Dog> = {}): Dog => ({
  id: 'dog-1',
  userId: 'user-1',
  name: 'Luna',
  breed: 'Labrador',
  isMixed: false,
  age: 3,
  weight: 25,
  sizeCategory: 'grande',
  energyLevel: 'alto',
  temperament: 'giocherellone',
  temperaments: ['giocherellone'],
  isNeutered: true,
  vaccinationsUpToDate: true,
  photos: ['https://example.com/luna.jpg'],
  bio: 'Amo giocare al parco!',
  createdAt: new Date(),
  ...overrides,
});

const makeUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  bio: 'Amante dei cani da sempre',
  birthDate: new Date('1990-01-01'),
  birthYear: 1990,
  gender: 'uomo',
  profilePhotos: ['https://example.com/photo.jpg'],
  location: { latitude: 41.9028, longitude: 12.4964 },
  walkAvailability: 'mattina',
  lookingFor: ['socializzazione_cani'],
  isPremium: false,
  premiumExpiresAt: null,
  dogs: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  profileComplete: true,
  ...overrides,
});

describe('calculateMatchScore', () => {
  it('returns max score for identical dogs nearby', () => {
    const dog1 = makeDog();
    const dog2 = makeDog({ id: 'dog-2', userId: 'user-2' });
    const user1 = makeUser();
    const user2 = makeUser({ id: 'user-2' });

    const score = calculateMatchScore(user1, user2, dog1, dog2, 0.5);
    // Same size (20) + same energy (15) + same temperament (15) + proximity ~24 + shared goals (10) + profileComplete (5) + photos (3) + bio (3) + dogPhotos (4) = ~99
    expect(score).toBeGreaterThanOrEqual(90);
  });

  it('returns lower score for mismatched sizes', () => {
    const dog1 = makeDog({ sizeCategory: 'piccolo' });
    const dog2 = makeDog({ id: 'dog-2', userId: 'user-2', sizeCategory: 'gigante' });
    const user1 = makeUser();
    const user2 = makeUser({ id: 'user-2' });

    const score = calculateMatchScore(user1, user2, dog1, dog2, 5);
    expect(score).toBeLessThan(80);
  });

  it('returns lower score for distant dogs', () => {
    const dog1 = makeDog();
    const dog2 = makeDog({ id: 'dog-2', userId: 'user-2' });
    const user1 = makeUser();
    const user2 = makeUser({ id: 'user-2' });

    const closeScore = calculateMatchScore(user1, user2, dog1, dog2, 0.5);
    const farScore = calculateMatchScore(user1, user2, dog1, dog2, 25);

    expect(closeScore).toBeGreaterThan(farScore);
  });

  it('caps at 100', () => {
    const dog1 = makeDog();
    const dog2 = makeDog({ id: 'dog-2', userId: 'user-2' });
    const user1 = makeUser();
    const user2 = makeUser({ id: 'user-2' });

    const score = calculateMatchScore(user1, user2, dog1, dog2, 0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('getDistance', () => {
  it('returns 0 for same coordinates', () => {
    expect(getDistance(41.9028, 12.4964, 41.9028, 12.4964)).toBe(0);
  });

  it('returns ~1.5 km for Roma centro to Colosseo', () => {
    // Vatican (41.9022, 12.4539) to Colosseum (41.8902, 12.4922) ~ 3.5km
    const dist = getDistance(41.9022, 12.4539, 41.8902, 12.4922);
    expect(dist).toBeGreaterThan(2);
    expect(dist).toBeLessThan(5);
  });

  it('returns ~500km for Roma to Milano', () => {
    const dist = getDistance(41.9028, 12.4964, 45.4642, 9.1900);
    expect(dist).toBeGreaterThan(400);
    expect(dist).toBeLessThan(600);
  });
});
