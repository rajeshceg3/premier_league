const { test, expect } = require('@playwright/test');

test.describe('Mission Critical Smoke Tests', () => {
  test('System Access: Redirects to Login on unauthenticated access', async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');

    // Verification: Should be redirected to the login interface
    await expect(page).toHaveURL(/.*\/login/);

    // Verification: Critical login components must be visible
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });
});
