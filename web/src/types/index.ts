export interface ProxyConfig {
  listenAddr: string;
  targetUrl: string;
}

export interface FaultConfig {
  type: 'latency' | 'abort' | 'bandwidth';
  percentage: number;
  // Latency fault
  delayMs?: number;
  jitterMs?: number;
  // Abort fault
  httpStatus?: number;
  // Bandwidth fault
  rateLimitBytesPerSec?: number;
}

export interface Proxy {
  id: string;
  config: ProxyConfig;
  status: 'active' | 'stopped';
  activeFaults: FaultConfig[];
}

export interface Experiment {
  id: string;
  name: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  targetProxyIds: string[];
  faults: FaultConfig[];
  startTime: string; // ISO format
  endTime?: string;  // ISO format
}

export interface MetricPoint {
  timestamp: string; // ISO format
  value: number;
}

export interface ProxyMetrics {
  proxyId: string;
  requestsTotal: number;
  errorRate: number;
  latencyAvg: number;
  latencyP99: number;
  // Time series for charts
  latencyHistory: MetricPoint[];
  requestHistory: MetricPoint[];
  errorHistory: MetricPoint[];
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  experiments: Experiment[];
}