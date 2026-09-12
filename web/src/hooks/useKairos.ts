import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { SystemHealth, SystemStats, ChaosResponse } from '../api/client';
import type { Connection } from '../types';

export function useSystemHealth(pollingInterval = 5000) {
  const [health, setHealth] = useState<SystemHealth>({ status: 'unknown' });

  useEffect(() => {
    let mounted = true;
    const fetchHealth = async () => {
      const data = await apiClient.getHealth();
      if (mounted) setHealth(data);
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, pollingInterval);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return health;
}

export function useSystemStats(pollingInterval = 2000) {
  const [stats, setStats] = useState<SystemStats>({
    active_connections: 0,
    bytes_sent: 0,
    bytes_received: 0,
    active_proxies: 0,
  });

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      const data = await apiClient.getStats();
      if (mounted) setStats(data);
    };

    fetchStats();
    const interval = setInterval(fetchStats, pollingInterval);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return stats;
}

export function useConnections(pollingInterval = 2000) {
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchConns = async () => {
      const data = await apiClient.getConnections();
      if (mounted && Array.isArray(data)) {
        setConnections(data);
      }
    };

    fetchConns();
    const interval = setInterval(fetchConns, pollingInterval);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return connections;
}

export function useChaosConfig(pollingInterval = 2000) {
  const [config, setConfig] = useState<ChaosResponse>({ latency_enabled: false, latency_delay_ms: 0 });

  useEffect(() => {
    let mounted = true;
    const fetchConfig = async () => {
      const data = await apiClient.getChaos();
      if (mounted) setConfig(data);
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

  return { config, mutate };
}

export function useCurrentScenario(pollingInterval = 3000) {
  const [scenario, setScenario] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchScenario = async () => {
      const data = await apiClient.getScenario();
      if (mounted) {
        setScenario(data);
        setLoading(false);
      }
    };

    fetchScenario();
    const interval = setInterval(fetchScenario, pollingInterval);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollingInterval]);

  return { scenario, loading };
}
