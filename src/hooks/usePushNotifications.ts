'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  loading: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    loading: true,
  });

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
    setState(prev => ({
      ...prev,
      isSupported: supported,
      permission: supported ? Notification.permission : 'default',
      loading: false,
    }));
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted') {
        // Register the service worker for push
        const registration = await navigator.serviceWorker.register('/sw.js');
        await registration.update();
        setState(prev => ({ ...prev, isSubscribed: true }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const showLocalNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    showLocalNotification,
  };
}
