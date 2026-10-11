import { Terminal, Shield, Wifi, Activity, Menu } from 'lucide-react';
import { useSystemHealth, useChaosConfig } from '../../hooks/useKairos';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { health, loading: healthLoading, error: healthError } = useSystemHealth();
  const { config } = useChaosConfig();

  const isHealthy = !healthLoading && !healthError && health.status === 'ok';
  const isChaosActive = config?.latency_enabled;

  return (
    <header className="bg-[#080B10] border-b border-[#21262D] h-14 sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between font-mono select-none">
      {/* Brand & Terminal Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 text-[#8B949E] hover:text-[#39FF88] hover:bg-[#161B22] border border-[#21262D] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#39FF88]" />
          <span className="font-bold text-xs sm:text-sm tracking-wider text-[#E6EDF3]">
            KAIROS <span className="text-[#8B949E] font-normal">//</span> <span className="text-[#39FF88]">CHAOS ENGINEERING TERMINAL</span>
          </span>
          <span className="inline-block w-2 h-4 bg-[#39FF88] animate-pulse ml-0.5" aria-hidden="true" />
        </div>
      </div>

      {/* Telemetry Status Bar */}
      <div className="hidden sm:flex items-center gap-3 text-xs">
        {/* Upstream Target */}
        <div className="px-2.5 py-1 bg-[#0D1117] border border-[#21262D] flex items-center gap-2 text-[#8B949E]">
          <Wifi className="w-3.5 h-3.5 text-[#00D9FF]" />
          <span>TARGET:</span>
          <span className="text-[#E6EDF3] font-semibold">127.0.0.1:9001</span>
        </div>

        {/* Proxy State */}
        <div className="px-2.5 py-1 bg-[#0D1117] border border-[#21262D] flex items-center gap-2 text-[#8B949E]">
          <Shield className="w-3.5 h-3.5 text-[#B388FF]" />
          <span>PROXY:</span>
          <span className="text-[#E6EDF3] font-semibold">:9000</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-[#39FF88] shadow-[0_0_8px_#39FF88]' : 'bg-[#FF5C6C]'}`} />
        </div>

        {/* Chaos Status */}
        <div className={`px-2.5 py-1 bg-[#0D1117] border flex items-center gap-2 ${
          isChaosActive ? 'border-[#FFB454]/40 text-[#FFB454]' : 'border-[#21262D] text-[#8B949E]'
        }`}>
          <Activity className={`w-3.5 h-3.5 ${isChaosActive ? 'text-[#FFB454] animate-pulse' : 'text-[#8B949E]'}`} />
          <span>CHAOS:</span>
          <span className={`font-semibold ${isChaosActive ? 'text-[#FFB454]' : 'text-[#39FF88]'}`}>
            {isChaosActive ? 'INJECTING' : 'IDLE'}
          </span>
        </div>

        {/* API Health */}
        <div className={`px-2.5 py-1 border flex items-center gap-2 font-semibold ${
          healthLoading ? 'border-[#21262D] text-[#8B949E] bg-[#0D1117]' :
          healthError ? 'border-[#FF5C6C]/40 text-[#FF5C6C] bg-[#FF5C6C]/10' :
          isHealthy ? 'border-[#39FF88]/40 text-[#39FF88] bg-[#39FF88]/10' :
          'border-[#FF5C6C]/40 text-[#FF5C6C] bg-[#FF5C6C]/10'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            healthLoading ? 'bg-[#8B949E]' :
            healthError ? 'bg-[#FF5C6C]' :
            'bg-[#39FF88] shadow-[0_0_8px_#39FF88]'
          }`} />
          <span>API {healthLoading ? 'CONNECTING...' : isHealthy ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>
    </header>
  );
}
