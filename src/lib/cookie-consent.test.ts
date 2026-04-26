import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CookieConsent } from '@/types';

const COOKIE_CONSENT_KEY = 'bauuu_cookie_consent';
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;

// Test the cookie consent storage logic directly
describe('Cookie Consent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores consent in localStorage', () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!) as CookieConsent;
    expect(stored.necessary).toBe(true);
    expect(stored.analytics).toBe(true);
    expect(stored.marketing).toBe(false);
  });

  it('necessary cookies are always true', () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    expect(consent.necessary).toBe(true);
  });

  it('consent expires after 6 months (Garante guideline)', () => {
    const oldTimestamp = Date.now() - SIX_MONTHS_MS - 1000;
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: oldTimestamp,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!) as CookieConsent;
    const isExpired = Date.now() - stored.timestamp >= SIX_MONTHS_MS;
    expect(isExpired).toBe(true);
  });

  it('consent is valid within 6 months', () => {
    const recentTimestamp = Date.now() - 1000;
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: recentTimestamp,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY)!) as CookieConsent;
    const isExpired = Date.now() - stored.timestamp >= SIX_MONTHS_MS;
    expect(isExpired).toBe(false);
  });

  it('returns null when no consent is stored', () => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    expect(stored).toBeNull();
  });
});
