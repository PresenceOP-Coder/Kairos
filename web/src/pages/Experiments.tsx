import { CalendarClock, PlayCircle, Clock, CheckCircle2, CircleDashed, StopCircle } from 'lucide-react';
import { useCurrentScenario } from '../hooks/useKairos';

export function Experiments() {
  const { scenario, loading } = useCurrentScenario();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Experiment Timeline</h2>
          <p className="text-foreground/60 text-sm mt-1">Live execution tracking for the currently loaded scenario.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 bg-card border border-card-border rounded-lg">
          <Clock className="w-4 h-4 text-primary" />
          <span>T+00:00</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgydjJIMUMxeiIgZmlsbD0icmdiYSgyNTUsIDI1NSLCAyNTUsIDAuMDUpIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=')] opacity-50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 pb-4 border-b border-card-border">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <CalendarClock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Execution Timeline</h3>
              <p className="text-sm text-foreground/50">Tracking scheduled steps mapped in the scenario YAML.</p>
            </div>
          </div>

          {loading ? (
             <div className="animate-pulse h-32 flex items-center justify-center text-foreground/50">
               Loading timeline...
             </div>
          ) : !scenario || scenario.error || !scenario.steps || scenario.steps.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-foreground/50 italic border border-dashed border-card-border rounded-lg bg-card/20">
               <StopCircle className="w-8 h-8 mb-3 opacity-50" />
               No scheduled steps in the active scenario.
             </div>
          ) : (
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-card-border">
              {/* Start Node */}
              <div className="relative">
                <div className="absolute -left-[37px] top-1 bg-background rounded-full p-1">
                  <PlayCircle className="w-4 h-4 text-success" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">Scenario Started</h4>
                    <div className="text-sm text-foreground/50 mt-1">Global state initialized</div>
                  </div>
                  <span className="text-xs font-mono text-foreground/40 bg-card px-2 py-1 rounded">T+0s</span>
                </div>
              </div>

              {/* Dynamic Steps */}
              {scenario.steps.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[37px] top-1 bg-background rounded-full p-1">
                    <CircleDashed className="w-4 h-4 text-foreground/30 animate-[spin_4s_linear_infinite]" />
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">Execute Step {idx + 1}</h4>
                      <div className="text-sm text-foreground/60 mt-1 flex flex-wrap gap-2">
                        {step.latency?.enabled && (
                          <span className="bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-400/20">Latency: {step.latency.delay_ms}ms</span>
                        )}
                        {step.reset?.enabled && (
                          <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded text-xs border border-destructive/20">Reset Conn</span>
                        )}
                        {step.packet_loss?.enabled && (
                          <span className="bg-orange-400/10 text-orange-400 px-2 py-0.5 rounded text-xs border border-orange-400/20">Drop: {step.packet_loss.percent}%</span>
                        )}
                        {step.blackhole?.enabled && (
                          <span className="bg-gray-400/10 text-gray-400 px-2 py-0.5 rounded text-xs border border-gray-400/20">Blackhole</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20">+{step.after}</span>
                  </div>
                </div>
              ))}

              {/* End Node */}
              <div className="relative opacity-50">
                <div className="absolute -left-[37px] top-1 bg-background rounded-full p-1">
                  <CheckCircle2 className="w-4 h-4 text-foreground/40" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">Scenario Complete</h4>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
