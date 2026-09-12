import { useState, useEffect } from 'react';
import { Play, Square, Activity, Zap, ShieldAlert, Wifi, RotateCcw, XCircle, FileWarning } from 'lucide-react';
import { useChaosConfig } from '../hooks/useKairos';
import { apiClient } from '../api/client';
import type { Proxy } from '../types';

export function Chaos() {
  const { config, mutate } = useChaosConfig();
  const [delayMs, setDelayMs] = useState(0);

  // Sync local state with remote config initially
  useEffect(() => {
    if (config.latency_delay_ms > 0) {
      setDelayMs(config.latency_delay_ms);
    }
  }, [config.latency_delay_ms]);

  const [proxies, setProxies] = useState<Proxy[]>([
    {
      id: 'proxy-1',
      config: { listenAddr: ':8080', targetUrl: '10.0.0.5:3000' },
      status: 'active',
      activeFaults: [],
    },
    {
      id: 'proxy-db',
      config: { listenAddr: ':5432', targetUrl: 'db.internal:5432' },
      status: 'stopped',
      activeFaults: [],
    }
  ]);

  const toggleProxyStatus = (id: string) => {
    setProxies(proxies.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'stopped' : 'active' } : p
    ));
  };

  const handleLatencyToggle = async () => {
    const newEnabled = !config.latency_enabled;
    const finalDelay = delayMs || 500; // default to 500ms if 0
    
    await apiClient.setLatency({
      enabled: newEnabled,
      delay_ms: finalDelay
    });
    
    if (newEnabled) {
      setDelayMs(finalDelay);
    }
    await mutate();
  };

  const handleLatencyUpdate = async () => {
    if (!config.latency_enabled) return;
    await apiClient.setLatency({
      enabled: true,
      delay_ms: delayMs
    });
    await mutate();
  };

  const getFaultIcon = (type: string) => {
    switch (type) {
      case 'latency': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'jitter': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'bandwidth': return <Wifi className="w-4 h-4 text-warning" />;
      case 'packet_loss': return <FileWarning className="w-4 h-4 text-orange-400" />;
      case 'reset': return <RotateCcw className="w-4 h-4 text-destructive" />;
      case 'blackhole': return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'corruption': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Chaos Controls</h2>
          <p className="text-foreground/60 text-sm mt-1">Inject TCP faults in real-time across active proxies.</p>
        </div>
      </div>

      {/* Global Chaos Config */}
      <div className="glass-panel p-6 rounded-xl border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Global Configuration
            </h3>
            <p className="text-sm text-foreground/60 mt-1">Faults applied globally across all active proxies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latency Control */}
          <div className="bg-background/50 border border-card-border p-5 rounded-xl flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  <Activity className="w-4 h-4 text-blue-400" /> Latency Injection
                </div>
                <div className="text-xs text-foreground/50 mt-1">Add artificial delay to all packets</div>
              </div>
              <button 
                onClick={handleLatencyToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.latency_enabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.latency_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
                disabled={!config.latency_enabled}
                className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="ms"
              />
              <span className="text-sm text-foreground/50">milliseconds</span>
              
              {config.latency_enabled && (
                <button 
                  onClick={handleLatencyUpdate}
                  className="ml-auto bg-secondary hover:bg-secondary-hover text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* Placeholders for future global faults */}
          <div className="bg-background/30 border border-card-border border-dashed p-5 rounded-xl flex items-center justify-center opacity-50">
            <div className="text-center text-sm text-foreground/60">
              <div className="flex justify-center mb-2"><Wifi className="w-5 h-5 text-warning" /></div>
              Bandwidth Controls (Coming soon)
            </div>
          </div>
        </div>
      </div>

      {/* Per-Proxy Mock view */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Targeted Proxies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {proxies.map(proxy => (
            <div key={proxy.id} className="glass-panel overflow-hidden flex flex-col transition-all hover:border-primary/50 opacity-80">
              <div className="p-5 border-b border-card-border flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert className={`w-4 h-4 ${proxy.status === 'active' ? 'text-success' : 'text-foreground/40'}`} />
                    <h3 className="font-semibold text-lg">{proxy.id}</h3>
                  </div>
                  <div className="text-xs text-foreground/50 font-mono">
                    {proxy.config.listenAddr} → {proxy.config.targetUrl}
                  </div>
                </div>
                <button 
                  onClick={() => toggleProxyStatus(proxy.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    proxy.status === 'active' 
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' 
                      : 'bg-success/10 text-success hover:bg-success/20'
                  }`}
                >
                  {proxy.status === 'active' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              </div>
              
              <div className="p-5 flex-1 bg-card/50">
                <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-foreground/80">
                  <Zap className="w-4 h-4 text-primary" />
                  Active TCP Faults
                </h4>
                
                {config.latency_enabled ? (
                  <div className="space-y-3">
                      <div className="bg-background rounded-lg p-3 border border-primary/30 bg-primary/5 text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2 capitalize">
                          {getFaultIcon('latency')}
                          <span className="font-medium text-primary">Global Latency</span>
                        </div>
                        <div className="text-xs text-primary/80 font-mono text-right">
                          <div>100% probability</div>
                          <div>{config.latency_delay_ms}ms delay</div>
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="text-sm text-foreground/40 italic flex items-center justify-center h-20 border border-dashed border-card-border rounded-lg">
                    No active faults
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
