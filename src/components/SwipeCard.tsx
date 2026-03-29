'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { UserProfile, Dog, SwipeDirection } from '@/types';
import { useState } from 'react';

interface SwipeCardProps {
  user: UserProfile;
  dog: Dog;
  onSwipe: (direction: SwipeDirection) => void;
  onProfileClick: () => void;
  matchScore: number;
  distance: number;
}

const SWIPE_THRESHOLD = 100;

export default function SwipeCard({ 
  user, 
  dog, 
  onSwipe, 
  onProfileClick, 
  matchScore, 
  distance 
}: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    
    if (Math.abs(offset) > SWIPE_THRESHOLD) {
      if (offset > 0) {
        setExitX(300);
        onSwipe('like');
      } else {
        setExitX(-300);
        onSwipe('pass');
      }
    }
  };

  const handleActionButton = (direction: SwipeDirection) => {
    if (direction === 'like') {
      setExitX(300);
    } else if (direction === 'superlike') {
      setExitX(0);
    } else {
      setExitX(-300);
    }
    onSwipe(direction);
  };

  const dogPhoto = dog.photos?.[0] || '/placeholder-dog.png';

  return (
    <motion.div
      className="absolute inset-4 bg-white rounded-2xl shadow-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Main photo */}
      <div className="relative h-full" onClick={onProfileClick}>
        <img
          src={dogPhoto}
          alt={dog.name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Match score badge */}
        <div className="absolute top-4 right-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {matchScore}% match
        </div>
        
        {/* Distance badge */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {distance < 1 ? '<1 km' : `${Math.round(distance)} km`}
        </div>

        {/* Dog info */}
        <div className="absolute bottom-20 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-3xl font-bold">{dog.name}</h2>
            <span className="text-xl">{dog.age} anni</span>
          </div>
          <p className="text-lg opacity-90">{dog.breed}</p>
          <p className="text-sm opacity-75 mt-1">
            {dog.sizeCategory} • {dog.energyLevel} energia • {dog.temperament}
          </p>
          
          {/* Owner info */}
          <div className="flex items-center gap-2 mt-3 opacity-75">
            {user.profilePhotos?.[0] && (
              <img
                src={user.profilePhotos[0]}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm">{user.displayName}</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleActionButton('pass');
          }}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          ❌
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleActionButton('superlike');
          }}
          className="w-14 h-14 bg-accent-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          ⭐
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleActionButton('like');
          }}
          className="w-14 h-14 bg-secondary-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
        >
          ❤️
        </button>
      </div>
      
      {/* Swipe indicators */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-8 text-6xl font-bold text-green-500 pointer-events-none"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        ❤️
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 right-8 text-6xl font-bold text-red-500 pointer-events-none"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        ❌
      </motion.div>
    </motion.div>
  );
}