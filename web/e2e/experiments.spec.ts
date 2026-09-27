import { test, expect } from '@playwright/test';

test.describe('Experiments E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Experiments' }).click();
    await expect(page.getByText('Experiment Timeline')).toBeVisible({ timeout: 10000 });
  });

  test('Filter experiments', async ({ page }) => {
    // Wait for experiments to load. 
    // The mock API returns an empty array by default unless seeded.
    // If it's empty, we'll see "No experiments found."
    const noExps = page.getByText('No experiments found.');
    const hasExps = page.locator('.group'); // experiment nodes
    
    // We just verify the filter buttons work without crashing
    const completedBtn = page.getByRole('button', { name: 'completed' });
    await completedBtn.click();
    
    await expect(completedBtn).toHaveClass(/bg-primary\/20/);
    
    const allBtn = page.getByRole('button', { name: 'all' });
    await allBtn.click();
    await expect(allBtn).toHaveClass(/bg-primary\/20/);
  });
});
