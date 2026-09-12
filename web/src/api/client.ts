import type { Proxy, Experiment, Scenario, Fault } from '../types';

const API_BASE = '/api/v1'; // Assuming Vite proxies this to the Go backend

class KairosApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Proxies
  async getProxies(): Promise<Proxy[]> {
    return this.fetch<Proxy[]>('/proxies');
  }

  async startProxy(config: Proxy['config']): Promise<Proxy> {
    return this.fetch<Proxy>('/proxies', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async stopProxy(id: string): Promise<void> {
    return this.fetch<void>(`/proxies/${id}`, { method: 'DELETE' });
  }

  async updateProxyFaults(id: string, faults: Fault[]): Promise<Proxy> {
    return this.fetch<Proxy>(`/proxies/${id}/faults`, {
      method: 'PUT',
      body: JSON.stringify({ faults }),
    });
  }

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    return this.fetch<Experiment[]>('/experiments');
  }

  async createExperiment(exp: Partial<Experiment>): Promise<Experiment> {
    return this.fetch<Experiment>('/experiments', {
      method: 'POST',
      body: JSON.stringify(exp),
    });
  }

  async stopExperiment(id: string): Promise<void> {
    return this.fetch<void>(`/experiments/${id}/stop`, { method: 'POST' });
  }

  // Metrics
  async getMetrics(proxyId?: string): Promise<any[]> {
    const url = proxyId ? `/metrics?proxyId=${proxyId}` : '/metrics';
    return this.fetch<any[]>(url);
  }

  // Scenarios
  async getScenarios(): Promise<Scenario[]> {
    return this.fetch<Scenario[]>('/scenarios');
  }
}

export const apiClient = new KairosApiClient();
