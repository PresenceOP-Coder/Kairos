import { Play, Pause, Square, Plus, Settings2, FileCode, CheckCircle2, StopCircle } from 'lucide-react';
import { useCurrentScenario } from '../hooks/useKairos';

export function Scenarios() {
  const { scenario, loading } = useCurrentScenario();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Scenario</h2>
          <p className="text-foreground/60 text-sm mt-1">Currently loaded chaos scenario from the Go backend.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Load Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="glass-panel p-6 rounded-xl flex items-center justify-center min-h-[300px]">
               <div className="animate-pulse flex items-center gap-2 text-foreground/50">
                 <Settings2 className="w-5 h-5 animate-spin" /> Loading scenario...
               </div>
             </div>
          ) : !scenario || scenario.error ? (
             <div className="glass-panel p-6 rounded-xl flex flex-col items-center justify-center min-h-[300px] text-foreground/50 italic border-dashed">
               <StopCircle className="w-8 h-8 mb-3 opacity-50" />
               No active scenario loaded in backend.
             </div>
          ) : (
            <div className="glass-panel p-0 rounded-xl overflow-hidden border-primary/20">
              <div className="p-5 border-b border-card-border bg-card/30 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" /> Active Configuration
                  </h3>
                  <div className="text-sm text-foreground/50 mt-1">Parsed from scenario YAML</div>
                </div>
                <span className="bg-success/10 text-success text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Running
                </span>
              </div>
              
              <div className="p-5 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-3">Global Defaults</h4>
                  <div className="bg-background rounded-lg border border-card-border overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <tbody className="divide-y divide-card-border">
                        {scenario.latency?.enabled && (
                          <tr><td className="px-4 py-3 font-medium w-1/3">Latency</td><td className="px-4 py-3 text-primary font-mono">{scenario.latency.delay_ms}ms</td></tr>
                        )}
                        {scenario.bandwidth?.enabled && (
                          <tr><td className="px-4 py-3 font-medium w-1/3">Bandwidth</td><td className="px-4 py-3 text-warning font-mono">{scenario.bandwidth.rate_kbps} kbps</td></tr>
                        )}
                        {scenario.packet_loss?.enabled && (
                          <tr><td className="px-4 py-3 font-medium w-1/3">Packet Loss</td><td className="px-4 py-3 text-orange-400 font-mono">{scenario.packet_loss.percent}%</td></tr>
                        )}
                        {!scenario.latency?.enabled && !scenario.bandwidth?.enabled && !scenario.packet_loss?.enabled && (
                          <tr><td className="px-4 py-4 text-center italic text-foreground/40">No global faults configured</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-foreground/70 uppercase tracking-wider mb-3">Scheduled Steps</h4>
                  <div className="space-y-3">
                    {scenario.steps?.length > 0 ? scenario.steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 bg-background/50 border border-card-border p-3 rounded-lg">
                        <div className="bg-card w-10 h-10 flex items-center justify-center rounded-lg font-mono text-xs text-foreground/50">
                          +{step.after}
                        </div>
                        <div>
                          <div className="font-medium text-sm">Apply Step {index + 1}</div>
                          <div className="text-xs text-foreground/50 font-mono mt-0.5">
                            {step.latency?.enabled ? `Latency: ${step.latency.delay_ms}ms` : ''}
                            {step.reset?.enabled ? `Reset after: ${step.reset.after_seconds}s` : ''}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-sm text-foreground/50 italic px-2">No scheduled steps.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-success-foreground py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Play className="w-4 h-4 fill-current" /> Execute Trigger
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Pause className="w-4 h-4 fill-current" /> Pause Scenario
              </button>
              <button className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20 py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Square className="w-4 h-4 fill-current" /> Stop All
              </button>
            </div>
          </div>
          
          <div className="glass-panel p-5 rounded-xl">
            <h3 className="font-semibold mb-3">Event Triggers</h3>
            <div className="text-sm text-foreground/70 space-y-4">
              <p>The Go proxy is listening for the following network events to trigger scenario execution:</p>
              
              {scenario && !scenario.error && scenario.trigger?.every_nth_connection > 0 ? (
                <div className="bg-card p-3 rounded-lg border border-card-border flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <div>
                    <div className="font-medium">Connection Count</div>
                    <div className="text-xs text-foreground/50">Triggers every {scenario.trigger.every_nth_connection} connections</div>
                  </div>
                </div>
              ) : (
                <div className="bg-card p-3 rounded-lg border border-dashed border-card-border text-center text-foreground/50 italic">
                  No active triggers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
