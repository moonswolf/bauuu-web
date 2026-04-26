'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getPendingPhotos, reviewPhoto, logAdminAction } from '@/lib/admin';
import { PhotoModerationItem } from '@/types';

export default function AdminPhotosPage() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<PhotoModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPendingPhotos()
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (photoId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    try {
      await reviewPhoto(photoId, status, user.uid);
      await logAdminAction(user.uid, `photo_${status}`, 'dog', photoId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (error) {
      console.error('Error reviewing photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderazione foto</h1>

      {photos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-gray-500">Nessuna foto in attesa di revisione</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={photo.photoUrl}
                  alt="Foto da moderare"
                  className="w-full h-full object-cover"
                />
                {photo.nsfwScore > 0.5 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    NSFW: {(photo.nsfwScore * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 mb-2">
                  Utente: {photo.userId.slice(0, 8)}...
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(photo.id, 'approved')}
                    className="flex-1 text-xs px-2 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Approva
                  </button>
                  <button
                    onClick={() => handleReview(photo.id, 'rejected')}
                    className="flex-1 text-xs px-2 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Rifiuta
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
