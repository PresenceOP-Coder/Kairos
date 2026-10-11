import { useState } from 'react';
import { CalendarClock, CheckCircle2, PlayCircle, Clock, Zap, Terminal } from 'lucide-react';
import { useExperiments } from '../hooks/useKairos';

export function Experiments() {
  const { experiments: liveExperiments, loading, error } = useExperiments();
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled' | 'completed'>('all');

  const filteredExperiments = filter === 'all' 
    ? liveExperiments 
    : liveExperiments.filter(e => e.status === filter);

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span>AUDIT_LOG</span>
            <span>//</span>
            <span className="text-[#39FF88]">EXECUTION_TRACES</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">Experiment Timeline</h2>
          <p className="text-[#8B949E] text-xs mt-0.5">Track past, ongoing, and upcoming chaos experiments.</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-[#080B10] border border-[#21262D] p-1 flex items-center text-xs">
            {['all', 'running', 'scheduled', 'completed'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1 font-bold transition-colors ${
                  filter === f 
                    ? 'bg-[#161B22] text-[#39FF88] border border-[#39FF88]/40 shadow-sm' 
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Command Trace Bar */}
      <div className="bg-[#080B10] border border-[#21262D] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#E6EDF3]">
          <Terminal className="w-3.5 h-3.5 text-[#39FF88]" />
          <span className="text-[#00D9FF]">root@kairos:~#</span>
          <span className="text-[#8B949E]">kairos experiments --filter={filter}</span>
        </div>
        <div className="text-[10px] text-[#8B949E]">
          TOTAL_RECORDS: <span className="text-[#39FF88] font-bold">{filteredExperiments.length}</span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l border-[#21262D] ml-4 md:ml-6 space-y-6 py-2">
        {loading ? (
          <div className="pl-8 text-[#8B949E] text-xs">Loading experiments...</div>
        ) : error ? (
          <div className="pl-8 text-[#FF5C6C] text-xs">Failed to load experiments</div>
        ) : filteredExperiments.length === 0 ? (
          <div className="pl-8 text-[#8B949E] text-xs italic">No experiments found.</div>
        ) : (
          filteredExperiments.map((exp) => {
            const isRunning = exp.status === 'running';
            const isCompleted = exp.status === 'completed';
            const isScheduled = exp.status === 'scheduled';
            
            return (
              <div key={exp.id} className="relative pl-8 md:pl-10 group">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1.5 w-8 h-8 border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isRunning ? 'bg-[#080B10] border-[#00D9FF] text-[#00D9FF] shadow-[0_0_12px_rgba(0,217,255,0.4)] animate-pulse' : 
                  isCompleted ? 'bg-[#080B10] border-[#39FF88] text-[#39FF88]' : 
                  'bg-[#080B10] border-[#21262D] text-[#8B949E]'
                }`}>
                  {isRunning && <PlayCircle className="w-4 h-4" />}
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {isScheduled && <Clock className="w-4 h-4" />}
                </div>

                {/* Content Card */}
                <div className={`bg-[#0D1117] border p-5 transition-all ${
                  isRunning 
                    ? 'border-[#00D9FF]/50 shadow-[0_0_20px_rgba(0,217,255,0.06)]' 
                    : 'border-[#21262D] hover:border-[#39FF88]/30'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                          isRunning ? 'bg-[#00D9FF]/10 text-[#00D9FF] border-[#00D9FF]/40' : 
                          isCompleted ? 'bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/40' : 
                          'bg-[#161B22] text-[#8B949E] border-[#21262D]'
                        }`}>
                          {exp.status}
                        </span>
                        <h3 className="font-bold text-sm text-[#E6EDF3]">{exp.name}</h3>
                      </div>
                      <div className="text-xs text-[#8B949E] flex items-center gap-2 mt-2">
                        <CalendarClock className="w-3.5 h-3.5 text-[#39FF88]" />
                        <span>{new Date(exp.startTime).toLocaleString()}</span>
                        {exp.endTime && (
                          <>
                            <span className="text-[#21262D]">|</span>
                            <span>{new Date(exp.endTime).toLocaleTimeString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-1.5">
                      <div className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider">Target Proxies</div>
                      <div className="flex flex-wrap gap-1">
                        {exp.targetProxyIds.map(id => (
                          <span key={id} className="bg-[#080B10] border border-[#21262D] px-2 py-0.5 text-xs text-[#00D9FF]">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Injected Faults */}
                  <div className="mt-4 pt-3 border-t border-[#161B22]">
                    <div className="text-[10px] font-bold text-[#8B949E] uppercase tracking-wider mb-2">Injected Faults</div>
                    <div className="flex flex-wrap gap-2">
                      {exp.faults.map((fault, i) => (
                        <div key={i} className="bg-[#080B10] border border-[#21262D] px-2.5 py-1 text-xs flex items-center gap-2">
                          <span className="font-bold text-[#E6EDF3] capitalize">{fault.type}</span>
                          <span className="text-[#21262D]">|</span>
                          <span className="text-[#39FF88] font-bold">{fault.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {isRunning && (
                    <div className="mt-4 pt-3 border-t border-[#161B22] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-[#8B949E]">Current Step:</span>
                         <span className="font-bold text-[#00D9FF]">Step 2: Database Latency</span>
                      </div>
                      <div className="text-[11px] text-[#8B949E]">
                        Remaining: <span className="text-[#39FF88] font-bold">1m 45s</span>
                      </div>
                    </div>
                  )}
                  
                  {isScheduled && (
                    <div className="mt-4 pt-3 border-t border-[#161B22] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#FFB454]">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">Waiting for Trigger</span>
                      </div>
                      <div className="text-[11px] text-[#8B949E]">
                        Condition: HTTP 500 &gt; 5%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
