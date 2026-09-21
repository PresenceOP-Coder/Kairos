import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { SystemHealth, SystemStats, ChaosResponse } from '../api/client';
import type { Connection, Scenario, Experiment } from '../types';

export function useSystemHealth(pollingInterval = 5000) {
  const [health, setHealth] = useState<SystemHealth>({ status: 'unknown' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      try {
        const data = await apiClient.getHealth();

        if (mounted) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch system health'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }

    };

    fetchHealth();
    const interval = setInterval(fetchHealth, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return { health, loading, error };
}

export function useSystemStats(pollingInterval = 2000) {
  const [stats, setStats] = useState<SystemStats>({
    active_connections: 0,
    bytes_sent: 0,
    bytes_received: 0,
    active_proxies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const data = await apiClient.getStats();
        if (mounted) {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch stats'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return { stats, loading, error };
}

export function useConnections(pollingInterval = 2000) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchConns = async () => {
      try {
        const data = await apiClient.getConnections();
        if (mounted && Array.isArray(data)) {
          setConnections(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch connections'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchConns();
    const interval = setInterval(fetchConns, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return { connections, loading, error };
}

export function useChaosConfig(pollingInterval = 2000) {
  const [config, setConfig] = useState<ChaosResponse>({ latency_enabled: false, latency_delay_ms: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      try {
        const data = await apiClient.getChaos();
        if (mounted) {
          setConfig(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch chaos config'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchConfig();
    const interval = setInterval(fetchConfig, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  const mutate = async () => {
    const data = await apiClient.getChaos();
    setConfig(data);
  }

  return { config, mutate, loading, error };
}

export function useScenarios(pollingInterval = 5000) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchScenarios = async () => {
      try {
        const data = await apiClient.getScenarios();
        if (mounted && Array.isArray(data)) {
          setScenarios(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch scenarios'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchScenarios();
    const interval = setInterval(fetchScenarios, pollingInterval);
    return () => { mounted = false; clearInterval(interval); };
  }, [pollingInterval]);

  return { scenarios, loading, error };
}

export function useExperiments(pollingInterval = 5000) {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchExperiments = async () => {
      try {
        const data = await apiClient.getExperiments();
        if (mounted && Array.isArray(data)) {
          setExperiments(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err : new Error('Failed to fetch experiments'));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchExperiments();
    const interval = setInterval(fetchExperiments, pollingInterval);
    return () => { mounted = false; clearInterval(interval); };
  }, [pollingInterval]);

  return { experiments, loading, error };
}
