import { useState } from 'react';
import { Layers, Plus, Play, MoreVertical, FileJson, Clock } from 'lucide-react';
import { Scenario } from '../types';

const mockScenarios: Scenario[] = [
  {
    id: 'scen-1',
    name: 'High Latency Spike',
    description: 'Simulates a sudden 500ms latency spike across all active proxies for 2 minutes.',
    experiments: [
      { id: 'exp-1', name: 'Latency Injection', status: 'completed', targetProxyIds: ['proxy-1'], faults: [], startTime: '2023-10-01T10:00:00Z' }
    ]
  },
  {
    id: 'scen-2',
    name: 'Database Failover',
    description: 'Injects 100% connection aborts to the database proxy to trigger and test failover mechanisms.',
    experiments: [
      { id: 'exp-2', name: 'DB Abort', status: 'running', targetProxyIds: ['proxy-2'], faults: [], startTime: '2023-10-01T10:15:00Z' }
    ]
  },
  {
    id: 'scen-3',
    name: 'Slow Client (Throttling)',
    description: 'Throttles bandwidth to 50KB/s for 5 minutes to simulate poor network conditions.',
    experiments: []
  }
];

export function Scenarios() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(mockScenarios[0]);

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Scenario List */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Scenarios</h2>
          <button className="p-2 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {mockScenarios.map(scenario => (
            <div 
              key={scenario.id} 
              onClick={() => setSelectedScenario(scenario)}
              className={`glass-panel p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                selectedScenario?.id === scenario.id 
                  ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                  : 'border-card-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{scenario.name}</h3>
                <Layers className={`w-4 h-4 ${selectedScenario?.id === scenario.id ? 'text-primary' : 'text-foreground/40'}`} />
              </div>
              <p className="text-xs text-foreground/60 line-clamp-2">{scenario.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Details */}
      <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden border border-card-border">
        {selectedScenario ? (
          <>
            <div className="p-6 border-b border-card-border bg-card/30 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">{selectedScenario.name}</h2>
                <p className="text-foreground/70 text-sm max-w-2xl">{selectedScenario.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-lg text-sm font-medium transition-colors">
                  <Play className="w-4 h-4 fill-current" /> Run Now
                </button>
                <button className="p-2 rounded-lg border border-card-border hover:bg-card-border/50 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-background rounded-xl p-4 border border-card-border">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <FileJson className="w-4 h-4 text-primary" /> Configuration
                  </div>
                  <div className="text-xs text-foreground/50">YAML/JSON definition of faults</div>
                  <pre className="mt-4 p-3 bg-card rounded-lg text-xs font-mono text-foreground/80 overflow-x-auto border border-card-border/50">
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
                
                <div className="bg-background rounded-xl p-4 border border-card-border">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Clock className="w-4 h-4 text-blue-400" /> Experiment History
                  </div>
                  <div className="text-xs text-foreground/50">Past executions of this scenario</div>
                  <div className="mt-4 space-y-3">
                    {selectedScenario.experiments.length === 0 ? (
                      <div className="text-sm text-foreground/40 italic flex items-center justify-center h-20 border border-dashed border-card-border rounded-lg">
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
