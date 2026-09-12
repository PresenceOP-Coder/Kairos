import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Layers, Activity, CalendarClock, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Chaos', path: '/chaos', icon: Zap },
  { name: 'Scenarios', path: '/scenarios', icon: Layers },
  { name: 'Experiments', path: '/experiments', icon: CalendarClock },
  { name: 'Metrics', path: '/metrics', icon: Activity },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-background border-r border-card-border hidden md:flex flex-col h-full sticky top-0">
      <div className="p-5 flex items-center gap-3 border-b border-card-border">
        <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-bold">
          K
        </div>
        <div>
          <h1 className="font-bold tracking-tight text-foreground">Kairos</h1>
          <p className="text-xs text-foreground/60 font-medium">Chaos Proxy</p>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2 px-3 pt-2">
          Overview
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-card-border">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors w-full">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
