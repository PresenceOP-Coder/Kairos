import { Activity, Network, ArrowDownUp, ShieldCheck } from 'lucide-react';
import { useSystemHealth, useSystemStats, useConnections } from '../hooks/useKairos';

export function Dashboard() {
  const health = useSystemHealth();
  const stats = useSystemStats();
  const connections = useConnections();

  const isOnline = health.status === 'ok';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Overview</h2>
          <p className="text-foreground/60 text-sm mt-1">High-level health and TCP connection monitoring.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium ${
          isOnline ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'
        }`}>
          <span className="relative flex h-2 w-2">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>}
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          {isOnline ? 'System Online' : 'System Offline'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Proxies', value: stats.active_proxies || 0, icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Connections', value: stats.active_connections || 0, icon: Network, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Bytes Transferred', value: `${((stats.bytes_sent + stats.bytes_received) / 1024 / 1024).toFixed(2)} MB`, icon: ArrowDownUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Failed Connections', value: '0', icon: Activity, color: 'text-destructive', bg: 'bg-destructive/10' }, // Missing in Go API currently
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

      {/* Connection Monitoring */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-5 border-b border-card-border flex items-center justify-between bg-card/50">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" /> Live TCP Connections
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground/60 uppercase bg-card/80 border-b border-card-border">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">Uptime</th>
                <th className="px-6 py-3 font-medium text-right">Sent / Recv</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border bg-background/50">
              {connections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground/40 italic">
                    No active connections
                  </td>
                </tr>
              ) : (
                connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-card/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-primary/80">{conn.id}</td>
                    <td className="px-6 py-4 font-mono">{conn.clientAddr}</td>
                    <td className="px-6 py-4 font-mono">{conn.targetAddr}</td>
                    <td className="px-6 py-4">{conn.uptime}</td>
                    <td className="px-6 py-4 font-mono text-right text-foreground/70">
                      {(conn.bytesSent / 1024).toFixed(1)}KB / {(conn.bytesReceived / 1024).toFixed(1)}KB
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        conn.status === 'active' ? 'bg-success/10 text-success' : 'bg-foreground/10 text-foreground/50'
                      }`}>
                        {conn.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
