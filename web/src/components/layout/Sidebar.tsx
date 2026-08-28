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
    <aside className="w-64 bg-background border-r-2 border-foreground hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b-2 border-foreground">
        <div className="w-10 h-10 rounded-xl bg-card border-2 border-foreground flex items-center justify-center text-foreground font-bold text-xl">
          K
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Kairos</h1>
          <p className="text-xs text-foreground/70 font-medium">Chaos Proxy</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-4 px-3">
          Dashboard
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 border-2 ${
                isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'text-foreground border-transparent hover:border-foreground/20 hover:bg-foreground/5'
              }`
            }
          >
            <item.icon className="w-5 h-5 stroke-[2.5]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t-2 border-foreground">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-foreground border-2 border-transparent hover:border-foreground/20 hover:bg-foreground/5 transition-all duration-200 w-full">
          <Settings className="w-5 h-5 stroke-[2.5]" />
          Settings
        </button>
      </div>
    </aside>
  );
}
