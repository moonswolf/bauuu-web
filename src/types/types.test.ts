import { describe, it, expect } from 'vitest';
import { REPORT_REASON_LABELS, type ReportReason, type NotificationPrefs, type CookieConsent } from './index';

describe('Report Reasons', () => {
  it('has labels for all report reasons', () => {
    const reasons: ReportReason[] = [
      'impersonation', 'harassment', 'minor', 'scam', 'nudity',
      'hate_speech', 'offplatform', 'animal_abuse', 'other',
    ];
    reasons.forEach(reason => {
      expect(REPORT_REASON_LABELS[reason]).toBeDefined();
      expect(typeof REPORT_REASON_LABELS[reason]).toBe('string');
      expect(REPORT_REASON_LABELS[reason].length).toBeGreaterThan(0);
    });
  });

  it('has exactly 9 report reasons', () => {
    expect(Object.keys(REPORT_REASON_LABELS)).toHaveLength(9);
  });
});

describe('NotificationPrefs type', () => {
  it('default prefs have all fields', () => {
    const prefs: NotificationPrefs = {
      matches: true,
      messages: true,
      likes: false,
      events: true,
    };
    expect(prefs.matches).toBe(true);
    expect(prefs.messages).toBe(true);
    expect(prefs.likes).toBe(false);
    expect(prefs.events).toBe(true);
  });
});

describe('CookieConsent type', () => {
  it('necessary is always true', () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    expect(consent.necessary).toBe(true);
  });

  it('accepts all cookie options', () => {
    const consent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
  });
});
