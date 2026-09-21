import { useState } from 'react';
import { Plus, Play, MoreVertical, FileJson, Clock, Zap } from 'lucide-react';
import type { Scenario } from '../types';
import { useScenarios } from '../hooks/useKairos';

export function Scenarios() {
  const { scenarios, loading, error } = useScenarios();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-6">
      {/* Left Sidebar - Scenario List */}
      <div className="w-full md:w-1/3 border border-card-border rounded-xl bg-card/50 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-card-border flex items-center justify-between bg-background">
          <h2 className="text-2xl font-bold tracking-tight">Scenarios</h2>
          <button className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {loading ? (
            <div className="text-center p-4 text-foreground/50 text-sm">Loading scenarios...</div>
          ) : error ? (
            <div className="text-center p-4 text-destructive text-sm">Failed to load scenarios</div>
          ) : scenarios.length === 0 ? (
            <div className="text-center p-4 text-foreground/50 text-sm">No scenarios found</div>
          ) : (
            scenarios.map(scenario => (
              <div 
                key={scenario.id} 
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id 
                    ? 'bg-primary/10 border-primary shadow-sm' 
                    : 'bg-card border-card-border hover:border-primary/40 hover:bg-card/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${selectedScenario?.id === scenario.id ? 'text-primary' : 'text-foreground'}`}>
                      {scenario.name}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-1 line-clamp-2">{scenario.description}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scenario Details */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        {selectedScenario ? (
          <>
            <div className="p-6 border-b border-card-border bg-card/50 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">{selectedScenario.name}</h2>
                <p className="text-foreground/70 text-sm max-w-2xl">{selectedScenario.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-lg text-sm font-medium transition-colors">
                  <Play className="w-4 h-4 fill-current" /> Run Now
                </button>
                <button className="p-2 rounded-lg border border-card-border hover:bg-secondary transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-background/50 rounded-xl p-5 border border-card-border">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1 text-primary">
                    <FileJson className="w-4 h-4" /> Configuration
                  </div>
                  <div className="text-xs text-foreground/50 mb-4">YAML/JSON definition of faults</div>
                  <pre className="p-4 bg-card rounded-lg text-sm font-mono text-foreground/80 overflow-x-auto border border-card-border/50">
{`name: ${selectedScenario.name}
version: v1alpha1
kind: ChaosScenario
spec:
  duration: 120s
  faults:
    - type: latency
      percentage: 100
      delayMs: 500`}
                  </pre>
                </div>
                
                <div className="bg-background/50 rounded-xl p-5 border border-card-border">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1 text-blue-400">
                    <Clock className="w-4 h-4" /> Experiment History
                  </div>
                  <div className="text-xs text-foreground/50 mb-4">Past executions of this scenario</div>
                  <div className="space-y-3">
                    {selectedScenario.experiments.length === 0 ? (
                      <div className="text-sm text-foreground/40 italic flex items-center justify-center h-20 border border-dashed border-card-border rounded-lg bg-card/30">
                        No experiments run yet
                      </div>
                    ) : (
                      selectedScenario.experiments.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-card-border">
                          <div>
                            <div className="text-sm font-medium">{exp.name}</div>
                            <div className="text-xs text-foreground/50">{new Date(exp.startTime).toLocaleString()}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            exp.status === 'running' ? 'bg-blue-400/10 text-blue-400' : 'bg-success/10 text-success'
                          }`}>
                            {exp.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="bg-background/50 rounded-xl p-5 border border-card-border col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-warning">
                      <Zap className="w-4 h-4" /> Triggers & Steps
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-card-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-mono text-xs text-foreground/60">01</div>
                        <div>
                          <div className="text-sm font-medium">Wait for connection spike</div>
                          <div className="text-xs text-foreground/50">Trigger: Connection Count &gt; 1000</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-foreground/70">
                        Trigger
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-mono text-xs border border-primary/30">02</div>
                        <div>
                          <div className="text-sm font-medium">Inject Latency</div>
                          <div className="text-xs text-foreground/50">Apply 500ms latency to all connections</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400">
                        Duration: 120s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-foreground/40 text-sm">
            Select a scenario to view details
          </div>
        )}
      </div>
    </div>
  );
}
