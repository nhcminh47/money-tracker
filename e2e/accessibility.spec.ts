import { test, expect } from '@playwright/test';

// Note: These tests require a logged-in user
// In a real scenario, you would use Playwright's authentication setup
test.describe('Dashboard', () => {
  test.skip('should display dashboard for authenticated users', async ({ page }) => {
    // This test is skipped because it requires auth
    // In production, you would:
    // 1. Create a test user in Supabase
    // 2. Use storageState to persist auth
    // 3. Reuse the auth state across tests
    
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('login page should be accessible', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Check for form labels
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
  });

  test('signup page should be accessible', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check for proper heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Check for form labels
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });
});
