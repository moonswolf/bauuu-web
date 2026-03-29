import { Dog, UserProfile, DiscoverCard, SizeCategory, EnergyLevel, Temperament } from '@/types';

const SIZE_ORDER: Record<SizeCategory, number> = { piccolo: 0, medio: 1, grande: 2, gigante: 3 };
const ENERGY_ORDER: Record<EnergyLevel, number> = { basso: 0, medio: 1, alto: 2 };

const TEMPERAMENT_MATRIX: Record<Temperament, Record<Temperament, number>> = {
  giocherellone: { giocherellone: 15, timido: 5, dominante: 8, tranquillo: 10 },
  timido:        { giocherellone: 5, timido: 10, dominante: 2, tranquillo: 15 },
  dominante:     { giocherellone: 8, timido: 2, dominante: 3, tranquillo: 10 },
  tranquillo:    { giocherellone: 10, timido: 15, dominante: 10, tranquillo: 12 },
};

function dogCompatibility(dog1: Dog, dog2: Dog): number {
  let score = 0;
  // Size (max 20)
  const sizeGap = Math.abs(SIZE_ORDER[dog1.sizeCategory] - SIZE_ORDER[dog2.sizeCategory]);
  score += sizeGap === 0 ? 20 : sizeGap === 1 ? 12 : sizeGap === 2 ? 5 : 0;
  // Energy (max 15)
  const energyGap = Math.abs(ENERGY_ORDER[dog1.energyLevel] - ENERGY_ORDER[dog2.energyLevel]);
  score += energyGap === 0 ? 15 : energyGap === 1 ? 8 : 0;
  // Temperament (max 15)
  score += TEMPERAMENT_MATRIX[dog1.temperament][dog2.temperament];
  return score; // max 50
}

function proximityScore(distance: number): number {
  if (distance < 1) return 25;
  if (distance > 20) return 0;
  return Math.round(25 * (1 - distance / 20));
}

function profileScore(user1: UserProfile, user2: UserProfile): number {
  let score = 0;
  const sharedGoals = user1.lookingFor.filter(g => user2.lookingFor.includes(g));
  score += sharedGoals.length > 0 ? 10 : 0;
  score += user2.profileComplete ? 5 : 0;
  return score; // max 15
}

function engagementScore(user: UserProfile): number {
  let score = 0;
  score += user.profilePhotos.length > 0 ? 3 : 0;
  score += user.bio.length > 20 ? 3 : 0;
  score += user.dogs.length > 0 && user.dogs[0].photos.length > 0 ? 4 : 0;
  return score; // max 10
}

export function calculateMatchScore(
  currentUser: UserProfile,
  otherUser: UserProfile,
  currentDog: Dog,
  otherDog: Dog,
  distance: number,
): number {
  const dogScore = dogCompatibility(currentDog, otherDog);
  const proxScore = proximityScore(distance);
  const profScore = profileScore(currentUser, otherUser);
  const engScore = engagementScore(otherUser);
  return Math.min(100, dogScore + proxScore + profScore + engScore);
}

export function getDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}