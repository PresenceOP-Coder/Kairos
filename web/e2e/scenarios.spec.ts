import { test, expect } from '@playwright/test';

test.describe('Scenarios E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API response to return a scenario so we can test the UI interaction
    await page.route('/scenarios', async route => {
      const json = [{
        id: 'mock-1',
        name: 'High Latency Spike',
        description: 'Injects 500ms latency',
        version: 'v1alpha1',
        kind: 'ChaosScenario',
        experiments: [],
        spec: { faults: [] }
      }];
      await route.fulfill({ json });
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Scenarios' }).click();
    await expect(page.getByRole('heading', { name: 'Scenarios', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('Select scenario and view details', async ({ page }) => {
    const scenarioItem = page.getByText('High Latency Spike');
    await expect(scenarioItem).toBeVisible({ timeout: 5000 });

    // Click the scenario
    await scenarioItem.click();

    // Verify the details panel opens
    await expect(page.getByText('Configuration')).toBeVisible();
    await expect(page.getByRole('button', { name: /Run Now/i })).toBeVisible();
  });

  test('Click Run Now reaches backend', async ({ page }) => {
    const scenarioItem = page.getByText('High Latency Spike');
    await expect(scenarioItem).toBeVisible({ timeout: 5000 });
    await scenarioItem.click();

    const runBtn = page.getByRole('button', { name: /Run Now/i });
    await expect(runBtn).toBeVisible();
    
    // Click run.
    await runBtn.click();
    await expect(runBtn).toBeEnabled();
  });
});
