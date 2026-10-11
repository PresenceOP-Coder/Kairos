import { useState } from 'react';
import { Plus, Play, MoreVertical, FileJson, Clock, Zap, Terminal, ShieldAlert, ChevronRight } from 'lucide-react';
import type { Scenario } from '../types';
import { useScenarios } from '../hooks/useKairos';

export function Scenarios() {
  const { scenarios, loading, error } = useScenarios();
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  return (
    <div className="space-y-4 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span>PLAYBOOKS</span>
            <span>//</span>
            <span className="text-[#39FF88]">CHAOS_RECIPES</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">Scenarios</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-[#0D1117] border border-[#21262D] text-xs text-[#8B949E] hidden sm:flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#39FF88]" />
            <span>$ kairos scenarios list</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39FF88]/10 text-[#39FF88] border border-[#39FF88]/40 hover:bg-[#39FF88]/20 text-xs font-bold transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>NEW_SCENARIO</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-14rem)] gap-4">
        {/* Left Sidebar - Scenario List */}
        <div className="w-full md:w-80 border border-[#21262D] bg-[#0D1117] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#21262D] bg-[#080B10] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B949E]">
              LOCAL_RECIPES ({scenarios.length})
            </span>
            <span className="text-[10px] text-[#39FF88] font-bold">READY</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#21262D]">
            {loading ? (
              <div className="text-center p-6 text-[#8B949E] text-xs">Loading scenarios...</div>
            ) : error ? (
              <div className="text-center p-6 text-[#FF5C6C] text-xs">Failed to load scenarios</div>
            ) : scenarios.length === 0 ? (
              <div className="text-center p-6 text-[#8B949E] text-xs italic">No scenarios found</div>
            ) : (
              scenarios.map(scenario => {
                const isSelected = selectedScenario?.id === scenario.id;
                return (
                  <div 
                    key={scenario.id} 
                    onClick={() => setSelectedScenario(scenario)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-[#161B22] border-l-2 border-l-[#39FF88]' 
                        : 'bg-[#0D1117] hover:bg-[#161B22]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isSelected ? 'text-[#39FF88] rotate-90' : 'text-[#8B949E]'}`} />
                          <h3 className={`font-bold text-xs truncate ${isSelected ? 'text-[#39FF88]' : 'text-[#E6EDF3]'}`}>
                            {scenario.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#8B949E] mt-1 line-clamp-2 pl-5">
                          {scenario.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Details Panel */}
        <div className="flex-1 border border-[#21262D] bg-[#0D1117] flex flex-col">
          {selectedScenario ? (
            <>
              {/* Scenario Detail Header */}
              <div className="p-4 border-b border-[#21262D] bg-[#080B10] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88] font-bold">
                      SPEC // {selectedScenario.id || 'SCEN-01'}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-[#E6EDF3] mt-1">{selectedScenario.name}</h2>
                  <p className="text-[#8B949E] text-xs mt-0.5">{selectedScenario.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-[#39FF88] text-[#080B10] hover:bg-[#39FF88]/90 text-xs font-bold transition-colors shadow-[0_0_15px_rgba(57,255,136,0.2)]">
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Now
                  </button>
                  <button className="p-2 border border-[#21262D] bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Contents */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* YAML Config Box */}
                  <div className="bg-[#080B10] border border-[#21262D] p-4">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#21262D]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#00D9FF]">
                        <FileJson className="w-4 h-4" /> Configuration
                      </div>
                      <span className="text-[10px] text-[#8B949E]">manifest.yaml</span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] mb-2">YAML/JSON definition of faults</div>
                    <pre className="p-3 bg-[#0D1117] border border-[#21262D] text-xs font-mono text-[#39FF88] overflow-x-auto leading-relaxed">
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

                  {/* Execution History */}
                  <div className="bg-[#080B10] border border-[#21262D] p-4">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#21262D]">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#B388FF]">
                        <Clock className="w-4 h-4" /> Experiment History
                      </div>
                      <span className="text-[10px] text-[#8B949E]">PAST_RUNS</span>
                    </div>
                    <div className="text-[10px] text-[#8B949E] mb-3">Past executions of this scenario</div>
                    <div className="space-y-2">
                      {selectedScenario.experiments.length === 0 ? (
                        <div className="text-xs text-[#8B949E] italic flex items-center justify-center h-28 border border-dashed border-[#21262D] bg-[#0D1117]">
                          No experiments run yet
                        </div>
                      ) : (
                        selectedScenario.experiments.map(exp => (
                          <div key={exp.id} className="flex items-center justify-between p-2.5 bg-[#0D1117] border border-[#21262D] text-xs">
                            <div>
                              <div className="font-bold text-[#E6EDF3]">{exp.name}</div>
                              <div className="text-[10px] text-[#8B949E] mt-0.5">{new Date(exp.startTime).toLocaleString()}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                              exp.status === 'running' 
                                ? 'border-[#00D9FF]/40 bg-[#00D9FF]/10 text-[#00D9FF]' 
                                : 'border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88]'
                            }`}>
                              {exp.status.toUpperCase()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Triggers & Execution Steps */}
                <div className="bg-[#080B10] border border-[#21262D] p-4">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#21262D]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#FFB454]">
                      <Zap className="w-4 h-4" /> Triggers & Steps
                    </div>
                    <span className="text-[10px] text-[#8B949E]">PIPELINE_ORCHESTRATOR</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3 bg-[#0D1117] border border-[#21262D]">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 border border-[#21262D] bg-[#161B22] flex items-center justify-center text-[10px] font-bold text-[#8B949E]">
                          01
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#E6EDF3]">Wait for connection spike</div>
                          <div className="text-[10px] text-[#8B949E] mt-0.5">Trigger: Connection Count &gt; 1000</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-[#21262D] bg-[#161B22] text-[#8B949E]">
                        TRIGGER
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0D1117] border border-[#39FF88]/40">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 border border-[#39FF88]/40 bg-[#39FF88]/10 flex items-center justify-center text-[10px] font-bold text-[#39FF88]">
                          02
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#E6EDF3]">Inject Latency</div>
                          <div className="text-[10px] text-[#8B949E] mt-0.5">Apply 500ms latency to all connections</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold border border-[#00D9FF]/40 bg-[#00D9FF]/10 text-[#00D9FF]">
                        Duration: 120s
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safety Pre-flight Banner */}
                <div className="p-3 bg-[#FFB454]/5 border border-[#FFB454]/30 flex items-center gap-3 text-xs text-[#FFB454]">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>PRE-FLIGHT NOTICE: Running this scenario applies live chaos across active TCP connections on target port :9000.</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8B949E]">
              <Terminal className="w-8 h-8 text-[#21262D] mb-3" />
              <p className="text-xs">Select a scenario to view details</p>
              <p className="text-[10px] text-[#8B949E]/60 mt-1">Or click NEW_SCENARIO to create a declarative fault injection playbook</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
