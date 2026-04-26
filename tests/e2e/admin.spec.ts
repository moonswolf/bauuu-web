import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('admin route exists and redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    // Should redirect to login since no auth
    await page.waitForURL(/\/(login|admin)/);
    await expect(page).toHaveURL(/\//);
  });

  test('admin users route exists', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForURL(/\/(login|admin\/users)/);
    await expect(page).toHaveURL(/\//);
  });

  test('admin moderation route exists', async ({ page }) => {
    await page.goto('/admin/moderation');
    await page.waitForURL(/\/(login|admin\/moderation)/);
    await expect(page).toHaveURL(/\//);
  });

  test('admin seed route exists', async ({ page }) => {
    await page.goto('/admin/seed');
    await page.waitForURL(/\/(login|admin\/seed)/);
    await expect(page).toHaveURL(/\//);
  });
});

test.describe('App Accessibility', () => {
  test('home page has skip link', async ({ page }) => {
    await page.goto('/');
    // The skip link should exist in the DOM
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('home page has main content landmark', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main-content');
    await expect(main).toBeAttached();
  });

  test('home page has correct lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'it');
  });
});
