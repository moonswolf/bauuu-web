import { describe, it, expect } from 'vitest';
import { isAdmin, isAdminOrHigher, isSuperadmin } from './roles';

describe('Role checks', () => {
  describe('isAdmin', () => {
    it('returns true for moderator', () => {
      expect(isAdmin('moderator')).toBe(true);
    });

    it('returns true for admin', () => {
      expect(isAdmin('admin')).toBe(true);
    });

    it('returns true for superadmin', () => {
      expect(isAdmin('superadmin')).toBe(true);
    });

    it('returns false for user', () => {
      expect(isAdmin('user')).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe('isAdminOrHigher', () => {
    it('returns false for moderator', () => {
      expect(isAdminOrHigher('moderator')).toBe(false);
    });

    it('returns true for admin', () => {
      expect(isAdminOrHigher('admin')).toBe(true);
    });

    it('returns true for superadmin', () => {
      expect(isAdminOrHigher('superadmin')).toBe(true);
    });

    it('returns false for user', () => {
      expect(isAdminOrHigher('user')).toBe(false);
    });
  });

  describe('isSuperadmin', () => {
    it('returns true only for superadmin', () => {
      expect(isSuperadmin('superadmin')).toBe(true);
      expect(isSuperadmin('admin')).toBe(false);
      expect(isSuperadmin('moderator')).toBe(false);
      expect(isSuperadmin('user')).toBe(false);
    });
  });
});
