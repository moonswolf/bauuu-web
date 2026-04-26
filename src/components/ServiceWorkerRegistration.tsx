'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          updateViaCache: 'none',
        });

        // Force check for updates immediately
        await registration.update();

        // When a new SW is found, activate it immediately
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
              // New SW activated — reload to ensure clean state
              window.location.reload();
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, []);

  return null;
}
