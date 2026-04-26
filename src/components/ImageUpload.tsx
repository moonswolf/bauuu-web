'use client';

import { useState, useRef } from 'react';
import { uploadUserPhoto, uploadDogPhoto } from '@/lib/firestore';

const UPLOAD_TIMEOUT_MS = 30_000;

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  type: 'user' | 'dog';
  userId: string;
  dogId?: string;
  index: number;
  currentImage?: string;
  className?: string;
}

export default function ImageUpload({
  onUploadComplete,
  type,
  userId,
  dogId,
  index,
  currentImage,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'immagine deve essere massimo 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Seleziona un\'immagine valida');
      return;
    }

    setError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload with timeout to prevent infinite hang
    setUploading(true);
    try {
      const uploadPromise = (async () => {
        if (type === 'user') {
          return uploadUserPhoto(userId, file, index);
        } else if (type === 'dog' && dogId) {
          return uploadDogPhoto(dogId, file, index);
        }
        throw new Error('Configurazione upload non valida');
      })();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload scaduto. Controlla la connessione e riprova.')), UPLOAD_TIMEOUT_MS)
      );

      const url = await Promise.race([uploadPromise, timeoutPromise]);

      onUploadComplete(url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setPreview(currentImage || null);
      setError(err?.message || 'Errore durante il caricamento. Riprova.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
      />

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
      >
        {uploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Caricamento...</p>
          </div>
        ) : preview ? (
          <img
            src={preview}
            alt="Anteprima"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center">
            <div className="text-4xl text-gray-400 mb-2">📷</div>
            <p className="text-sm text-gray-600">Aggiungi foto</p>
          </div>
        )}
      </div>

      {error && !uploading && (
        <p className="text-xs text-red-600 mt-1 text-center">{error}</p>
      )}

      {preview && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            setError(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
        >
          ×
        </button>
      )}
    </div>
  );
}