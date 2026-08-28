import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Layers, CalendarClock, Settings } from 'lucide-react';

const navItems = [
  { name: 'Live Controls', path: '/controls', icon: LayoutDashboard },
  { name: 'Metrics', path: '/metrics', icon: Activity },
  { name: 'Scenarios', path: '/scenarios', icon: Layers },
  { name: 'Timeline', path: '/timeline', icon: CalendarClock },
];

export function Sidebar() {
  return (
    <aside className="w-64 glass-panel border-r border-card-border hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-card-border/50">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          K
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Kairos</h1>
          <p className="text-xs text-primary/80 font-medium">Chaos Proxy</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3 px-3">
          Dashboard
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-[inset_2px_0_0_0_#8b5cf6]'
                  : 'text-foreground/70 hover:bg-card-border/50 hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-card-border/50">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-card-border/50 hover:text-foreground transition-all duration-200 w-full">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>
    </aside>
  );
}
