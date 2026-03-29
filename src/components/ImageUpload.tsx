'use client';

import { useState, useRef } from 'react';
import { uploadUserPhoto, uploadDogPhoto } from '@/lib/firestore';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      let url: string;
      if (type === 'user') {
        url = await uploadUserPhoto(userId, file, index);
      } else if (type === 'dog' && dogId) {
        url = await uploadDogPhoto(dogId, file, index);
      } else {
        throw new Error('Invalid upload configuration');
      }
      
      onUploadComplete(url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Errore durante il caricamento dell\'immagine');
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
        onClick={() => fileInputRef.current?.click()}
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
      
      {preview && !uploading && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
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