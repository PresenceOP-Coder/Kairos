import { useState } from 'react';
import { Play, Square, Activity, Zap, ShieldAlert, Wifi, RotateCcw, XCircle, FileWarning } from 'lucide-react';
import type { Proxy } from '../types';

export function Chaos() {
  const [proxies, setProxies] = useState<Proxy[]>([
    {
      id: 'proxy-1',
      config: { listenAddr: ':8080', targetUrl: '10.0.0.5:3000' },
      status: 'active',
      activeFaults: [
        { type: 'latency', percentage: 100, delayMs: 200 },
        { type: 'packet_loss', percentage: 5 }
      ],
    },
    {
      id: 'proxy-2',
      config: { listenAddr: ':8081', targetUrl: '10.0.0.6:3001' },
      status: 'active',
      activeFaults: [
        { type: 'bandwidth', percentage: 100, rateLimitBytesPerSec: 51200 },
        { type: 'jitter', percentage: 100, jitterMs: 50 }
      ],
    },
    {
      id: 'proxy-db',
      config: { listenAddr: ':5432', targetUrl: 'db.internal:5432' },
      status: 'stopped',
      activeFaults: [
        { type: 'reset', percentage: 1 },
        { type: 'blackhole', percentage: 10 },
        { type: 'corruption', percentage: 5 }
      ],
    }
  ]);

  const toggleProxyStatus = (id: string) => {
    setProxies(proxies.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'stopped' : 'active' } : p
    ));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Chaos Controls</h2>
          <p className="text-foreground/60 text-sm mt-1">Inject TCP faults in real-time across active proxies.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
          <Zap className="w-4 h-4" />
          New Proxy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {proxies.map(proxy => (
          <div key={proxy.id} className="glass-panel overflow-hidden flex flex-col transition-all hover:border-primary/50">
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
              
              {proxy.activeFaults.length === 0 ? (
                <div className="text-sm text-foreground/40 italic flex items-center justify-center h-20 border border-dashed border-card-border rounded-lg">
                  No active faults
                </div>
              ) : (
                <div className="space-y-3">
                  {proxy.activeFaults.map((fault, idx) => (
                    <div key={idx} className="bg-background rounded-lg p-3 border border-card-border text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 capitalize">
                        {getFaultIcon(fault.type)}
                        <span className="font-medium text-foreground/90">{fault.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-xs text-foreground/60 font-mono text-right">
                        <div>{fault.percentage}% probability</div>
                        {fault.delayMs && <div className="text-primary/70">{fault.delayMs}ms delay</div>}
                        {fault.jitterMs && <div className="text-purple-400/70">±{fault.jitterMs}ms jitter</div>}
                        {fault.rateLimitBytesPerSec && <div className="text-warning/70">{(fault.rateLimitBytesPerSec/1024).toFixed(0)} KB/s</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-card-border bg-card/80">
              <button className="w-full py-2 bg-secondary hover:bg-secondary-hover text-secondary-foreground text-sm font-medium rounded-lg transition-colors">
                Configure Chaos
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
