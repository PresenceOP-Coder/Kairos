import { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Zap, RefreshCw, AlertTriangle } from 'lucide-react';

const mockLatencyData = Array.from({ length: 20 }).map((_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  avg: Math.floor(Math.random() * 50) + 10,
  p99: Math.floor(Math.random() * 200) + 50,
}));

const mockRequestData = Array.from({ length: 20 }).map((_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  total: Math.floor(Math.random() * 500) + 100,
  errors: Math.floor(Math.random() * 20),
}));

export function Metrics() {
  const [timeRange, setTimeRange] = useState('15m');

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-foreground pb-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">System Metrics</h2>
          <p className="text-foreground/80 font-medium">Real-time performance and error tracking across all proxies.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-card border-2 border-foreground p-1 rounded-xl flex items-center text-sm font-bold shadow-[2px_2px_0px_0px_#111]">
            {['5m', '15m', '1h', '24h'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${timeRange === range ? 'bg-foreground text-background' : 'text-foreground/70 hover:bg-foreground/10'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="paper-btn p-3 rounded-xl bg-card border-2 border-foreground text-foreground flex items-center justify-center">
            <RefreshCw className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Proxies', value: '3', icon: Activity },
          { label: 'Avg Latency', value: '42ms', icon: Zap },
          { label: 'P99 Latency', value: '185ms', icon: Zap },
          { label: 'Error Rate', value: '0.4%', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-xl flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center bg-card shadow-[2px_2px_0px_0px_#111]">
              <stat.icon className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-foreground/60 mb-1">{stat.label}</div>
              <div className="text-3xl font-black">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-bold uppercase tracking-wide mb-8 flex items-center gap-3">
            <Zap className="w-5 h-5 stroke-[2.5]" /> Latency (ms)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111111" opacity={0.1} vertical={false} />
                <XAxis dataKey="time" stroke="#111111" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 2 }} />
                <YAxis stroke="#111111" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)', borderWidth: 2, borderRadius: '12px', fontWeight: 'bold' }}
                />
                <Line type="step" dataKey="avg" name="Avg Latency" stroke="#111111" strokeWidth={3} dot={false} />
                <Line type="step" dataKey="p99" name="P99 Latency" stroke="#111111" strokeDasharray="5 5" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-bold uppercase tracking-wide mb-8 flex items-center gap-3">
            <Activity className="w-5 h-5 stroke-[2.5]" /> Requests & Errors
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRequestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111111" opacity={0.1} vertical={false} />
                <XAxis dataKey="time" stroke="#111111" fontSize={12} fontWeight="bold" tickLine={false} axisLine={{ strokeWidth: 2 }} />
                <YAxis stroke="#111111" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)', borderWidth: 2, borderRadius: '12px', fontWeight: 'bold' }}
                />
                <Area type="step" dataKey="total" name="Total Requests" stroke="#111111" strokeWidth={3} fill="#111111" fillOpacity={0.05} />
                <Area type="step" dataKey="errors" name="Errors" stroke="#111111" strokeWidth={3} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
