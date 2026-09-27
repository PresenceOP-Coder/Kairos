import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSystemHealth } from './useKairos';
import { apiClient } from '../api/client';

vi.mock('../api/client', () => ({
  apiClient: {
    getHealth: vi.fn(),
  }
}));

describe('useKairos Hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('useSystemHealth starts with loading state and fetches data', async () => {
    vi.mocked(apiClient.getHealth).mockResolvedValueOnce({ status: 'ok' });

    const { result } = renderHook(() => useSystemHealth(10000));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.health.status).toBe('ok');
    expect(result.current.error).toBeNull();
  });

  it('useSystemHealth handles API errors gracefully', async () => {
    vi.mocked(apiClient.getHealth).mockRejectedValueOnce(new Error('API failed'));

    const { result } = renderHook(() => useSystemHealth(10000));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('API failed');
  });
});
