'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getMatches, getUserProfile } from '@/lib/firestore';
import { Match, UserProfile } from '@/types';

export default function MatchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<(Match & { otherUser: UserProfile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const userMatches = await getMatches(user.uid);
      
      // Get other user profiles for each match
      const matchesWithUsers = await Promise.all(
        userMatches.map(async (match) => {
          const otherUserId = match.user1Id === user.uid ? match.user2Id : match.user1Id;
          const otherUser = await getUserProfile(otherUserId);
          
          return {
            ...match,
            otherUser: otherUser!,
          };
        })
      );

      setMatches(matchesWithUsers.filter(m => m.otherUser));
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/app/chat/${matchId}`);
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    
    let dateObj: Date;
    if (date.toDate) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Oggi';
    } else if (diffDays === 1) {
      return 'Ieri';
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`;
    } else {
      return dateObj.toLocaleDateString('it-IT');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento match...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            I tuoi Match
          </h1>
          <p className="text-gray-600">
            {matches.length === 0 
              ? 'Nessun match ancora' 
              : `${matches.length} match${matches.length > 1 ? '' : ''}`}
          </p>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Nessun match ancora
            </h2>
            <p className="text-gray-600 mb-6">
              Inizia a scoprire nuovi profili per trovare il tuo primo match!
            </p>
            <button
              onClick={() => router.push('/app/discover')}
              className="btn btn-primary"
            >
              Vai a Scopri
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const hasNewMessage = match.lastMessageAt && !match.lastMessageAt;
              
              return (
                <div
                  key={match.id}
                  onClick={() => handleMatchClick(match.id)}
                  className="card p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Profile Photo */}
                    <div className="relative">
                      <img
                        src={match.otherUser.profilePhotos?.[0] || '/placeholder-user.png'}
                        alt={match.otherUser.displayName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {hasNewMessage && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {match.otherUser.displayName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(match.lastMessageAt || match.matchedAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {match.lastMessageAt 
                          ? 'Clicca per continuare la chat'
                          : 'È un match! Inizia a chattare'
                        }
                      </p>
                      
                      {/* Match info */}
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full">
                          Match
                        </span>
                        {match.otherUser.isPremium && (
                          <span className="text-xs px-2 py-1 bg-accent-100 text-accent-800 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}