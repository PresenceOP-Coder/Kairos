import { test, expect } from '@playwright/test';

test.describe('Chaos Controls E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the home page and navigate to avoid Vite proxy intercepting /chaos
    await page.goto('/');
    await page.getByRole('link', { name: 'Chaos' }).click();
    
    // Wait for the UI to load
    await expect(page.getByText('Global Configuration')).toBeVisible({ timeout: 10000 });
  });

  test('Test 1 - Enable latency', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle latency' });
    
    // Wait for the loading state to pass
    await expect(toggle).toBeVisible();

    // The toggle doesn't have a native 'checked' attribute we can assert on directly 
    // unless we look at the class name.
    const isEnabled = await toggle.evaluate((el) => el.className.includes('bg-primary'));
    
    if (isEnabled) {
      // Turn it off first to ensure a clean state
      await toggle.click();
      await page.waitForTimeout(500); // Give API a moment
    }

    // Now it should be off. Let's toggle it ON.
    await toggle.click();

    // Verify it turns on (bg-primary class is added)
    await expect(toggle).toHaveClass(/bg-primary/);
    
    // The Apply button should appear
    await expect(page.getByRole('button', { name: 'Apply' })).toBeVisible();
  });

  test('Test 2 - Change latency', async ({ page }) => {
    // Ensure latency is enabled
    const toggle = page.getByRole('button', { name: 'Toggle latency' });
    await expect(toggle).toBeVisible();
    
    const isEnabled = await toggle.evaluate((el) => el.className.includes('bg-primary'));
    if (!isEnabled) {
      await toggle.click();
    }
    
    const applyBtn = page.getByRole('button', { name: 'Apply' });
    await expect(applyBtn).toBeVisible();

    // Input new delay
    const input = page.getByPlaceholder('ms');
    await input.fill('750');
    
    // Click Apply
    await applyBtn.click();

    // In a real E2E environment, the API updates its internal state.
    // The UI should still show 750 in the input box.
    await expect(input).toHaveValue('750');
  });

  test('Test 3 - Disable latency', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle latency' });
    
    // Ensure it's ON
    await expect(toggle).toBeVisible();
    const isEnabled = await toggle.evaluate((el) => el.className.includes('bg-primary'));
    if (!isEnabled) {
      await toggle.click();
      await page.waitForTimeout(500);
    }

    // Click toggle to disable
    await toggle.click();

    // Verify it turns off
    await expect(toggle).toHaveClass(/bg-secondary/);
    
    // The Apply button should disappear
    await expect(page.getByRole('button', { name: 'Apply' })).not.toBeVisible();
    
    // The input should be disabled
    const input = page.getByPlaceholder('ms');
    await expect(input).toBeDisabled();
  });
});
