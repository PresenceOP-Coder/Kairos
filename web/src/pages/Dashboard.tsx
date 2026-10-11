import { useState, useEffect, useRef } from 'react';
import { Network, Activity, ArrowDownUp, ShieldCheck, Terminal, Trash2 } from 'lucide-react';
import { useSystemHealth, useSystemStats, useConnections } from '../hooks/useKairos';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'CHAOS';
  message: string;
}

export function Dashboard() {
  const { health, loading: healthLoading, error: healthError } = useSystemHealth();
  const { stats, loading: statsLoading, error: statsError } = useSystemStats();
  const { connections, loading: connsLoading, error: connsError } = useConnections();

  const isOnline = !healthLoading && !healthError && health.status === 'ok';

  // Live Terminal Log State
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'boot-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Kairos data-plane control listener mounted at 127.0.0.1:8080',
    },
    {
      id: 'boot-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'SUCCESS',
      message: 'TCP proxy active on 0.0.0.0:9000 -> target 127.0.0.1:9001',
    },
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);
  const prevConnectionsRef = useRef<number>(0);
  const prevBytesRef = useRef<number>(0);

  // Monitor live events and append to terminal
  useEffect(() => {
    if (stats.active_connections !== prevConnectionsRef.current) {
      const now = new Date().toLocaleTimeString();
      const count = stats.active_connections || 0;
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: `conn-${Date.now()}`,
          timestamp: now,
          level: count > prevConnectionsRef.current ? 'INFO' : 'WARN',
          message: `Active connections updated: ${count} sessions`,
        },
      ]);
      prevConnectionsRef.current = count;
    }
  }, [stats.active_connections]);

  useEffect(() => {
    const totalBytes = (stats.bytes_sent || 0) + (stats.bytes_received || 0);
    if (totalBytes !== prevBytesRef.current && prevBytesRef.current !== 0) {
      const now = new Date().toLocaleTimeString();
      setLogs((prev) => [
        ...prev.slice(-49),
        {
          id: `data-${Date.now()}`,
          timestamp: now,
          level: 'INFO',
          message: `Telemetry relay: TX ${(stats.bytes_sent / 1024).toFixed(1)} KB | RX ${(stats.bytes_received / 1024).toFixed(1)} KB`,
        },
      ]);
    }
    prevBytesRef.current = totalBytes;
  }, [stats.bytes_sent, stats.bytes_received]);

  const clearLogs = () => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'INFO',
        message: 'Console buffer cleared by user action.',
      },
    ]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0.00 MB';
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'INFO': return 'text-[#00D9FF]';
      case 'SUCCESS': return 'text-[#39FF88]';
      case 'WARN': return 'text-[#FFB454]';
      case 'ERROR': return 'text-[#FF5C6C]';
      case 'CHAOS': return 'text-[#B388FF]';
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span>SYSTEM</span>
            <span>//</span>
            <span className="text-[#39FF88]">TELEMETRY_DASHBOARD</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">System Overview</h2>
        </div>

        {/* System Online / Status Badge */}
        <div className={`px-3 py-1.5 border text-xs font-semibold flex items-center gap-2 select-none ${
          healthLoading ? 'bg-[#0D1117] text-[#8B949E] border-[#21262D]' :
          healthError ? 'bg-[#FF5C6C]/10 text-[#FF5C6C] border-[#FF5C6C]/40' :
          isOnline ? 'bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/40' :
          'bg-[#FF5C6C]/10 text-[#FF5C6C] border-[#FF5C6C]/40'
        }`}>
          {!healthLoading && !healthError && (
            <span className="relative flex h-2 w-2">
              {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
            </span>
          )}
          <span>
            {healthLoading ? 'Checking system...' :
             healthError ? 'System Unreachable' :
             isOnline ? 'System Online' : 'System Offline'}
          </span>
        </div>
      </div>

      {/* KPI Monospace Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Active Proxies',
            value: statsLoading ? '-' : statsError ? 'Err' : (stats.active_proxies ?? 1),
            icon: ShieldCheck,
            accent: 'text-[#39FF88]',
            border: 'border-[#39FF88]/30',
            sub: 'PORT :9000 TCP',
          },
          {
            label: 'Active Connections',
            value: statsLoading ? '-' : statsError ? 'Err' : stats.active_connections,
            icon: Network,
            accent: 'text-[#00D9FF]',
            border: 'border-[#00D9FF]/30',
            sub: 'LIVE STREAMS',
          },
          {
            label: 'Bytes Transferred',
            value: statsLoading ? '-' : statsError ? 'Err' : formatBytes(stats.bytes_sent + stats.bytes_received),
            icon: ArrowDownUp,
            accent: 'text-[#B388FF]',
            border: 'border-[#B388FF]/30',
            sub: `SENT ${formatBytes(stats.bytes_sent)}`,
          },
          {
            label: 'Failed Connections',
            value: statsLoading ? '-' : statsError ? 'Err' : '0',
            icon: Activity,
            accent: 'text-[#FF5C6C]',
            border: 'border-[#FF5C6C]/30',
            sub: 'REJECT / DROP',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-[#0D1117] border border-[#21262D] p-4 flex flex-col justify-between hover:border-[#39FF88]/40 transition-colors relative overflow-hidden`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">{stat.label}</span>
                <span className="text-2xl font-bold tracking-tight text-[#E6EDF3] mt-1 block">{stat.value}</span>
              </div>
              <div className={`p-2 bg-[#161B22] border border-[#21262D] ${stat.accent}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#161B22] flex items-center justify-between text-[10px] text-[#8B949E]">
              <span>STATUS:</span>
              <span className="font-semibold text-[#E6EDF3]">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Terminal Console (root@kairos:~# live-monitor) */}
      <div className="bg-[#080B10] border border-[#21262D] shadow-2xl">
        {/* Terminal Title Bar */}
        <div className="bg-[#0D1117] border-b border-[#21262D] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#39FF88]" />
            <span className="text-xs font-bold text-[#E6EDF3]">root@kairos:~# live-monitor</span>
            <span className="text-[10px] text-[#8B949E] hidden sm:inline">[EVENT_STREAM: ACTIVE]</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              title="Clear Console Buffer"
              className="px-2 py-0.5 border border-[#21262D] hover:border-[#FF5C6C] text-[#8B949E] hover:text-[#FF5C6C] text-[11px] flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>CLEAR</span>
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className="p-4 h-44 overflow-y-auto space-y-1.5 text-xs text-[#E6EDF3] bg-[#080B10]/95 font-mono select-text">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[#8B949E] text-[11px] shrink-0">[{log.timestamp}]</span>
              <span className={`font-bold shrink-0 ${getLevelColor(log.level)}`}>
                [{log.level}]
              </span>
              <span className="text-[#E6EDF3] break-all">{log.message}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-[#39FF88] pt-1">
            <span>root@kairos:~#</span>
            <span className="w-2 h-4 bg-[#39FF88] inline-block animate-pulse" />
          </div>
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Connection Monitoring Table */}
      <div className="bg-[#0D1117] border border-[#21262D] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#21262D] bg-[#161B22] flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#E6EDF3] flex items-center gap-2">
            <Network className="w-4 h-4 text-[#00D9FF]" />
            <span>Live TCP Connections</span>
          </h3>
          <span className="text-[11px] text-[#8B949E]">
            ACTIVE: <span className="text-[#39FF88] font-bold">{connections.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-[#8B949E] uppercase bg-[#0D1117] border-b border-[#21262D]">
              <tr>
                <th className="px-4 py-2.5 font-bold">ID</th>
                <th className="px-4 py-2.5 font-bold">Client</th>
                <th className="px-4 py-2.5 font-bold">Target</th>
                <th className="px-4 py-2.5 font-bold">Uptime</th>
                <th className="px-4 py-2.5 font-bold text-right">Sent / Recv</th>
                <th className="px-4 py-2.5 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D] bg-[#080B10]">
              {connsLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8B949E]">
                    Loading connections...
                  </td>
                </tr>
              ) : connsError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#FF5C6C]">
                    Failed to load connections.
                  </td>
                </tr>
              ) : connections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8B949E] italic">
                    No active connections
                  </td>
                </tr>
              ) : (
                connections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-[#161B22]/50 transition-colors">
                    <td className="px-4 py-3 text-[#39FF88] font-bold">{conn.id}</td>
                    <td className="px-4 py-3 text-[#E6EDF3]">{conn.clientAddr}</td>
                    <td className="px-4 py-3 text-[#00D9FF]">{conn.targetAddr}</td>
                    <td className="px-4 py-3 text-[#8B949E]">{conn.uptime}</td>
                    <td className="px-4 py-3 text-right text-[#E6EDF3]">
                      {(conn.bytesSent / 1024).toFixed(1)}KB / {(conn.bytesReceived / 1024).toFixed(1)}KB
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88]">
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
