import {
  collection, doc, getDoc, getDocs, updateDoc, addDoc, query, where, orderBy, limit, serverTimestamp, getCountFromServer, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UserProfile, Report, AdminLog, FeatureFlag, UserRole, ReportStatus, Dog, PhotoModerationItem, ModerationStatus,
} from '@/types';

export { isAdmin, isAdminOrHigher, isSuperadmin } from './roles';

// ── Role check ──

export const getUserRole = async (uid: string): Promise<UserRole> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return 'user';
  return (snap.data().role as UserRole) || 'user';
};

// ── KPI Stats ──

export interface KPIStats {
  totalUsers: number;
  totalDogs: number;
  totalMatches: number;
  totalMessages: number;
  pendingReports: number;
  pendingPhotos: number;
  totalSwipes: number;
}

export const getKPIStats = async (): Promise<KPIStats> => {
  const [usersSnap, dogsSnap, matchesSnap, reportsSnap, swipesSnap, photosSnap] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(collection(db, 'dogs')),
    getCountFromServer(collection(db, 'matches')),
    getCountFromServer(query(collection(db, 'reports'), where('status', '==', 'pending'))),
    getCountFromServer(collection(db, 'swipes')),
    getCountFromServer(query(collection(db, 'photoModeration'), where('status', '==', 'pending'))),
  ]);

  return {
    totalUsers: usersSnap.data().count,
    totalDogs: dogsSnap.data().count,
    totalMatches: matchesSnap.data().count,
    totalMessages: 0, // messages are subcollections, counted separately if needed
    pendingReports: reportsSnap.data().count,
    pendingPhotos: photosSnap.data().count,
    totalSwipes: swipesSnap.data().count,
  };
};

// ── Users list ──

export const getAllUsers = async (limitCount = 50): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile);
};

export const searchUsers = async (searchTerm: string): Promise<UserProfile[]> => {
  // Firestore doesn't support full-text search natively, so we search by display name prefix
  const q = query(
    collection(db, 'users'),
    where('displayName', '>=', searchTerm),
    where('displayName', '<=', searchTerm + '\uf8ff'),
    limit(20),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile);
};

export const getUserDetails = async (uid: string): Promise<{
  profile: UserProfile | null;
  dogs: Dog[];
  reports: Report[];
}> => {
  const [profileSnap, dogsSnap, reportsSnap] = await Promise.all([
    getDoc(doc(db, 'users', uid)),
    getDocs(query(collection(db, 'dogs'), where('userId', '==', uid))),
    getDocs(query(collection(db, 'reports'), where('reportedProfileId', '==', uid))),
  ]);

  return {
    profile: profileSnap.exists() ? { id: profileSnap.id, ...profileSnap.data() } as UserProfile : null,
    dogs: dogsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Dog),
    reports: reportsSnap.docs.map(d => ({ id: d.id, ...d.data() }) as Report),
  };
};

// ── User actions ──

export const suspendUser = async (uid: string, reason: string) => {
  await updateDoc(doc(db, 'users', uid), {
    isSuspended: true,
    suspendedReason: reason,
    hideFromDiscovery: true,
    updatedAt: serverTimestamp(),
  });
};

export const unsuspendUser = async (uid: string) => {
  await updateDoc(doc(db, 'users', uid), {
    isSuspended: false,
    suspendedReason: null,
    hideFromDiscovery: false,
    updatedAt: serverTimestamp(),
  });
};

export const setUserRole = async (uid: string, role: UserRole) => {
  await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
};

// ── Reports / Moderation ──

export const getReports = async (status?: ReportStatus, limitCount = 50): Promise<Report[]> => {
  let q;
  if (status) {
    q = query(collection(db, 'reports'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(limitCount));
  } else {
    q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(limitCount));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Report);
};

export const updateReportStatus = async (reportId: string, status: ReportStatus, resolvedBy: string, notes?: string) => {
  await updateDoc(doc(db, 'reports', reportId), {
    status,
    resolvedBy,
    resolvedAt: serverTimestamp(),
    resolutionNotes: notes || null,
  });
};

// ── Photo moderation ──

export const getPendingPhotos = async (limitCount = 50): Promise<PhotoModerationItem[]> => {
  const q = query(
    collection(db, 'photoModeration'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc'),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as PhotoModerationItem);
};

export const reviewPhoto = async (photoId: string, status: ModerationStatus, reviewerId: string) => {
  await updateDoc(doc(db, 'photoModeration', photoId), {
    status,
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
  });
};

// ── Audit log ──

export const logAdminAction = async (
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  payload?: Record<string, unknown>,
) => {
  await addDoc(collection(db, 'adminLogs'), {
    adminId,
    action,
    targetType: targetType || null,
    targetId: targetId || null,
    payload: payload || null,
    createdAt: serverTimestamp(),
  });
};

export const getAuditLogs = async (limitCount = 100): Promise<AdminLog[]> => {
  const q = query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as AdminLog);
};

// ── Feature flags ──

export const getFeatureFlags = async (): Promise<FeatureFlag[]> => {
  const snap = await getDocs(collection(db, 'featureFlags'));
  return snap.docs.map(d => ({ key: d.id, ...d.data() }) as FeatureFlag);
};

export const updateFeatureFlag = async (key: string, enabled: boolean, rolloutPct: number) => {
  await updateDoc(doc(db, 'featureFlags', key), {
    enabled,
    rolloutPct,
    updatedAt: serverTimestamp(),
  });
};

// ── Seed profiles ──

export const createSeedProfile = async (profileData: {
  displayName: string;
  city: string;
  bio: string;
  dogName: string;
  dogBreed: string;
  dogBio: string;
  dogSize: string;
  dogEnergy: string;
  dogTemperament: string;
  dogPhotos: string[];
  profilePhotos: string[];
}): Promise<string> => {
  const userRef = await addDoc(collection(db, 'users'), {
    displayName: profileData.displayName,
    email: `seed-${Date.now()}@bauuu.demo`,
    bio: profileData.bio,
    profilePhotos: profileData.profilePhotos,
    location: null,
    walkAvailability: '',
    lookingFor: ['socializzazione_cani'],
    isPremium: false,
    premiumExpiresAt: null,
    dogs: [],
    profileComplete: true,
    isSeed: true,
    role: 'user',
    hideFromDiscovery: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'dogs'), {
    userId: userRef.id,
    name: profileData.dogName,
    breed: profileData.dogBreed,
    bio: profileData.dogBio,
    isMixed: false,
    age: Math.floor(Math.random() * 10) + 1,
    weight: Math.floor(Math.random() * 30) + 5,
    sizeCategory: profileData.dogSize,
    energyLevel: profileData.dogEnergy,
    temperament: profileData.dogTemperament,
    temperaments: [profileData.dogTemperament],
    isNeutered: Math.random() > 0.5,
    vaccinationsUpToDate: true,
    photos: profileData.dogPhotos,
    isSeed: true,
    moderationStatus: 'approved',
    createdAt: serverTimestamp(),
  });

  return userRef.id;
};

export const getSeedProfiles = async (): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), where('isSeed', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile);
};
