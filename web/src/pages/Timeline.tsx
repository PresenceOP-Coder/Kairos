import { useState } from 'react';
import { CalendarClock, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import type { Experiment } from '../types';

const mockExperiments: Experiment[] = [
  {
    id: 'exp-1',
    name: 'DB Latency Spike (Peak Hours)',
    status: 'scheduled',
    targetProxyIds: ['proxy-db'],
    faults: [{ type: 'latency', percentage: 100, delayMs: 200 }],
    startTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // in 1 hour
    endTime: new Date(Date.now() + 1000 * 60 * 65).toISOString(),
  },
  {
    id: 'exp-2',
    name: 'Payment Gateway Aborts',
    status: 'running',
    targetProxyIds: ['proxy-payments'],
    faults: [{ type: 'abort', percentage: 5, httpStatus: 503 }],
    startTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // started 10m ago
    endTime: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'exp-3',
    name: 'Search Service Throttling',
    status: 'completed',
    targetProxyIds: ['proxy-search'],
    faults: [{ type: 'bandwidth', percentage: 100, rateLimitBytesPerSec: 10240 }],
    startTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  }
];

export function Timeline() {
  const [filter, setFilter] = useState<'all' | 'running' | 'scheduled' | 'completed'>('all');

  const filteredExperiments = filter === 'all' 
    ? mockExperiments 
    : mockExperiments.filter(e => e.status === filter);

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">Experiment Timeline</h2>
          <p className="text-foreground/80 font-medium">Track past, ongoing, and upcoming chaos experiments.</p>
        </div>
        <div className="bg-card border-2 border-foreground p-1 rounded-xl flex items-center text-sm font-bold shadow-[2px_2px_0px_0px_#111]">
          {['all', 'running', 'scheduled', 'completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${filter === f ? 'bg-foreground text-background' : 'text-foreground/70 hover:bg-foreground/10'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-l-4 border-foreground ml-4 md:ml-6 space-y-10 py-4">
        {filteredExperiments.length === 0 ? (
          <div className="pl-10 text-foreground/60 font-medium italic">No experiments found.</div>
        ) : (
          filteredExperiments.map((exp) => {
            const isRunning = exp.status === 'running';
            const isCompleted = exp.status === 'completed';
            const isScheduled = exp.status === 'scheduled';
            
            return (
              <div key={exp.id} className="relative pl-10 group">
                {/* Timeline Node */}
                <div className={`absolute -left-[19px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center
                  ${isRunning ? 'bg-[#c6c9df] text-[#373e80] shadow-[0_0_0_2px_#373e80]' : 
                    isCompleted ? 'bg-[#c6dfcd] text-[#378051] shadow-[0_0_0_2px_#378051]' : 'bg-card text-foreground shadow-[0_0_0_2px_#111]'}`}
                >
                  {isRunning && <PlayCircle className="w-5 h-5 fill-current stroke-current" />}
                  {isCompleted && <CheckCircle2 className="w-5 h-5 fill-current stroke-current" />}
                  {isScheduled && <Clock className="w-5 h-5 stroke-[3]" />}
                </div>

                {/* Content Card */}
                <div className="glass-panel p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border-2
                          ${isRunning ? 'bg-[#c6c9df] text-[#373e80] border-[#373e80]' : 
                            isCompleted ? 'bg-[#c6dfcd] text-[#378051] border-[#378051]' : 'bg-card text-foreground border-foreground'}`}
                        >
                          {exp.status}
                        </span>
                        <h3 className="font-bold text-xl">{exp.name}</h3>
                      </div>
                      <div className="text-sm font-bold font-mono tracking-wide text-foreground/70 flex items-center gap-2 mt-3 bg-background p-2 rounded-lg border-2 border-card-border/30 w-max">
                        <CalendarClock className="w-4 h-4 stroke-[2.5]" />
                        {new Date(exp.startTime).toLocaleString()} 
                        {exp.endTime && ` — ${new Date(exp.endTime).toLocaleTimeString()}`}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="text-xs font-bold uppercase tracking-widest text-foreground/60">Target Proxies</div>
                      <div className="flex flex-wrap gap-2">
                        {exp.targetProxyIds.map(id => (
                          <span key={id} className="bg-card border-2 border-foreground px-3 py-1.5 rounded-lg text-sm font-mono font-bold">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-card-border">
                    <div className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-3">Injected Faults</div>
                    <div className="flex flex-wrap gap-3">
                      {exp.faults.map((fault, i) => (
                        <div key={i} className="bg-background rounded-xl p-3 px-4 border-2 border-card-border text-sm flex items-center gap-3 shadow-[2px_2px_0px_0px_#111]">
                          <span className="font-bold uppercase tracking-wider">{fault.type}</span>
                          <span className="text-foreground/30 font-black">|</span>
                          <span className="font-mono font-bold text-foreground/80">{fault.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
