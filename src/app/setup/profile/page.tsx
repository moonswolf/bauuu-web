'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';
import AuthGuard from '@/components/AuthGuard';
import { Gender, LookingFor } from '@/types';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 50 }, (_, i) => currentYear - 18 - i);

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

export default function SetupProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    bio: '',
    birthYear: currentYear - 25,
    gender: '' as Gender,
    lookingFor: [] as LookingFor[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.gender || formData.lookingFor.length === 0) return;

    setLoading(true);
    try {
      await updateUserProfile(user.uid, {
        ...formData,
        profilePhotos: photos,
        birthDate: new Date(formData.birthYear, 0, 1),
        profileComplete: false, // Will be completed after dog setup
      });
      
      router.push('/setup/dog');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Errore durante il salvataggio del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos(prev => [...prev, url]);
  };

  const handleLookingForToggle = (value: LookingFor) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(value)
        ? prev.lookingFor.filter(item => item !== value)
        : [...prev.lookingFor, value]
    }));
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Configura il tuo profilo
            </h1>
            <p className="text-gray-600">
              Passo 1 di 2: raccontaci di te
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Foto profilo (minimo 1)
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(index => (
                  <div key={index} className="aspect-square">
                    <ImageUpload
                      type="user"
                      userId={user?.uid || ''}
                      index={index}
                      onUploadComplete={handlePhotoUpload}
                      currentImage={photos[index]}
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
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
                placeholder="Scrivi qualcosa di te e del tuo cane..."
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/300 caratteri
              </p>
            </div>

            {/* Birth Year */}
            <div>
              <label htmlFor="birthYear" className="block text-sm font-medium text-gray-700 mb-2">
                Anno di nascita
              </label>
              <select
                id="birthYear"
                value={formData.birthYear}
                onChange={(e) => setFormData(prev => ({ ...prev, birthYear: parseInt(e.target.value) }))}
                className="input"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
                Cosa cerchi? (puoi selezionare più opzioni)
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

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || photos.length === 0 || !formData.gender || formData.lookingFor.length === 0}
                className="btn btn-primary w-full"
              >
                {loading ? 'Salvataggio...' : 'Continua'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}