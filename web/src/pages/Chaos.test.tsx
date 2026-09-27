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
      config: { latency_enabled: false, latency_delay_ms: 50 },
      loading: false,
      error: null,
      mutate: mutateMock
    } as any);

    vi.mocked(apiClient.setLatency).mockResolvedValueOnce();

    render(<Chaos />);
    
    // Check if the latency block is rendered
    expect(screen.getByText('Latency Injection')).toBeInTheDocument();
    
    // Find the toggle (it's a button role in the UI usually, or a div we can click)
    // Looking at Chaos.tsx, the toggle is a div wrapping a slider.
    const toggleButtons = screen.getAllByRole('button');
    // Assuming the first button is the latency toggle
    const latencyToggle = toggleButtons[0];
    
    fireEvent.click(latencyToggle);

    await waitFor(() => {
      expect(apiClient.setLatency).toHaveBeenCalledWith({ enabled: true, delay_ms: 50 });
    });
  });
});
