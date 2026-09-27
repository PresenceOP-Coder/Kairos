import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dashboard } from './Dashboard';
import { useSystemHealth, useSystemStats, useConnections } from '../hooks/useKairos';

vi.mock('../hooks/useKairos', () => ({
  useSystemHealth: vi.fn(),
  useSystemStats: vi.fn(),
  useConnections: vi.fn(),
}));

describe('Dashboard Component', () => {
  it('renders loading states correctly', () => {
    vi.mocked(useSystemHealth).mockReturnValue({
      health: { status: 'unknown' },
      loading: true,
      error: null
    });
    vi.mocked(useSystemStats).mockReturnValue({
      stats: { active_connections: 0, bytes_sent: 0, bytes_received: 0, active_proxies: 0 },
      loading: true,
      error: null
    });
    vi.mocked(useConnections).mockReturnValue({
      connections: [],
      loading: true,
      error: null
    });

    render(<Dashboard />);
    
    expect(screen.getByText('Checking system...')).toBeInTheDocument();
    expect(screen.getByText('Loading connections...')).toBeInTheDocument();
  });

  it('renders error states correctly', () => {
    vi.mocked(useSystemHealth).mockReturnValue({
      health: { status: 'unknown' },
      loading: false,
      error: new Error('Failed')
    });
    vi.mocked(useSystemStats).mockReturnValue({
      stats: { active_connections: 0, bytes_sent: 0, bytes_received: 0, active_proxies: 0 },
      loading: false,
      error: new Error('Failed')
    });
    vi.mocked(useConnections).mockReturnValue({
      connections: [],
      loading: false,
      error: new Error('Failed')
    });

    render(<Dashboard />);
    
    expect(screen.getByText('System Unreachable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load connections.')).toBeInTheDocument();
    
    // KPI cards should show 'Err'
    const errBadges = screen.getAllByText('Err');
    expect(errBadges.length).toBeGreaterThan(0);
  });

  it('renders data correctly', () => {
    vi.mocked(useSystemHealth).mockReturnValue({
      health: { status: 'ok' },
      loading: false,
      error: null
    });
    vi.mocked(useSystemStats).mockReturnValue({
      stats: { active_connections: 5, bytes_sent: 1048576, bytes_received: 1048576, active_proxies: 2 },
      loading: false,
      error: null
    });
    vi.mocked(useConnections).mockReturnValue({
      connections: [
        { id: '123', clientAddr: '10.0.0.1', targetAddr: '10.0.0.2', uptime: '5m', bytesSent: 0, bytesReceived: 0, status: 'active' }
      ],
      loading: false,
      error: null
    });

    render(<Dashboard />);
    
    expect(screen.getByText('System Online')).toBeInTheDocument();
    expect(screen.getByText('2.00 MB')).toBeInTheDocument(); // 2MB total
    expect(screen.getByText('10.0.0.1')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
