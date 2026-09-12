import type { Connection } from '../types';

// The Go backend currently exposes routes at the root level:
// GET /health
// GET /connections
// GET /stats
// POST /chaos
// POST /chaos/latency

export interface SystemHealth {
  status: string;
  uptime?: string;
  version?: string;
}

export interface SystemStats {
  active_connections: number;
  bytes_sent: number;
  bytes_received: number;
  active_proxies: number;
}

export interface ChaosResponse {
  latency_enabled: boolean;
  latency_delay_ms: number;
}

export interface LatencyRequest {
  enabled: boolean;
  delay_ms: number;
}

class KairosApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getHealth(): Promise<SystemHealth> {
    try {
      return await this.fetch<SystemHealth>('/health');
    } catch {
      return { status: 'offline' };
    }
  }

  async getConnections(): Promise<Connection[]> {
    try {
      return await this.fetch<Connection[]>('/connections');
    } catch {
      return [];
    }
  }

  async getStats(): Promise<SystemStats> {
    try {
      return await this.fetch<SystemStats>('/stats');
    } catch {
      return {
        active_connections: 0,
        bytes_sent: 0,
        bytes_received: 0,
        active_proxies: 0
      };
    }
  }

  async getChaos(): Promise<ChaosResponse> {
    try {
      return await this.fetch<ChaosResponse>('/chaos');
    } catch {
      return { latency_enabled: false, latency_delay_ms: 0 };
    }
  }

  async setLatency(req: LatencyRequest): Promise<void> {
    return this.fetch<void>('/chaos/latency', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }

  async getScenario(): Promise<any> {
    try {
      return await this.fetch<any>('/scenario');
    } catch {
      return null;
    }
  }
}

export const apiClient = new KairosApiClient();
