import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Scenarios } from './Scenarios';
import { useScenarios } from '../hooks/useKairos';

vi.mock('../hooks/useKairos', () => ({
  useScenarios: vi.fn(),
}));

describe('Scenarios Component', () => {
  it('renders loading state', () => {
    vi.mocked(useScenarios).mockReturnValue({
      scenarios: [],
      loading: true,
      error: null
    });

    render(<Scenarios />);
    
    expect(screen.getByText('Loading scenarios...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.mocked(useScenarios).mockReturnValue({
      scenarios: [],
      loading: false,
      error: new Error('Failed to fetch')
    });

    render(<Scenarios />);
    
    expect(screen.getByText('Failed to load scenarios')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.mocked(useScenarios).mockReturnValue({
      scenarios: [],
      loading: false,
      error: null
    });

    render(<Scenarios />);
    
    expect(screen.getByText('No scenarios found')).toBeInTheDocument();
  });

  it('renders scenario data and handles selection', () => {
    vi.mocked(useScenarios).mockReturnValue({
      scenarios: [
        {
          id: 'scen-1',
          name: 'High Latency Spike',
          description: 'Injects 500ms latency',
          experiments: []
        },
        {
          id: 'scen-2',
          name: 'Packet Drop Event',
          description: 'Drops 5% packets',
          experiments: []
        }
      ],
      loading: false,
      error: null
    });

    render(<Scenarios />);
    
    // Check if list renders
    expect(screen.getByText('High Latency Spike')).toBeInTheDocument();
    expect(screen.getByText('Packet Drop Event')).toBeInTheDocument();

    // Default right panel is empty selection
    expect(screen.getByText('Select a scenario to view details')).toBeInTheDocument();

    // Click on a scenario
    fireEvent.click(screen.getByText('High Latency Spike'));

    // Check if right panel updates
    expect(screen.getAllByText('Injects 500ms latency').length).toBe(2);
    expect(screen.getByText('Wait for connection spike')).toBeInTheDocument(); // dummy trigger text
    
    // Check if Run Now button appears
    expect(screen.getByRole('button', { name: /Run Now/i })).toBeInTheDocument();
  });
});
