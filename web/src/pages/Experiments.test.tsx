import { render, screen, fireEvent } from '@testing-library/react';
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
          status: 'running',
          startTime: new Date().toISOString(),
          targetProxyIds: ['proxy-1'],
          faults: [{ type: 'latency', percentage: 100 }]
        }
      ],
      loading: false,
      error: null
    });

    render(<Experiments />);
    
    expect(screen.getByText('Latency Spike Execution')).toBeInTheDocument();
    expect(screen.getAllByText('running').length).toBeGreaterThan(0);
  });

  it('filters experiments by status', () => {
    vi.mocked(useExperiments).mockReturnValue({
      experiments: [
        {
          id: 'exp-1',
          name: 'Running Exp',
          status: 'running',
          startTime: new Date().toISOString(),
          targetProxyIds: ['proxy-1'],
          faults: [{ type: 'latency', percentage: 100 }]
        },
        {
          id: 'exp-2',
          name: 'Completed Exp',
          status: 'completed',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          targetProxyIds: ['proxy-1'],
          faults: [{ type: 'reset', percentage: 100 }]
        }
      ],
      loading: false,
      error: null
    });

    render(<Experiments />);

    // Initially both should be visible
    expect(screen.getByText('Running Exp')).toBeInTheDocument();
    expect(screen.getByText('Completed Exp')).toBeInTheDocument();

    // Click 'completed' filter
    // Get all buttons, find the one with text 'completed' (case-insensitive or exact text based on UI)
    // The UI maps ['all', 'running', 'scheduled', 'completed'] to buttons with `{f}`
    const completedFilterButton = screen.getByRole('button', { name: 'completed' });
    
    // Fire click
    fireEvent.click(completedFilterButton);

    // Now 'Completed Exp' should be visible and 'Running Exp' should NOT be visible
    expect(screen.getByText('Completed Exp')).toBeInTheDocument();
    expect(screen.queryByText('Running Exp')).not.toBeInTheDocument();
  });
});
