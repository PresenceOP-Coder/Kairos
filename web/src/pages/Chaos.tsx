import { useState } from 'react';
import { Play, Square, Activity, Zap, Wifi, RotateCcw, XCircle, FileWarning, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useChaosConfig } from '../hooks/useKairos';
import { apiClient } from '../api/client';
import type { Proxy } from '../types';

export function Chaos() {
  const { config, mutate, loading, error } = useChaosConfig();

  const [localDelayMs, setLocalDelayMs] = useState(0);
  const delayMs = localDelayMs || config?.latency_delay_ms || 0;
  const setDelayMs = (val: number) => setLocalDelayMs(val);

  // Status feedback for terminal commands
  const [cliFeedback, setCliFeedback] = useState<string>('System nominal. Ready for fault injection.');

  // Simulation state for other toxics
  const [jitterEnabled, setJitterEnabled] = useState(false);
  const [jitterMin, setJitterMin] = useState(100);
  const [jitterMax, setJitterMax] = useState(300);

  const [bandwidthEnabled, setBandwidthEnabled] = useState(false);
  const [bandwidthRate, setBandwidthRate] = useState(256);

  const [resetEnabled, setResetEnabled] = useState(false);
  const [resetAfter, setResetAfter] = useState(10);

  const [packetLossEnabled, setPacketLossEnabled] = useState(false);
  const [packetLossPercent, setPacketLossPercent] = useState(20);

  const [blackholeEnabled, setBlackholeEnabled] = useState(false);

  const [proxies, setProxies] = useState<Proxy[]>([
    {
      id: 'proxy-1',
      config: { listenAddr: ':9000', targetUrl: '127.0.0.1:9001' },
      status: 'active',
      activeFaults: [],
    },
    {
      id: 'proxy-db',
      config: { listenAddr: ':5432', targetUrl: 'db.internal:5432' },
      status: 'stopped',
      activeFaults: [],
    },
  ]);

  const toggleProxyStatus = (id: string) => {
    setProxies(
      proxies.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'stopped' : 'active' } : p
      )
    );
  };

  const handleLatencyToggle = async () => {
    if (!config) return;
    const newEnabled = !config.latency_enabled;
    const finalDelay = delayMs || 500;

    try {
      await apiClient.setLatency({
        enabled: newEnabled,
        delay_ms: finalDelay,
      });

      if (newEnabled) {
        setDelayMs(finalDelay);
        setCliFeedback(`[OK] chaos latency --enable --delay ${finalDelay}ms applied`);
      } else {
        setCliFeedback(`[OK] chaos latency --disable applied`);
      }
      await mutate();
    } catch {
      setCliFeedback(`[ERROR] Failed to update latency via control plane`);
    }
  };

  const handleLatencyUpdate = async () => {
    if (!config || !config.latency_enabled) return;
    try {
      await apiClient.setLatency({
        enabled: true,
        delay_ms: delayMs,
      });
      setCliFeedback(`[OK] chaos latency --delay ${delayMs}ms updated successfully`);
      await mutate();
    } catch {
      setCliFeedback(`[ERROR] Failed to update latency delay`);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#21262D]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8B949E]">
            <span>CONTROL_PLANE</span>
            <span>//</span>
            <span className="text-[#39FF88]">FAULT_INJECTION_ENGINE</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#E6EDF3] mt-0.5">Live Chaos Controls</h2>
        </div>

        {/* CLI Prompt Banner */}
        <div className="px-3 py-1.5 bg-[#0D1117] border border-[#21262D] text-xs text-[#E6EDF3] flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#39FF88]" />
          <span className="text-[#8B949E]">CMD:</span>
          <span className="text-[#39FF88] font-bold">
            {config?.latency_enabled ? `chaos latency --delay=${delayMs}ms` : 'chaos --status=idle'}
          </span>
        </div>
      </div>

      {/* Terminal Command Feedback Ribbon */}
      <div className="bg-[#080B10] border border-[#21262D] px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#E6EDF3]">
          <span className="text-[#00D9FF]">root@kairos:~#</span>
          <span className="text-[#8B949E]">{cliFeedback}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-[#39FF88]">
          <CheckCircle2 className="w-3 h-3 text-[#39FF88]" />
          <span>SYS_READY</span>
        </div>
      </div>

      {/* Global Chaos Configuration Panel */}
      <div className="bg-[#0D1117] border border-[#21262D] p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#21262D]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#E6EDF3] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#39FF88]" />
              <span>Global Configuration</span>
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5">Runtime fault injection applied across all incoming TCP streams</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 border border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88] font-bold">
            DATA_PLANE_ACTIVE
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-[#8B949E]">
            Loading configuration...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-[#FF5C6C]">
            Failed to load chaos configuration. Is the proxy running?
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Toxic 1: Latency Injection (LIVE API WIRED) */}
            <div className={`p-4 border transition-all ${
              config.latency_enabled ? 'bg-[#080B10] border-[#39FF88] shadow-[0_0_12px_rgba(57,255,136,0.1)]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <Activity className="w-4 h-4 text-[#00D9FF]" />
                    <span>01 // LATENCY_INJECTION</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Post-read stream delay</span>
                </div>
                <button
                  aria-label="Toggle latency"
                  onClick={handleLatencyToggle}
                  className={`relative inline-flex h-5 w-10 items-center transition-colors focus:outline-none border ${
                    config.latency_enabled
                      ? 'bg-primary border-[#39FF88]'
                      : 'bg-secondary border-[#21262D]'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] border border-[#21262D] transition-transform ${
                      config.latency_enabled ? 'translate-x-5 bg-[#080B10]' : 'translate-x-1 bg-[#8B949E]'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8B949E] shrink-0">DELAY:</span>
                  <input
                    type="number"
                    value={delayMs}
                    onChange={(e) => setDelayMs(parseInt(e.target.value) || 0)}
                    disabled={!config.latency_enabled}
                    placeholder="ms"
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs text-[#E6EDF3] w-24 focus:outline-none focus:border-[#39FF88] disabled:opacity-40"
                  />
                  <span className="text-[11px] text-[#8B949E]">ms</span>

                  {config.latency_enabled && (
                    <button
                      onClick={handleLatencyUpdate}
                      className="ml-auto bg-[#161B22] hover:bg-[#21262D] text-[#39FF88] border border-[#39FF88]/40 hover:border-[#39FF88] text-[11px] font-bold px-2.5 py-1 transition-colors"
                    >
                      Apply
                    </button>
                  )}
                </div>

                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={config.latency_enabled ? 'text-[#39FF88] font-bold' : 'text-[#8B949E]'}>
                    {config.latency_enabled ? `ACTIVE (${delayMs}ms)` : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toxic 2: Jitter */}
            <div className={`p-4 border transition-all ${
              jitterEnabled ? 'bg-[#080B10] border-[#B388FF]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <Zap className="w-4 h-4 text-[#B388FF]" />
                    <span>02 // JITTER_VARIANCE</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Randomized delay range</span>
                </div>
                <button
                  onClick={() => setJitterEnabled(!jitterEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center border ${
                    jitterEnabled ? 'bg-[#B388FF] border-[#B388FF]' : 'bg-[#161B22] border-[#21262D]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] transition-transform ${
                    jitterEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={jitterMin}
                    onChange={(e) => setJitterMin(parseInt(e.target.value) || 0)}
                    disabled={!jitterEnabled}
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs w-16 disabled:opacity-40"
                  />
                  <span className="text-[#8B949E]">to</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={jitterMax}
                    onChange={(e) => setJitterMax(parseInt(e.target.value) || 0)}
                    disabled={!jitterEnabled}
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs w-16 disabled:opacity-40"
                  />
                  <span className="text-[#8B949E] text-[11px]">ms</span>
                </div>
                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={jitterEnabled ? 'text-[#B388FF] font-bold' : 'text-[#8B949E]'}>
                    {jitterEnabled ? `[${jitterMin}-${jitterMax}ms]` : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toxic 3: Bandwidth Throttling */}
            <div className={`p-4 border transition-all ${
              bandwidthEnabled ? 'bg-[#080B10] border-[#FFB454]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <Wifi className="w-4 h-4 text-[#FFB454]" />
                    <span>03 // BANDWIDTH_LIMIT</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Chunked write pacing</span>
                </div>
                <button
                  onClick={() => setBandwidthEnabled(!bandwidthEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center border ${
                    bandwidthEnabled ? 'bg-[#FFB454] border-[#FFB454]' : 'bg-[#161B22] border-[#21262D]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] transition-transform ${
                    bandwidthEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-[#8B949E]">RATE:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={bandwidthRate}
                    onChange={(e) => setBandwidthRate(parseInt(e.target.value) || 0)}
                    disabled={!bandwidthEnabled}
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs w-20 disabled:opacity-40"
                  />
                  <span className="text-[#8B949E] text-[11px]">KB/s</span>
                </div>
                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={bandwidthEnabled ? 'text-[#FFB454] font-bold' : 'text-[#8B949E]'}>
                    {bandwidthEnabled ? `${bandwidthRate} KB/s` : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toxic 4: Connection Reset */}
            <div className={`p-4 border transition-all ${
              resetEnabled ? 'bg-[#080B10] border-[#FF5C6C]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <RotateCcw className="w-4 h-4 text-[#FF5C6C]" />
                    <span>04 // TCP_RESET</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Abrupt socket teardown</span>
                </div>
                <button
                  onClick={() => setResetEnabled(!resetEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center border ${
                    resetEnabled ? 'bg-[#FF5C6C] border-[#FF5C6C]' : 'bg-[#161B22] border-[#21262D]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] transition-transform ${
                    resetEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-[#8B949E]">AFTER:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={resetAfter}
                    onChange={(e) => setResetAfter(parseInt(e.target.value) || 0)}
                    disabled={!resetEnabled}
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs w-20 disabled:opacity-40"
                  />
                  <span className="text-[#8B949E] text-[11px]">sec</span>
                </div>
                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={resetEnabled ? 'text-[#FF5C6C] font-bold' : 'text-[#8B949E]'}>
                    {resetEnabled ? `DROP AFTER ${resetAfter}s` : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toxic 5: Packet Loss */}
            <div className={`p-4 border transition-all ${
              packetLossEnabled ? 'bg-[#080B10] border-[#FF5C6C]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <FileWarning className="w-4 h-4 text-[#FF5C6C]" />
                    <span>05 // PACKET_LOSS</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Probabilistic write drop</span>
                </div>
                <button
                  onClick={() => setPacketLossEnabled(!packetLossEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center border ${
                    packetLossEnabled ? 'bg-[#FF5C6C] border-[#FF5C6C]' : 'bg-[#161B22] border-[#21262D]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] transition-transform ${
                    packetLossEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] text-[#8B949E]">DROP:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={packetLossPercent}
                    onChange={(e) => setPacketLossPercent(parseInt(e.target.value) || 0)}
                    disabled={!packetLossEnabled}
                    className="bg-[#161B22] border border-[#21262D] px-2 py-1 text-xs w-20 disabled:opacity-40"
                  />
                  <span className="text-[#8B949E] text-[11px]">%</span>
                </div>
                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={packetLossEnabled ? 'text-[#FF5C6C] font-bold' : 'text-[#8B949E]'}>
                    {packetLossEnabled ? `${packetLossPercent}% DROP` : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toxic 6: Blackhole Mode */}
            <div className={`p-4 border transition-all ${
              blackholeEnabled ? 'bg-[#080B10] border-[#FF5C6C] shadow-[0_0_15px_rgba(255,92,108,0.2)]' : 'bg-[#080B10]/60 border-[#21262D]'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                    <XCircle className="w-4 h-4 text-[#FF5C6C]" />
                    <span>06 // BLACKHOLE_MODE</span>
                  </div>
                  <span className="text-[10px] text-[#8B949E] block mt-0.5">Infinite write hang partition</span>
                </div>
                <button
                  onClick={() => setBlackholeEnabled(!blackholeEnabled)}
                  className={`relative inline-flex h-5 w-10 items-center border ${
                    blackholeEnabled ? 'bg-[#FF5C6C] border-[#FF5C6C]' : 'bg-[#161B22] border-[#21262D]'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform bg-[#080B10] transition-transform ${
                    blackholeEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#161B22]">
                <div className="text-[11px] text-[#FF5C6C] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>FREEZES ALL WRITE GOROUTINES</span>
                </div>
                <div className="text-[10px] flex justify-between text-[#8B949E]">
                  <span>STATUS:</span>
                  <span className={blackholeEnabled ? 'text-[#FF5C6C] font-bold animate-pulse' : 'text-[#8B949E]'}>
                    {blackholeEnabled ? 'PARTITION_ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Proxies Terminal Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#21262D]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF3]">Targeted Proxies</h3>
          <span className="text-[11px] text-[#8B949E]">CONFIGURED_NODES: {proxies.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proxies.map((proxy) => (
            <div key={proxy.id} className="bg-[#0D1117] border border-[#21262D] p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between pb-3 border-b border-[#21262D]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${proxy.status === 'active' ? 'bg-[#39FF88]' : 'bg-[#8B949E]'}`} />
                    <span className="font-bold text-sm text-[#E6EDF3]">{proxy.id}</span>
                  </div>
                  <div className="text-xs text-[#00D9FF] mt-1 font-mono">
                    {proxy.config.listenAddr} ──▶ {proxy.config.targetUrl}
                  </div>
                </div>

                <button
                  onClick={() => toggleProxyStatus(proxy.id)}
                  title={`Toggle ${proxy.id}`}
                  className={`p-1.5 border transition-colors ${
                    proxy.status === 'active'
                      ? 'border-[#FF5C6C]/40 bg-[#FF5C6C]/10 text-destructive hover:bg-[#FF5C6C]/20'
                      : 'border-[#39FF88]/40 bg-[#39FF88]/10 text-success hover:bg-[#39FF88]/20'
                  }`}
                >
                  {proxy.status === 'active' ? (
                    <Square className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>
              </div>

              <div className="pt-3 text-[11px] flex justify-between items-center text-[#8B949E]">
                <span>STREAM_STATE:</span>
                <span className={`font-bold ${proxy.status === 'active' ? 'text-[#39FF88]' : 'text-[#8B949E]'}`}>
                  [{proxy.status.toUpperCase()}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
