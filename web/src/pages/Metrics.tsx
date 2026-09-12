import { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Zap, RefreshCw, Network, ArrowDownUp, AlertTriangle } from 'lucide-react';

const mockLatencyData = Array.from({ length: 20 }).map((_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  avg: Math.floor(Math.random() * 50) + 10,
  p99: Math.floor(Math.random() * 200) + 50,
}));

const mockConnectionData = Array.from({ length: 20 }).map((_, i) => ({
  time: `10:${i.toString().padStart(2, '0')}`,
  active: Math.floor(Math.random() * 100) + 20,
  failed: Math.floor(Math.random() * 5),
}));

export function Metrics() {
  const [timeRange, setTimeRange] = useState('15m');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Metrics</h2>
          <p className="text-foreground/60 text-sm mt-1">Real-time TCP performance and error tracking across all proxies.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-secondary border border-card-border p-1 rounded-lg flex items-center text-sm font-medium">
            {['5m', '15m', '1h', '24h'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md transition-colors ${timeRange === range ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:text-foreground'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-2 rounded-lg border border-card-border bg-card hover:bg-secondary transition-colors">
            <RefreshCw className="w-4 h-4 text-foreground/70" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Connections', value: '112', icon: Network, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Throughput', value: '45 MB/s', icon: ArrowDownUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Avg Latency', value: '42ms', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Packet Loss', value: '0.1%', icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-5 rounded-xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-foreground/60 font-medium">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Latency (ms)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                />
                <Line type="monotone" dataKey="avg" name="Avg Latency" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p99" name="P99 Latency" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" /> Active Connections & Failures
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockConnectionData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-card-border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="active" name="Active Conns" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="failed" name="Failed Conns" stroke="#ef4444" fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
