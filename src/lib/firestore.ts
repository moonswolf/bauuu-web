import {
  collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { UserProfile, Dog, Swipe, Match, Message, SwipeDirection } from '@/types';

// ── Image Upload ──
export const uploadDogPhoto = async (dogId: string, file: File, index: number): Promise<string> => {
  const path = `dogs/${dogId}/photo_${index}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
};

export const uploadUserPhoto = async (uid: string, file: File, index: number): Promise<string> => {
  const path = `users/${uid}/photo_${index}_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: 'image/jpeg' });
  return getDownloadURL(storageRef);
};

// ── Delete Dog ──
export const deleteDog = async (dogId: string) => {
  await deleteDoc(doc(db, 'dogs', dogId));
};

// ── Users ──
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
};

export const updateUserProfile = async (uid: string, data: Record<string, any>) => {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { ...data, id: uid, updatedAt: serverTimestamp() }, { merge: true });
};

// ── Dogs ──
export const addDog = async (uid: string, dog: Omit<Dog, 'id' | 'userId' | 'createdAt'>) => {
  const ref = await addDoc(collection(db, 'dogs'), {
    ...dog,
    userId: uid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserDogs = async (uid: string): Promise<Dog[]> => {
  const q = query(collection(db, 'dogs'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Dog);
};

export const updateDog = async (dogId: string, data: Partial<Dog>) => {
  await updateDoc(doc(db, 'dogs', dogId), data);
};

// ── Discover ──
export const getDiscoverUsers = async (currentUid: string, limitCount = 20): Promise<UserProfile[]> => {
  const q = query(
    collection(db, 'users'),
    where('profileComplete', '==', true),
    limit(limitCount),
  );
  const snap = await getDocs(q);
  return snap.docs
    .filter(d => d.id !== currentUid)
    .map(d => ({ id: d.id, ...d.data() }) as UserProfile);
};

// ── Swipes ──
export const recordSwipe = async (swiperUid: string, swipedUid: string, direction: SwipeDirection) => {
  const swipeId = `${swiperUid}_${swipedUid}`;
  await setDoc(doc(db, 'swipes', swipeId), {
    swiperUserId: swiperUid,
    swipedUserId: swipedUid,
    direction,
    createdAt: serverTimestamp(),
  });

  // Check for mutual like
  if (direction === 'like' || direction === 'superlike') {
    const reverseId = `${swipedUid}_${swiperUid}`;
    const reverseSnap = await getDoc(doc(db, 'swipes', reverseId));
    if (reverseSnap.exists()) {
      const reverseData = reverseSnap.data();
      if (reverseData.direction === 'like' || reverseData.direction === 'superlike') {
        await createMatch(swiperUid, swipedUid);
        return true; // It's a match!
      }
    }
  }
  return false;
};

// ── Matches ──
const createMatch = async (uid1: string, uid2: string) => {
  const matchId = [uid1, uid2].sort().join('_');
  await setDoc(doc(db, 'matches', matchId), {
    user1Id: uid1,
    user2Id: uid2,
    matchedAt: serverTimestamp(),
    status: 'active',
    lastMessageAt: null,
  });
};

export const getMatches = async (uid: string): Promise<Match[]> => {
  const q1 = query(collection(db, 'matches'), where('user1Id', '==', uid), where('status', '==', 'active'));
  const q2 = query(collection(db, 'matches'), where('user2Id', '==', uid), where('status', '==', 'active'));
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const matches = [
    ...snap1.docs.map(d => ({ id: d.id, ...d.data() }) as Match),
    ...snap2.docs.map(d => ({ id: d.id, ...d.data() }) as Match),
  ];
  return matches.sort((a, b) => {
    const aTime = (a.lastMessageAt as unknown as Timestamp)?.toMillis?.() || (a.matchedAt as unknown as Timestamp)?.toMillis?.() || 0;
    const bTime = (b.lastMessageAt as unknown as Timestamp)?.toMillis?.() || (b.matchedAt as unknown as Timestamp)?.toMillis?.() || 0;
    return bTime - aTime;
  });
};

export const unmatch = async (matchId: string) => {
  await updateDoc(doc(db, 'matches', matchId), { status: 'unmatched' });
};

// ── Messages ──
export const sendMessage = async (matchId: string, senderId: string, content: string, type: 'text' | 'image' = 'text') => {
  await addDoc(collection(db, 'matches', matchId, 'messages'), {
    senderId,
    content,
    mediaUrl: null,
    messageType: type,
    readAt: null,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'matches', matchId), { lastMessageAt: serverTimestamp() });
};

export const subscribeToMessages = (matchId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'matches', matchId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Message));
  });
};

// ── Swiped check ──
export const getSwipedUserIds = async (uid: string): Promise<Set<string>> => {
  const q = query(collection(db, 'swipes'), where('swiperUserId', '==', uid));
  const snap = await getDocs(q);
  return new Set(snap.docs.map(d => d.data().swipedUserId));
};