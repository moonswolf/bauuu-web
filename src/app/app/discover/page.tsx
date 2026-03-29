'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getDiscoverUsers, getUserDogs, getSwipedUserIds, recordSwipe } from '@/lib/firestore';
import { calculateMatchScore, getDistance } from '@/lib/matching';
import SwipeCard from '@/components/SwipeCard';
import ProfileModal from '@/components/ProfileModal';
import { UserProfile, Dog, SwipeDirection, DiscoverCard } from '@/types';

export default function DiscoverPage() {
  const { user, userProfile } = useAuth();
  const [cards, setCards] = useState<DiscoverCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userDogs, setUserDogs] = useState<Dog[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      loadDiscoverData();
    }
  }, [user, userProfile]);

  const loadDiscoverData = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      
      // Get user's dogs
      const dogs = await getUserDogs(user.uid);
      setUserDogs(dogs);
      
      if (dogs.length === 0) {
        console.log('No dogs found for user');
        setLoading(false);
        return;
      }

      // Get potential matches
      const potentialMatches = await getDiscoverUsers(user.uid, 50);
      
      // Get already swiped user IDs
      const swipedIds = await getSwipedUserIds(user.uid);
      
      // Filter out already swiped users
      const unswipedUsers = potentialMatches.filter(u => !swipedIds.has(u.id));
      
      // Create discover cards with match scores
      const discoverCards: DiscoverCard[] = [];
      const currentDog = dogs[0]; // Use first dog for matching
      
      for (const otherUser of unswipedUsers) {
        // Get other user's dogs
        const otherDogs = await getUserDogs(otherUser.id);
        if (otherDogs.length === 0) continue;
        
        const otherDog = otherDogs[0]; // Use first dog
        
        // Calculate distance (default to 5km if no location)
        let distance = 5;
        if (userProfile.location && otherUser.location) {
          distance = getDistance(
            userProfile.location.latitude,
            userProfile.location.longitude,
            otherUser.location.latitude,
            otherUser.location.longitude
          );
        }
        
        // Calculate match score
        const matchScore = calculateMatchScore(
          userProfile,
          otherUser,
          currentDog,
          otherDog,
          distance
        );
        
        discoverCards.push({
          user: otherUser,
          dog: otherDog,
          matchScore,
          distance,
        });
      }
      
      // Sort by match score (highest first)
      discoverCards.sort((a, b) => b.matchScore - a.matchScore);
      
      setCards(discoverCards);
    } catch (error) {
      console.error('Error loading discover data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: SwipeDirection) => {
    if (!user || currentCardIndex >= cards.length) return;

    const currentCard = cards[currentCardIndex];
    
    try {
      const isMatch = await recordSwipe(user.uid, currentCard.user.id, direction);
      
      if (isMatch && direction !== 'pass') {
        setShowMatchModal(true);
        setTimeout(() => setShowMatchModal(false), 3000);
      }
      
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
      
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cercando nuovi amici...</p>
        </div>
      </div>
    );
  }

  if (userDogs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🐕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Nessun cane nel profilo
          </h2>
          <p className="text-gray-600 mb-6">
            Aggiungi il profilo del tuo cane per iniziare a scoprire nuovi amici
          </p>
          <button
            onClick={() => window.location.href = '/setup/dog'}
            className="btn btn-primary"
          >
            Aggiungi cane
          </button>
        </div>
      </div>
    );
  }

  if (currentCardIndex >= cards.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Hai visto tutti!
          </h2>
          <p className="text-gray-600 mb-6">
            Non ci sono più profili da scoprire in questo momento.
            Torna più tardi per nuove possibilità!
          </p>
          <button
            onClick={loadDiscoverData}
            className="btn btn-primary"
          >
            Ricarica
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="h-screen bg-primary-500 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between text-white">
        <h1 className="text-2xl font-bold">🐕 Bauuu</h1>
        <div className="text-sm opacity-75">
          {cards.length - currentCardIndex} restanti
        </div>
      </div>

      {/* Swipe Cards */}
      <div className="relative h-full">
        {/* Show next card behind current one */}
        {cards[currentCardIndex + 1] && (
          <div className="absolute inset-4 bg-white rounded-2xl shadow-lg opacity-50 scale-95">
            <img
              src={cards[currentCardIndex + 1].dog.photos?.[0] || '/placeholder-dog.png'}
              alt="Next"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Current card */}
        <SwipeCard
          user={currentCard.user}
          dog={currentCard.dog}
          matchScore={currentCard.matchScore}
          distance={currentCard.distance}
          onSwipe={handleSwipe}
          onProfileClick={handleProfileClick}
        />
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentCard.user}
        dog={currentCard.dog}
      />

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold mb-2">È un Match!</h2>
            <p className="text-lg opacity-90">
              Tu e {currentCard.user.displayName} vi siete piaciuti!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}