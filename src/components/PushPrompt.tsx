'use client';

import { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function PushPrompt() {
  const { isSupported, permission, requestPermission } = usePushNotifications();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isSupported || permission !== 'default') return;
    const dismissedUntil = localStorage.getItem('bauuu_push_dismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) return;
    // Show prompt after a short delay
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  if (!show || dismissed || permission !== 'default') return null;

  const handleAccept = async () => {
    await requestPermission();
    setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    // Don't re-prompt for 7 days
    localStorage.setItem('bauuu_push_dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 animate-slide-up">
      <div className="flex gap-3">
        <span className="text-3xl">🔔</span>
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900 mb-1">
            Attiva le notifiche
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Ricevi avvisi per nuovi match, messaggi e like. Puoi disattivarle in qualsiasi momento.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="btn btn-primary text-xs py-1.5 px-3"
            >
              Attiva
            </button>
            <button
              onClick={handleDismiss}
              className="btn btn-secondary text-xs py-1.5 px-3"
            >
              Non ora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
