import { Bell, Search, Menu } from 'lucide-react';

export function Topbar() {
  return (
    <header className="glass-panel h-16 sticky top-0 z-40 border-b border-card-border flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg text-foreground/70 hover:bg-card-border/50 hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-foreground/50">
          <kbd className="px-2 py-1 bg-card border border-card-border rounded-md text-xs font-mono">⌘</kbd>
          <kbd className="px-2 py-1 bg-card border border-card-border rounded-md text-xs font-mono">K</kbd>
          <span>to search</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-full text-foreground/70 hover:bg-card-border/50 hover:text-foreground transition-all duration-200 relative group">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full text-foreground/70 hover:bg-card-border/50 hover:text-foreground transition-all duration-200 relative group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-[var(--color-card)]"></span>
        </button>
        <div className="h-8 w-px bg-card-border/50 mx-2"></div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[2px] cursor-pointer hover:scale-105 transition-transform duration-200">
          <div className="w-full h-full bg-background rounded-full border-2 border-transparent overflow-hidden flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">OP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
