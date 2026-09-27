import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './client';

describe('API Client', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('getHealth returns online status when fetch succeeds', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok' })
    } as Response);

    const health = await apiClient.getHealth();
    expect(health.status).toBe('ok');
    expect(global.fetch).toHaveBeenCalledWith('/health', expect.any(Object));
  });

  it('getHealth returns offline status when fetch fails', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const health = await apiClient.getHealth();
    expect(health.status).toBe('offline');
  });

  it('getConnections handles empty arrays', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => []
    } as Response);

    const connections = await apiClient.getConnections();
    expect(connections).toEqual([]);
  });

  it('setLatency sends correct POST payload', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 204
    } as Response);

    await apiClient.setLatency({ enabled: true, delay_ms: 100 });
    
    expect(global.fetch).toHaveBeenCalledWith('/chaos/latency', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ enabled: true, delay_ms: 100 })
    }));
  });
});
