import { test, expect } from '@playwright/test';
import * as net from 'net';

test.describe('Full-stack E2E', () => {
  test('Dashboard toggle controls TCP proxy behavior', async ({ page }) => {
    test.setTimeout(30000); // 30s timeout

    // 1. Go to Chaos
    await page.goto('/');
    await page.getByRole('link', { name: 'Chaos' }).click();
    await expect(page.getByText('Global Configuration')).toBeVisible({ timeout: 10000 });

    const toggle = page.getByRole('button', { name: 'Toggle latency' });
    const input = page.getByPlaceholder('ms');
    
    // Ensure it's enabled and set to 200ms
    const isEnabled = await toggle.evaluate((el) => el.className.includes('bg-primary'));
    if (!isEnabled) {
      await toggle.click();
    }

    const applyBtn = page.getByRole('button', { name: 'Apply' });
    await expect(applyBtn).toBeVisible();

    await input.fill('200');
    await applyBtn.click();
    await page.waitForTimeout(500); // Allow API state to propagate

    // 2. Connect to TCP Proxy and measure latency
    const start = Date.now();
    const delay = await new Promise<number>((resolve, reject) => {
      const client = new net.Socket();
      client.connect(9000, '127.0.0.1', () => {
        client.write('ping');
      });

      client.on('data', (data) => {
        const elapsed = Date.now() - start;
        client.destroy();
        resolve(elapsed);
      });

      client.on('error', (err) => {
        reject(err);
      });
    });

    console.log(`TCP Roundtrip took ${delay}ms`);
    // The target is an echo server, it responds immediately. 
    // Proxy adds 200ms latency.
    expect(delay).toBeGreaterThanOrEqual(150);
    
    // 3. Disable latency and verify it's fast again
    await toggle.click();
    await page.waitForTimeout(500); // Allow API state to propagate

    const start2 = Date.now();
    const delay2 = await new Promise<number>((resolve, reject) => {
      const client = new net.Socket();
      client.connect(9000, '127.0.0.1', () => {
        client.write('ping2');
      });

      client.on('data', (data) => {
        const elapsed = Date.now() - start2;
        client.destroy();
        resolve(elapsed);
      });

      client.on('error', (err) => {
        reject(err);
      });
    });

    console.log(`TCP Roundtrip without chaos took ${delay2}ms`);
    expect(delay2).toBeLessThan(100);
  });
});
