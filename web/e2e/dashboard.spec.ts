import { test, expect } from '@playwright/test';

test.describe('Dashboard Smoke Test', () => {
  test('dashboard loads successfully and displays connected systems', async ({ page }) => {
    await page.goto('/');

    // Wait for the online status
    await expect(page.getByText('System Online')).toBeVisible({ timeout: 10000 });

    // Verify stats exist
    await expect(page.getByText('Active Connections').first()).toBeVisible();
    await expect(page.getByText('Bytes Transferred')).toBeVisible();
    await expect(page.getByText('Active Proxies')).toBeVisible();

    // Verify connections section (could be empty, but the title should be there)
    await expect(page.getByText('Live TCP Connections')).toBeVisible();
  });
});
