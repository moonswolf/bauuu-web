'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import { getUserDogs, updateUserProfile, updateDog, deleteDog } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';
import { Dog, Gender, LookingFor } from '@/types';

const genderOptions: { value: Gender; label: string }[] = [
  { value: 'uomo', label: 'Uomo' },
  { value: 'donna', label: 'Donna' },
  { value: 'altro', label: 'Altro' },
];

const lookingForOptions: { value: LookingFor; label: string }[] = [
  { value: 'amicizia', label: 'Amicizia' },
  { value: 'dating', label: 'Dating' },
  { value: 'socializzazione_cani', label: 'Socializzazione cani' },
];

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userDogs, setUserDogs] = useState<Dog[]>([]);
  
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    gender: '' as Gender,
    lookingFor: [] as LookingFor[],
    profilePhotos: [] as string[],
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        gender: userProfile.gender || 'uomo',
        lookingFor: userProfile.lookingFor || [],
        profilePhotos: userProfile.profilePhotos || [],
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (user) {
      loadUserDogs();
    }
  }, [user]);

  const loadUserDogs = async () => {
    if (!user) return;
    
    try {
      const dogs = await getUserDogs(user.uid);
      setUserDogs(dogs);
    } catch (error) {
      console.error('Error loading dogs:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await updateUserProfile(user.uid, formData);
      setEditMode(false);
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Errore durante il salvataggio del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      profilePhotos: [...prev.profilePhotos, url]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      profilePhotos: prev.profilePhotos.filter((_, i) => i !== index)
    }));
  };

  const handleLookingForToggle = (value: LookingFor) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter(item => item !== value)
        : [...prev.lookingFor, value]
    }));
  };

  const handleDeleteDog = async (dogId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cane?')) return;

    try {
      await deleteDog(dogId);
      await loadUserDogs();
    } catch (error) {
      console.error('Error deleting dog:', error);
      alert('Errore durante l\'eliminazione del cane');
    }
  };

  const handleSignOut = async () => {
    if (!confirm('Sei sicuro di voler uscire?')) return;
    
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Il tuo profilo</h1>
          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn btn-secondary text-sm px-4 py-2"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  {loading ? 'Salvando...' : 'Salva'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="btn btn-primary text-sm px-4 py-2"
              >
                Modifica
              </button>
            )}
          </div>
        </div>

        {/* User Profile Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            👤 Informazioni personali
          </h2>

          {editMode ? (
            <div className="space-y-4">
              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Foto profilo
                </label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[0, 1, 2].map(index => (
                    <div key={index} className="aspect-square relative">
                      {formData.profilePhotos[index] ? (
                        <div className="relative w-full h-full">
                          <img
                            src={formData.profilePhotos[index]}
                            alt="Foto profilo"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <ImageUpload
                          type="user"
                          userId={user?.uid || ''}
                          index={index}
                          onUploadComplete={handlePhotoUpload}
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="input"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="input h-24 resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/300 caratteri
                </p>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Genere
                </label>
                <div className="space-y-2">
                  {genderOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as Gender }))}
                        className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cosa cerchi?
                </label>
                <div className="space-y-2">
                  {lookingForOptions.map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.lookingFor.includes(option.value)}
                        onChange={() => handleLookingForToggle(option.value)}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Photos */}
              {userProfile.profilePhotos && userProfile.profilePhotos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {userProfile.profilePhotos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt="Foto profilo"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Nome:</span>
                  <p className="font-medium">{userProfile.displayName}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Email:</span>
                  <p className="font-medium">{userProfile.email}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Genere:</span>
                  <p className="font-medium capitalize">{userProfile.gender}</p>
                </div>
                
                <div>
                  <span className="text-gray-600 text-sm">Anno di nascita:</span>
                  <p className="font-medium">{userProfile.birthYear}</p>
                </div>
              </div>

              {userProfile.bio && (
                <div>
                  <span className="text-gray-600 text-sm">Bio:</span>
                  <p className="mt-1">{userProfile.bio}</p>
                </div>
              )}

              {userProfile.lookingFor && userProfile.lookingFor.length > 0 && (
                <div>
                  <span className="text-gray-600 text-sm">Cerca:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {userProfile.lookingFor.map((goal) => (
                      <span
                        key={goal}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        {goal.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dogs Section */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              🐕 I tuoi cani
            </h2>
            <button
              onClick={() => router.push('/setup/dog')}
              className="btn btn-outline text-sm px-4 py-2"
            >
              Aggiungi cane
            </button>
          </div>

          {userDogs.length === 0 ? (
            <p className="text-gray-600">Nessun cane aggiunto ancora.</p>
          ) : (
            <div className="space-y-4">
              {userDogs.map((dog) => (
                <div key={dog.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{dog.name}</h3>
                      <p className="text-sm text-gray-600">{dog.breed} • {dog.age} anni</p>
                    </div>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Elimina
                    </button>
                  </div>
                  
                  {dog.photos && dog.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {dog.photos.slice(0, 3).map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={dog.name}
                          className="w-full aspect-square object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {dog.sizeCategory}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {dog.energyLevel} energia
                    </span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {dog.temperament}
                    </span>
                  </div>
                  
                  {dog.bio && (
                    <p className="text-sm text-gray-600 mt-2">{dog.bio}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full btn bg-red-500 text-white hover:bg-red-600"
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}