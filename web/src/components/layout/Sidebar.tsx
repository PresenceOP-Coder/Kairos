import { NavLink } from 'react-router-dom';
import { Terminal, Cpu, Zap, Layers, CalendarClock, Activity } from 'lucide-react';

const navItems = [
  { prefix: '01', label: 'OVERVIEW', name: 'Dashboard', path: '/dashboard', icon: Cpu },
  { prefix: '02', label: 'CHAOS CONTROL', name: 'Chaos', path: '/chaos', icon: Zap },
  { prefix: '03', label: 'SCENARIOS', name: 'Scenarios', path: '/scenarios', icon: Layers },
  { prefix: '04', label: 'EXPERIMENTS', name: 'Experiments', path: '/experiments', icon: CalendarClock },
  { prefix: '05', label: 'SYSTEM METRICS', name: 'Metrics', path: '/metrics', icon: Activity },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#080B10]/90 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Terminal Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-[#080B10] border-r border-[#21262D] flex flex-col font-mono text-xs transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Terminal Header */}
        <div className="p-4 border-b border-[#21262D] bg-[#0D1117] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C6C]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB454]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF88]" />
            <span className="text-[#8B949E] text-[11px] ml-1">tty1://kairos</span>
          </div>
          <span className="text-[#39FF88] text-[10px] font-bold px-1.5 py-0.5 border border-[#39FF88]/40 bg-[#39FF88]/10">
            v1.0.0
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] text-[#8B949E] uppercase tracking-wider px-3 py-2 flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-[#39FF88]" />
            <span>NAVIGATION_MENU</span>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={item.name}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 border-l-2 transition-all group ${
                  isActive
                    ? 'border-[#39FF88] bg-[#39FF88]/10 text-[#39FF88] font-bold shadow-[inset_4px_0_12px_rgba(57,255,136,0.08)]'
                    : 'border-transparent text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#161B22]'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
              <span className="text-[#8B949E] text-[10px] select-none">{item.prefix} //</span>
              <span className="tracking-wider">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* System Terminal Status Footer */}
        <div className="p-3 border-t border-[#21262D] bg-[#0D1117] text-[11px] space-y-1.5 text-[#8B949E]">
          <div className="flex justify-between items-center text-[10px]">
            <span>SYSTEM:</span>
            <span className="text-[#00D9FF]">LINUX_TCP_PROXY</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>PORT_IN:</span>
            <span className="text-[#39FF88] font-bold">9000</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span>PORT_API:</span>
            <span className="text-[#B388FF] font-bold">8080</span>
          </div>
        </div>
      </aside>
    </>
  );
}
