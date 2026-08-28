import { useState } from 'react';
import { Play, Square, Activity, Zap, ShieldAlert, Wifi } from 'lucide-react';
import type { Proxy } from '../types';

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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">Live Chaos Controls</h2>
          <p className="text-foreground/80 font-medium">Inject faults in real-time across active proxies.</p>
        </div>
        <button className="paper-btn bg-background text-foreground px-5 py-3 rounded-xl font-bold flex items-center gap-2 w-max">
          <Zap className="w-5 h-5 stroke-[2.5]" />
          NEW PROXY
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {proxies.map(proxy => (
          <div key={proxy.id} className="glass-panel overflow-hidden flex flex-col relative group">
            <div className="p-6 border-b-2 border-card-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                  <h3 className="font-bold text-xl">{proxy.id}</h3>
                </div>
                <div className="text-sm text-foreground/80 font-mono font-medium">
                  {proxy.config.listenAddr} → {proxy.config.targetUrl}
                </div>
              </div>
              <button 
                onClick={() => toggleProxyStatus(proxy.id)}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground transition-all duration-200 shadow-[2px_2px_0px_0px_#111] hover:shadow-[4px_4px_0px_0px_#111] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                  proxy.status === 'active' 
                    ? 'bg-[#f4cbcb] text-[#9c2d2d]' 
                    : 'bg-[#c6dfcd] text-[#378051]'
                }`}
              >
                {proxy.status === 'active' ? <Square className="w-4 h-4 fill-current stroke-current" /> : <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />}
              </button>
            </div>
            
            <div className="p-6 flex-1 bg-background/50">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-5 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
                Active Faults
              </h4>
              
              {proxy.activeFaults.length === 0 ? (
                <div className="text-sm text-foreground/60 font-medium flex items-center justify-center h-20 border-2 border-dashed border-card-border/50 rounded-xl bg-card/50">
                  No active faults
                </div>
              ) : (
                <div className="space-y-4">
                  {proxy.activeFaults.map((fault, idx) => (
                    <div key={idx} className="bg-card rounded-xl p-4 border-2 border-card-border text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2 capitalize font-bold">
                        {fault.type === 'latency' && <Activity className="w-4 h-4 stroke-[2.5]" />}
                        {fault.type === 'abort' && <ShieldAlert className="w-4 h-4 stroke-[2.5]" />}
                        {fault.type === 'bandwidth' && <Wifi className="w-4 h-4 stroke-[2.5]" />}
                        <span>{fault.type}</span>
                      </div>
                      <div className="text-sm text-foreground/80 font-mono font-medium border-l-2 border-card-border/30 pl-4">
                        {fault.percentage}% 
                        {fault.delayMs && ` | ${fault.delayMs}ms`}
                        {fault.httpStatus && ` | ${fault.httpStatus}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-5 border-t-2 border-card-border bg-card">
              <button className="paper-btn w-full py-3 bg-foreground text-background font-bold rounded-xl uppercase tracking-widest text-sm">
                Inject Fault
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
