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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Experiment Timeline</h2>
          <p className="text-foreground/60 text-sm mt-1">Track past, ongoing, and upcoming chaos experiments.</p>
        </div>
        <div className="bg-secondary border border-card-border p-1 rounded-lg flex items-center text-sm font-medium">
          {['all', 'running', 'scheduled', 'completed'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 rounded-md transition-colors capitalize ${filter === f ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:text-foreground'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border-l border-card-border ml-4 md:ml-6 space-y-8 py-4">
        {filteredExperiments.length === 0 ? (
          <div className="pl-8 text-foreground/40 text-sm italic">No experiments found.</div>
        ) : (
          filteredExperiments.map((exp) => {
            const isRunning = exp.status === 'running';
            const isCompleted = exp.status === 'completed';
            const isScheduled = exp.status === 'scheduled';
            
            return (
              <div key={exp.id} className="relative pl-8 md:pl-10 group">
                {/* Timeline Node */}
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center
                  ${isRunning ? 'bg-blue-500 text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                    isCompleted ? 'bg-success text-white' : 'bg-card border-card-border text-foreground/40'}`}
                >
                  {isRunning && <PlayCircle className="w-4 h-4" />}
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {isScheduled && <Clock className="w-4 h-4" />}
                </div>

                {/* Content Card */}
                <div className={`glass-panel p-5 transition-all duration-300 border ${
                  isRunning ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'hover:border-primary/30'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                          ${isRunning ? 'bg-blue-500/10 text-blue-400' : 
                            isCompleted ? 'bg-success/10 text-success' : 'bg-foreground/10 text-foreground/60'}`}
                        >
                          {exp.status}
                        </span>
                        <h3 className="font-semibold text-lg">{exp.name}</h3>
                      </div>
                      <div className="text-sm text-foreground/60 flex items-center gap-2 mt-2">
                        <CalendarClock className="w-4 h-4" />
                        {new Date(exp.startTime).toLocaleString()} 
                        {exp.endTime && ` — ${new Date(exp.endTime).toLocaleTimeString()}`}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2">
                      <div className="text-xs font-medium text-foreground/50">Target Proxies</div>
                      <div className="flex flex-wrap gap-1">
                        {exp.targetProxyIds.map(id => (
                          <span key={id} className="bg-background border border-card-border px-2 py-1 rounded text-xs font-mono text-primary/80">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-card-border">
                    <div className="text-xs font-medium text-foreground/50 mb-2">Injected Faults</div>
                    <div className="flex flex-wrap gap-2">
                      {exp.faults.map((fault, i) => (
                        <div key={i} className="bg-background rounded-lg p-2 px-3 border border-card-border text-xs flex items-center gap-2">
                          <span className="font-semibold capitalize text-foreground/80">{fault.type}</span>
                          <span className="text-foreground/40">|</span>
                          <span className="font-mono text-primary/70">{fault.percentage}%</span>
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
