'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Dog } from '@/types';
import { useState } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  dog: Dog;
}

export default function ProfileModal({ isOpen, onClose, user, dog }: ProfileModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [...(dog.photos || []), ...(user.profilePhotos || [])];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">{dog.name} e {user.displayName}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto max-h-[80vh]">
              {/* Image carousel */}
              {allImages.length > 0 && (
                <div className="relative h-80 bg-gray-100">
                  <img
                    src={allImages[currentImageIndex]}
                    alt="Foto profilo"
                    className="w-full h-full object-cover"
                  />
                  
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                      >
                        ›
                      </button>
                      
                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-6">
                {/* Dog info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">🐕 {dog.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Razza:</span>
                      <p className="font-medium">{dog.breed}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Età:</span>
                      <p className="font-medium">{dog.age} anni</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Taglia:</span>
                      <p className="font-medium capitalize">{dog.sizeCategory}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Peso:</span>
                      <p className="font-medium">{dog.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Energia:</span>
                      <p className="font-medium capitalize">{dog.energyLevel}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Carattere:</span>
                      <p className="font-medium capitalize">{dog.temperament}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    {dog.isNeutered && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Sterilizzato
                      </span>
                    )}
                    {dog.vaccinationsUpToDate && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Vaccinato
                      </span>
                    )}
                  </div>

                  {dog.bio && (
                    <div className="mt-4">
                      <span className="text-gray-600 text-sm">Bio:</span>
                      <p className="mt-1 text-gray-800">{dog.bio}</p>
                    </div>
                  )}
                </div>

                {/* Owner info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">👤 {user.displayName}</h3>
                  <div className="space-y-2 text-sm">
                    {user.bio && (
                      <div>
                        <span className="text-gray-600">Bio:</span>
                        <p className="mt-1 text-gray-800">{user.bio}</p>
                      </div>
                    )}
                    
                    {user.lookingFor.length > 0 && (
                      <div>
                        <span className="text-gray-600">Cerca:</span>
                        <div className="flex gap-2 mt-1">
                          {user.lookingFor.map((goal) => (
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
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}