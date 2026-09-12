export interface ProxyConfig {
  listenAddr: string;
  targetUrl: string;
}

export interface Fault {
  type: 'latency' | 'jitter' | 'bandwidth' | 'packet_loss' | 'reset' | 'blackhole' | 'corruption';
  percentage: number;
  delayMs?: number;
  jitterMs?: number;
  rateLimitBytesPerSec?: number;
}

export interface Proxy {
  id: string;
  config: ProxyConfig;
  status: 'active' | 'stopped';
  activeFaults: Fault[];
}

export interface Trigger {
  type: 'timer' | 'connection_count' | 'bandwidth_threshold' | 'manual';
  condition?: string;
  status: 'waiting' | 'triggered';
}

export interface ScenarioStep {
  id: string;
  name: string;
  durationMs: number;
  faults: Fault[];
  trigger?: Trigger;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  experiments: Experiment[];
  steps?: ScenarioStep[];
  globalTriggers?: Trigger[];
}

export interface Experiment {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'scheduled';
  targetProxyIds: string[];
  faults: Fault[];
  startTime: string;
  endTime?: string;
}

export interface Connection {
  id: string;
  clientAddr: string;
  targetAddr: string;
  uptime: string;
  status: 'active' | 'closed';
  bytesSent: number;
  bytesReceived: number;
}