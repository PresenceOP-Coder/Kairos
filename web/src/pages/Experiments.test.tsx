import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Experiments } from './Experiments';
import { useExperiments } from '../hooks/useKairos';

vi.mock('../hooks/useKairos', () => ({
  useExperiments: vi.fn(),
}));

describe('Experiments Component', () => {
  it('renders loading state', () => {
    vi.mocked(useExperiments).mockReturnValue({
      experiments: [],
      loading: true,
      error: null
    });

    render(<Experiments />);
    
    expect(screen.getByText('Loading experiments...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(useExperiments).mockReturnValue({
      experiments: [],
      loading: false,
      error: new Error('Failed to fetch')
    });

    render(<Experiments />);
    
    expect(screen.getByText('Failed to load experiments')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.mocked(useExperiments).mockReturnValue({
      experiments: [],
      loading: false,
      error: null
    });

    render(<Experiments />);
    
    expect(screen.getByText('No experiments found.')).toBeInTheDocument();
  });

  it('renders experiment data', () => {
    vi.mocked(useExperiments).mockReturnValue({
      experiments: [
        {
          id: 'exp-1',
          name: 'Latency Spike Execution',
          scenarioId: 'scen-1',
          status: 'running',
          startTime: new Date().toISOString(),
          endTime: null,
          targetProxyIds: ['proxy-1'],
          faults: [{ type: 'latency', value: '500ms' }],
          metrics: { connectionsAffected: 5, bytesDropped: 0 }
        }
      ],
      loading: false,
      error: null
    });

    render(<Experiments />);
    
    expect(screen.getByText('Latency Spike Execution')).toBeInTheDocument();
    expect(screen.getAllByText('running').length).toBeGreaterThan(0);
  });
});
