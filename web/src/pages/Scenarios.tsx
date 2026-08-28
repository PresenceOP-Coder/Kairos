import { useState } from 'react';
import { Layers, Plus, Play, MoreVertical, FileJson, Clock } from 'lucide-react';
import type { Scenario } from '../types';

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
    <div className="flex h-[calc(100vh-8rem)] gap-8">
      {/* Scenario List */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Scenarios</h2>
          <button className="paper-btn w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {mockScenarios.map(scenario => (
            <div 
              key={scenario.id} 
              onClick={() => setSelectedScenario(scenario)}
              className={`glass-panel p-5 cursor-pointer transition-all duration-200 ${
                selectedScenario?.id === scenario.id 
                  ? 'bg-foreground text-background shadow-[4px_4px_0px_0px_#111] translate-x-[-2px] translate-y-[-2px]' 
                  : 'bg-card text-foreground hover:shadow-[2px_2px_0px_0px_#111] hover:translate-x-[-1px] hover:translate-y-[-1px]'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-lg">{scenario.name}</h3>
                <Layers className={`w-5 h-5 stroke-[2.5] ${selectedScenario?.id === scenario.id ? 'text-background' : 'text-foreground'}`} />
              </div>
              <p className={`text-sm font-medium line-clamp-2 ${selectedScenario?.id === scenario.id ? 'text-background/80' : 'text-foreground/70'}`}>
                {scenario.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scenario Details */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden bg-card">
        {selectedScenario ? (
          <>
            <div className="p-8 border-b-2 border-card-border bg-background flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase mb-3">{selectedScenario.name}</h2>
                <p className="text-foreground/80 font-medium max-w-2xl">{selectedScenario.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="paper-btn flex items-center gap-2 px-5 py-3 bg-[#c6dfcd] text-[#378051] rounded-xl font-bold uppercase tracking-wider text-sm shadow-[2px_2px_0px_0px_#111]">
                  <Play className="w-5 h-5 fill-current stroke-current" /> RUN NOW
                </button>
                <button className="paper-btn w-12 h-12 flex items-center justify-center rounded-xl bg-card border-2 border-foreground shadow-[2px_2px_0px_0px_#111]">
                  <MoreVertical className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-background rounded-xl p-6 border-2 border-card-border">
                  <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest mb-2">
                    <FileJson className="w-5 h-5 stroke-[2.5]" /> CONFIGURATION
                  </div>
                  <div className="text-sm text-foreground/60 font-medium mb-6">YAML/JSON definition of faults</div>
                  <pre className="p-5 bg-card rounded-xl text-sm font-mono font-medium text-foreground overflow-x-auto border-2 border-card-border">
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
                
                <div className="bg-background rounded-xl p-6 border-2 border-card-border">
                  <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest mb-2">
                    <Clock className="w-5 h-5 stroke-[2.5]" /> EXECUTION LOG
                  </div>
                  <div className="text-sm text-foreground/60 font-medium mb-6">Past executions of this scenario</div>
                  <div className="space-y-4">
                    {selectedScenario.experiments.length === 0 ? (
                      <div className="text-sm text-foreground/60 font-medium flex items-center justify-center h-24 border-2 border-dashed border-card-border/50 rounded-xl bg-card">
                        No experiments run yet
                      </div>
                    ) : (
                      selectedScenario.experiments.map(exp => (
                        <div key={exp.id} className="flex items-center justify-between p-4 bg-card rounded-xl border-2 border-card-border">
                          <div>
                            <div className="text-base font-bold mb-1">{exp.name}</div>
                            <div className="text-xs text-foreground/60 font-mono font-bold uppercase tracking-wider">{new Date(exp.startTime).toLocaleString()}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border-2 ${
                            exp.status === 'running' ? 'bg-[#c6c9df] text-[#373e80] border-[#373e80]' : 'bg-[#c6dfcd] text-[#378051] border-[#378051]'
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
          <div className="flex-1 flex items-center justify-center text-foreground/40 font-bold uppercase tracking-widest">
            Select a scenario to view details
          </div>
        )}
      </div>
    </div>
  );
}
