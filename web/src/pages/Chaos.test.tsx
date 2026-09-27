import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Chaos } from './Chaos';
import { useChaosConfig } from '../hooks/useKairos';
import { apiClient } from '../api/client';

vi.mock('../hooks/useKairos', () => ({
  useChaosConfig: vi.fn(),
}));

vi.mock('../api/client', () => ({
  apiClient: {
    setLatency: vi.fn(),
  }
}));

describe('Chaos Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders controls and loading state', () => {
    vi.mocked(useChaosConfig).mockReturnValue({
      config: null,
      loading: true,
      error: null
    });

    render(<Chaos />);

    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });

  it('renders API failure handling correctly', () => {
    vi.mocked(useChaosConfig).mockReturnValue({
      config: null,
      loading: false,
      error: new Error('Failed to fetch chaos config')
    });

    render(<Chaos />);

    expect(screen.getByText('Failed to load chaos configuration. Is the proxy running?')).toBeInTheDocument();
  });

  it('renders controls and handles toggle/update interaction', async () => {
    const mutateMock = vi.fn();
    vi.mocked(useChaosConfig).mockReturnValue({
      config: { latency_enabled: false, latency_delay_ms: 0 },
      loading: false,
      error: null,
      mutate: mutateMock
    } as any);

    vi.mocked(apiClient.setLatency).mockResolvedValueOnce();

    render(<Chaos />);

    const toggle = screen.getByRole('button', { name: 'Toggle latency' });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(apiClient.setLatency).toHaveBeenCalledWith({ enabled: true, delay_ms: 500 });
    });

    expect(mutateMock).toHaveBeenCalled();
  });

  it('updates latency delay when Apply is clicked', async () => {
    const mutateMock = vi.fn();
    vi.mocked(useChaosConfig).mockReturnValue({
      config: { latency_enabled: true, latency_delay_ms: 100 },
      loading: false,
      error: null,
      mutate: mutateMock
    } as any);

    vi.mocked(apiClient.setLatency).mockResolvedValueOnce();

    render(<Chaos />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '750' } });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    await waitFor(() => {
      expect(apiClient.setLatency).toHaveBeenCalledWith({ enabled: true, delay_ms: 750 });
    });

    expect(mutateMock).toHaveBeenCalled();
  });
});
