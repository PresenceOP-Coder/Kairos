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
    } as any);

    render(<Chaos />);

    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });

  it('renders API failure handling correctly', () => {
    vi.mocked(useChaosConfig).mockReturnValue({
      config: null,
      loading: false,
      error: new Error('Failed to fetch chaos config')
    } as any);

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

  it('disables input and hides Apply button when latency is disabled', () => {
    vi.mocked(useChaosConfig).mockReturnValue({
      config: { latency_enabled: false, latency_delay_ms: 50 },
      loading: false,
      error: null,
      mutate: vi.fn()
    } as any);

    render(<Chaos />);

    const input = screen.getByPlaceholderText('ms');
    expect(input).toBeDisabled();

    const applyButton = screen.queryByRole('button', { name: 'Apply' });
    expect(applyButton).not.toBeInTheDocument();
  });

  it('toggles proxy status', () => {
    vi.mocked(useChaosConfig).mockReturnValue({
      config: { latency_enabled: false, latency_delay_ms: 0 },
      loading: false,
      error: null,
      mutate: vi.fn()
    } as any);

    render(<Chaos />);

    // initially proxy-1 is active (renders Square icon button since status='active', wait it toggles it)
    // we can find the proxy-1 text and the button next to it
    expect(screen.getByText('proxy-1')).toBeInTheDocument();
    
    // There are multiple buttons. We can find the one in the same container, or by test id. 
    // The button has no aria-label, but we can query by nearest class or just queryAllByRole
    // Since proxy-1 is the first proxy card, it should be one of the buttons
    // The play/stop buttons are rendered in the targeted proxies section
    // We can rely on the fact that when status is active, it has text-destructive class for the button
    const stopButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-destructive'));
    expect(stopButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(stopButtons[0]);

    // After click, it should become active (Play icon, text-success class)
    const playButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-success'));
    expect(playButtons.length).toBeGreaterThan(0);
  });
});
