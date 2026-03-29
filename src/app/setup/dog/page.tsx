'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { addDog, updateUserProfile } from '@/lib/firestore';
import ImageUpload from '@/components/ImageUpload';
import AuthGuard from '@/components/AuthGuard';
import { SizeCategory, EnergyLevel, Temperament } from '@/types';

const sizeOptions: { value: SizeCategory; label: string }[] = [
  { value: 'piccolo', label: 'Piccolo (< 10kg)' },
  { value: 'medio', label: 'Medio (10-25kg)' },
  { value: 'grande', label: 'Grande (25-45kg)' },
  { value: 'gigante', label: 'Gigante (> 45kg)' },
];

const energyOptions: { value: EnergyLevel; label: string }[] = [
  { value: 'basso', label: 'Basso' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
];

const temperamentOptions: { value: Temperament; label: string }[] = [
  { value: 'giocherellone', label: 'Giocherellone' },
  { value: 'timido', label: 'Timido' },
  { value: 'dominante', label: 'Dominante' },
  { value: 'tranquillo', label: 'Tranquillo' },
];

export default function SetupDogPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [dogId, setDogId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    isMixed: false,
    age: 1,
    weight: 10,
    sizeCategory: '' as SizeCategory,
    energyLevel: '' as EnergyLevel,
    temperament: '' as Temperament,
    temperaments: [] as Temperament[],
    isNeutered: false,
    vaccinationsUpToDate: false,
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.sizeCategory || !formData.energyLevel || !formData.temperament) return;

    setLoading(true);
    try {
      const newDogId = await addDog(user.uid, {
        ...formData,
        photos,
        temperaments: [formData.temperament],
      });

      // Mark profile as complete
      await updateUserProfile(user.uid, {
        profileComplete: true,
      });

      router.push('/app/discover');
    } catch (error) {
      console.error('Error saving dog profile:', error);
      alert('Errore durante il salvataggio del profilo del cane');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos(prev => [...prev, url]);
  };

  const generateDogId = () => {
    if (!dogId && user) {
      const tempId = `temp_${user.uid}_${Date.now()}`;
      setDogId(tempId);
      return tempId;
    }
    return dogId!;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profilo del tuo cane
            </h1>
            <p className="text-gray-600">
              Passo 2 di 2: raccontaci del tuo cane
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Foto del cane (minimo 1)
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map(index => (
                  <div key={index} className="aspect-square">
                    <ImageUpload
                      type="dog"
                      userId={user?.uid || ''}
                      dogId={generateDogId()}
                      index={index}
                      onUploadComplete={handlePhotoUpload}
                      currentImage={photos[index]}
                      className="w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome del cane
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  placeholder="Es. Max"
                  required
                />
              </div>

              <div>
                <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                  Razza
                </label>
                <input
                  type="text"
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="input"
                  placeholder="Es. Labrador"
                  required
                />
              </div>
            </div>

            {/* Mixed breed checkbox */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isMixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, isMixed: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">È un meticcio</span>
              </label>
            </div>

            {/* Age and Weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                  Età (anni)
                </label>
                <input
                  type="number"
                  id="age"
                  min="1"
                  max="20"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  min="1"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Size Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Taglia
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map(option => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sizeCategory"
                      value={option.value}
                      checked={formData.sizeCategory === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizeCategory: e.target.value as SizeCategory }))}
                      className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Livello di energia
              </label>
              <div className="grid grid-cols-3 gap-2">
                {energyOptions.map(option => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="energyLevel"
                      value={option.value}
                      checked={formData.energyLevel === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: e.target.value as EnergyLevel }))}
                      className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Temperament */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Temperamento principale
              </label>
              <div className="grid grid-cols-2 gap-2">
                {temperamentOptions.map(option => (
                  <label key={option.value} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="temperament"
                      value={option.value}
                      checked={formData.temperament === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, temperament: e.target.value as Temperament }))}
                      className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Health checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isNeutered}
                  onChange={(e) => setFormData(prev => ({ ...prev, isNeutered: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">È sterilizzato/castrato</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.vaccinationsUpToDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, vaccinationsUpToDate: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Ha le vaccinazioni aggiornate</span>
              </label>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="dogBio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio del cane (opzionale)
              </label>
              <textarea
                id="dogBio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="input h-24 resize-none"
                placeholder="Raccontaci qualcosa di speciale del tuo cane..."
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length}/300 caratteri
              </p>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || photos.length === 0 || !formData.name || !formData.breed || !formData.sizeCategory || !formData.energyLevel || !formData.temperament}
                className="btn btn-primary w-full"
              >
                {loading ? 'Salvataggio...' : 'Completa profilo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}