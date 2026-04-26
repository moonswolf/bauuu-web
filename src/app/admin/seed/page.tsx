'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createSeedProfile, getSeedProfiles, logAdminAction } from '@/lib/admin';
import { UserProfile } from '@/types';

const CITIES = ['Roma', 'Milano', 'Napoli', 'Torino', 'Palermo', 'Bologna', 'Firenze'];
const DOG_SIZES = [
  { value: 'piccolo', label: 'Piccolo' },
  { value: 'medio', label: 'Medio' },
  { value: 'grande', label: 'Grande' },
  { value: 'gigante', label: 'Gigante' },
];
const ENERGY_LEVELS = [
  { value: 'basso', label: 'Basso' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
];
const TEMPERAMENTS = [
  { value: 'giocherellone', label: 'Giocherellone' },
  { value: 'timido', label: 'Timido' },
  { value: 'dominante', label: 'Dominante' },
  { value: 'tranquillo', label: 'Tranquillo' },
];

const DOG_BREEDS = [
  'Labrador Retriever', 'Golden Retriever', 'Pastore Tedesco', 'Bulldog Francese',
  'Beagle', 'Border Collie', 'Jack Russell', 'Cocker Spaniel', 'Setter Irlandese',
  'Barboncino', 'Chihuahua', 'Husky Siberiano', 'Shiba Inu', 'Meticcio',
];

const DOG_NAMES = [
  'Luna', 'Rocky', 'Bella', 'Max', 'Maya', 'Leo', 'Mia', 'Zeus',
  'Nala', 'Charlie', 'Kira', 'Buddy', 'Stella', 'Rex', 'Lola', 'Thor',
];

export default function AdminSeedPage() {
  const { user } = useAuth();
  const [seeds, setSeeds] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form state
  const [city, setCity] = useState('Roma');
  const [count, setCount] = useState(5);
  const [manualMode, setManualMode] = useState(false);
  const [manualData, setManualData] = useState({
    displayName: '',
    dogName: '',
    dogBreed: DOG_BREEDS[0],
    dogSize: 'medio',
    dogEnergy: 'medio',
    dogTemperament: 'giocherellone',
    bio: '',
    dogBio: '',
  });

  useEffect(() => {
    setLoading(true);
    getSeedProfiles().then(setSeeds).finally(() => setLoading(false));
  }, []);

  const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateBulkSeeds = async () => {
    if (!user) return;
    setCreating(true);
    setSuccessMsg('');

    try {
      for (let i = 0; i < count; i++) {
        const dogName = randomPick(DOG_NAMES);
        const breed = randomPick(DOG_BREEDS);
        const displayName = `Padrone di ${dogName}`;

        await createSeedProfile({
          displayName,
          city,
          bio: `Amante dei cani a ${city}. Cerco amici per il mio ${breed}!`,
          dogName,
          dogBreed: breed,
          dogBio: `Ciao, sono ${dogName}! Mi piace giocare al parco e fare nuove amicizie.`,
          dogSize: randomPick(DOG_SIZES).value,
          dogEnergy: randomPick(ENERGY_LEVELS).value,
          dogTemperament: randomPick(TEMPERAMENTS).value,
          dogPhotos: [`https://placedog.net/500/500?random&id=${Date.now()}-${i}`],
          profilePhotos: [],
        });

        await logAdminAction(user.uid, 'create_seed', 'profile', undefined, { city, dogName, breed });
      }

      setSuccessMsg(`${count} profili seed creati per ${city}!`);
      const updated = await getSeedProfiles();
      setSeeds(updated);
    } catch (error) {
      console.error('Error creating seeds:', error);
      alert('Errore durante la creazione dei profili seed');
    } finally {
      setCreating(false);
    }
  };

  const handleManualCreate = async () => {
    if (!user || !manualData.displayName || !manualData.dogName) return;
    setCreating(true);

    try {
      await createSeedProfile({
        displayName: manualData.displayName,
        city,
        bio: manualData.bio || `Amante dei cani a ${city}.`,
        dogName: manualData.dogName,
        dogBreed: manualData.dogBreed,
        dogBio: manualData.dogBio || `Ciao, sono ${manualData.dogName}!`,
        dogSize: manualData.dogSize,
        dogEnergy: manualData.dogEnergy,
        dogTemperament: manualData.dogTemperament,
        dogPhotos: [`https://placedog.net/500/500?random&id=${Date.now()}`],
        profilePhotos: [],
      });

      await logAdminAction(user.uid, 'create_seed', 'profile', undefined, {
        city,
        dogName: manualData.dogName,
      });

      setSuccessMsg('Profilo seed creato!');
      const updated = await getSeedProfiles();
      setSeeds(updated);
      setManualData({
        displayName: '',
        dogName: '',
        dogBreed: DOG_BREEDS[0],
        dogSize: 'medio',
        dogEnergy: 'medio',
        dogTemperament: 'giocherellone',
        bio: '',
        dogBio: '',
      });
    } catch (error) {
      console.error('Error creating seed:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profili Seed</h1>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm" role="status">
          {successMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Creation form */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Crea profili seed</h2>

          <div className="mb-4">
            <label htmlFor="seed-city" className="block text-sm font-medium text-gray-700 mb-1">Citta</label>
            <select id="seed-city" value={city} onChange={e => setCity(e.target.value)} className="input text-sm">
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setManualMode(false)}
              className={`px-3 py-1.5 text-sm rounded ${!manualMode ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Generazione automatica
            </button>
            <button
              onClick={() => setManualMode(true)}
              className={`px-3 py-1.5 text-sm rounded ${manualMode ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Manuale
            </button>
          </div>

          {!manualMode ? (
            <>
              <div className="mb-4">
                <label htmlFor="seed-count" className="block text-sm font-medium text-gray-700 mb-1">
                  Numero profili
                </label>
                <input
                  id="seed-count"
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={e => setCount(parseInt(e.target.value) || 1)}
                  className="input text-sm"
                />
              </div>
              <button
                onClick={generateBulkSeeds}
                disabled={creating}
                className="w-full btn btn-primary py-2 text-sm"
              >
                {creating ? 'Creando...' : `Genera ${count} profili seed`}
              </button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <label htmlFor="seed-owner" className="block text-xs text-gray-600 mb-1">Nome padrone</label>
                  <input id="seed-owner" type="text" value={manualData.displayName} onChange={e => setManualData(p => ({...p, displayName: e.target.value}))} className="input text-sm" />
                </div>
                <div>
                  <label htmlFor="seed-dogname" className="block text-xs text-gray-600 mb-1">Nome cane</label>
                  <input id="seed-dogname" type="text" value={manualData.dogName} onChange={e => setManualData(p => ({...p, dogName: e.target.value}))} className="input text-sm" />
                </div>
                <div>
                  <label htmlFor="seed-breed" className="block text-xs text-gray-600 mb-1">Razza</label>
                  <select id="seed-breed" value={manualData.dogBreed} onChange={e => setManualData(p => ({...p, dogBreed: e.target.value}))} className="input text-sm">
                    {DOG_BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="seed-size" className="block text-xs text-gray-600 mb-1">Taglia</label>
                    <select id="seed-size" value={manualData.dogSize} onChange={e => setManualData(p => ({...p, dogSize: e.target.value}))} className="input text-sm">
                      {DOG_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="seed-energy" className="block text-xs text-gray-600 mb-1">Energia</label>
                    <select id="seed-energy" value={manualData.dogEnergy} onChange={e => setManualData(p => ({...p, dogEnergy: e.target.value}))} className="input text-sm">
                      {ENERGY_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="seed-temp" className="block text-xs text-gray-600 mb-1">Temperamento</label>
                    <select id="seed-temp" value={manualData.dogTemperament} onChange={e => setManualData(p => ({...p, dogTemperament: e.target.value}))} className="input text-sm">
                      {TEMPERAMENTS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="seed-dogbio" className="block text-xs text-gray-600 mb-1">Bio cane</label>
                  <textarea id="seed-dogbio" value={manualData.dogBio} onChange={e => setManualData(p => ({...p, dogBio: e.target.value}))} className="input text-sm" rows={2} />
                </div>
              </div>
              <button
                onClick={handleManualCreate}
                disabled={creating || !manualData.displayName || !manualData.dogName}
                className="w-full btn btn-primary py-2 text-sm mt-4"
              >
                {creating ? 'Creando...' : 'Crea profilo seed'}
              </button>
            </>
          )}
        </div>

        {/* Existing seeds */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profili seed esistenti ({seeds.length})
          </h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            </div>
          ) : seeds.length === 0 ? (
            <p className="text-sm text-gray-500">Nessun profilo seed creato</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {seeds.map(seed => (
                <div key={seed.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div>
                    <span className="font-medium">{seed.displayName}</span>
                    <span className="text-xs text-yellow-700 ml-2 bg-yellow-100 px-1.5 py-0.5 rounded">Seed</span>
                  </div>
                  <span className="text-xs text-gray-400">{seed.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
