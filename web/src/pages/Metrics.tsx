import { useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Zap, RefreshCw, Network, ArrowDownUp, AlertTriangle, Terminal } from 'lucide-react';

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
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span>TELEMETRY</span>
            <span>//</span>
            <span className="text-[#39FF88]">STREAM_METRICS</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">System Metrics</h2>
          <p className="text-[#8B949E] text-xs mt-0.5">Real-time TCP performance and error tracking across all proxies.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#080B10] border border-[#21262D] p-1 flex items-center text-xs">
            {['5m', '15m', '1h', '24h'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 font-bold transition-colors ${
                  timeRange === range 
                    ? 'bg-[#161B22] text-[#39FF88] border border-[#39FF88]/40 shadow-sm' 
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            className="p-2 border border-[#21262D] bg-[#0D1117] hover:bg-[#161B22] text-[#8B949E] hover:text-[#39FF88] transition-colors"
            title="Refresh metrics stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Command Status */}
      <div className="bg-[#080B10] border border-[#21262D] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#E6EDF3]">
          <Terminal className="w-3.5 h-3.5 text-[#39FF88]" />
          <span className="text-[#00D9FF]">root@kairos:~#</span>
          <span className="text-[#8B949E]">kairos telemetry stream --interval=1s --range={timeRange}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#39FF88]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
          <span>POLLING_ACTIVE</span>
        </div>
      </div>

      {/* KPI Monospace Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Connections', value: '112', icon: Network, color: 'text-[#00D9FF]', tag: 'CONNS' },
          { label: 'Throughput', value: '45 MB/s', icon: ArrowDownUp, color: 'text-[#39FF88]', tag: 'BANDWIDTH' },
          { label: 'Avg Latency', value: '42ms', icon: Zap, color: 'text-[#FFB454]', tag: 'RTT' },
          { label: 'Packet Loss', value: '0.1%', icon: AlertTriangle, color: 'text-[#FF5C6C]', tag: 'DROPS' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0D1117] border border-[#21262D] p-4 flex flex-col justify-between hover:border-[#39FF88]/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">{stat.label}</span>
                <span className="text-2xl font-bold tracking-tight text-[#E6EDF3] mt-1 block">{stat.value}</span>
              </div>
              <div className={`p-2 bg-[#161B22] border border-[#21262D] ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#161B22] flex items-center justify-between text-[10px] text-[#8B949E]">
              <span>STREAM:</span>
              <span className={`font-bold ${stat.color}`}>[{stat.tag}]</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Chart */}
        <div className="bg-[#0D1117] border border-[#21262D] p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#21262D]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#39FF88]" />
              <span>Latency Distribution (ms)</span>
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-[#00D9FF]">
                <span className="w-2 h-2 bg-[#00D9FF]" /> AVG
              </span>
              <span className="flex items-center gap-1.5 text-[#FFB454]">
                <span className="w-2 h-2 bg-[#FFB454]" /> P99
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockLatencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
                <XAxis dataKey="time" stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#080B10', 
                    borderColor: '#21262D', 
                    borderRadius: '0px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#E6EDF3'
                  }}
                  itemStyle={{ color: '#E6EDF3' }}
                />
                <Line type="monotone" dataKey="avg" name="Avg Latency" stroke="#00D9FF" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p99" name="P99 Latency" stroke="#FFB454" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Connections & Failures Chart */}
        <div className="bg-[#0D1117] border border-[#21262D] p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#21262D]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3] flex items-center gap-2">
              <Network className="w-4 h-4 text-[#00D9FF]" />
              <span>Active Connections &amp; Drops</span>
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1.5 text-[#39FF88]">
                <span className="w-2 h-2 bg-[#39FF88]" /> ACTIVE
              </span>
              <span className="flex items-center gap-1.5 text-[#FF5C6C]">
                <span className="w-2 h-2 bg-[#FF5C6C]" /> DROPPED
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockConnectionData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF88" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#39FF88" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5C6C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF5C6C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
                <XAxis dataKey="time" stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <YAxis stroke="#8B949E" fontSize={11} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#080B10', 
                    borderColor: '#21262D', 
                    borderRadius: '0px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#E6EDF3'
                  }}
                />
                <Area type="monotone" dataKey="active" name="Active Conns" stroke="#39FF88" fillOpacity={1} fill="url(#colorActive)" />
                <Area type="monotone" dataKey="failed" name="Failed Conns" stroke="#FF5C6C" fillOpacity={1} fill="url(#colorFailed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
