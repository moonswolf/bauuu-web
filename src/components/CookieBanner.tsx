'use client';

import { useState, useEffect, useCallback } from 'react';
import { CookieConsent } from '@/types';

const COOKIE_CONSENT_KEY = 'bauuu_cookie_consent';
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

function getStoredConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    const consent = JSON.parse(stored) as CookieConsent;
    // Garante: do not re-prompt before 6 months
    if (Date.now() - consent.timestamp < SIX_MONTHS_MS) {
      return consent;
    }
    return null;
  } catch {
    return null;
  }
}

function saveConsent(consent: CookieConsent) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
}

export function getCookieConsent(): CookieConsent | null {
  return getStoredConsent();
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    saveConsent(consent);
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    saveConsent(consent);
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    const consent: CookieConsent = {
      necessary: true,
      analytics,
      marketing,
      timestamp: Date.now(),
    };
    saveConsent(consent);
    setVisible(false);
  }, [analytics, marketing]);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-modal="false"
      aria-label="Gestione cookie"
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Questo sito utilizza i cookie
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Utilizziamo cookie tecnici necessari al funzionamento e, previo tuo consenso, cookie di
          analisi e profilazione per migliorare la tua esperienza. Puoi scegliere liberamente se
          accettare o rifiutare. Per maggiori informazioni consulta la nostra{' '}
          <a href="/privacy" className="text-primary-500 underline">
            Privacy Policy
          </a>{' '}
          e la{' '}
          <a href="/cookie-policy" className="text-primary-500 underline">
            Cookie Policy
          </a>
          .
        </p>

        {showDetails && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Cookie tecnici</span>
                <p className="text-xs text-gray-500">Necessari al funzionamento del sito</p>
              </div>
              <span className="text-xs text-gray-400 font-medium">Sempre attivi</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Cookie analitici</span>
                <p className="text-xs text-gray-500">Ci aiutano a capire come usi l&apos;app</p>
              </div>
              <button
                role="switch"
                aria-checked={analytics}
                onClick={() => setAnalytics(!analytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  analytics ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    analytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-gray-700">Cookie di marketing</span>
                <p className="text-xs text-gray-500">Per mostrarti contenuti personalizzati</p>
              </div>
              <button
                role="switch"
                aria-checked={marketing}
                onClick={() => setMarketing(!marketing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  marketing ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    marketing ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        )}

        {/* Garante: "Accetta tutti" and "Rifiuta tutti" must be equally prominent */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleAcceptAll}
            className="btn btn-primary flex-1 text-sm py-3"
          >
            Accetta tutti
          </button>
          <button
            onClick={handleRejectAll}
            className="btn btn-primary flex-1 text-sm py-3"
            style={{ backgroundColor: '#6b7280' }}
          >
            Rifiuta tutti
          </button>
          {showDetails ? (
            <button
              onClick={handleSavePreferences}
              className="btn btn-outline flex-1 text-sm py-3"
            >
              Salva preferenze
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="btn btn-outline flex-1 text-sm py-3"
            >
              Personalizza
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
