import { useState, useEffect } from 'react';
import { Play, Square, Activity, Zap, ShieldAlert, Wifi } from 'lucide-react';
import { Proxy, FaultConfig } from '../types';

export function Controls() {
  const [proxies, setProxies] = useState<Proxy[]>([
    {
      id: 'proxy-1',
      config: { listenAddr: ':8080', targetUrl: 'http://localhost:3000' },
      status: 'active',
      activeFaults: [],
    },
    {
      id: 'proxy-2',
      config: { listenAddr: ':8081', targetUrl: 'http://localhost:3001' },
      status: 'stopped',
      activeFaults: [{ type: 'latency', percentage: 100, delayMs: 500 }],
    }
  ]);

  const toggleProxyStatus = (id: string) => {
    setProxies(proxies.map(p => 
      p.id === id ? { ...p, status: p.status === 'active' ? 'stopped' : 'active' } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Chaos Controls</h2>
          <p className="text-foreground/60 text-sm mt-1">Inject faults in real-time across active proxies.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
          <Zap className="w-4 h-4" />
          New Proxy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {proxies.map(proxy => (
          <div key={proxy.id} className="glass-panel rounded-xl overflow-hidden flex flex-col transition-all hover:border-primary/30">
            <div className="p-5 border-b border-card-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className={`w-4 h-4 ${proxy.status === 'active' ? 'text-success' : 'text-foreground/40'}`} />
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
            
            <div className="p-5 flex-1 bg-card/30">
              <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-warning" />
                Active Faults
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
                        {fault.type === 'latency' && <Activity className="w-4 h-4 text-blue-400" />}
                        {fault.type === 'abort' && <ShieldAlert className="w-4 h-4 text-destructive" />}
                        {fault.type === 'bandwidth' && <Wifi className="w-4 h-4 text-warning" />}
                        <span className="font-medium">{fault.type}</span>
                      </div>
                      <div className="text-xs text-foreground/60 font-mono">
                        {fault.percentage}% 
                        {fault.delayMs && ` | ${fault.delayMs}ms`}
                        {fault.httpStatus && ` | ${fault.httpStatus}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-card-border bg-card/50">
              <button className="w-full py-2 bg-secondary hover:bg-secondary-hover text-secondary-foreground text-sm font-medium rounded-lg transition-colors">
                Inject Fault
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
