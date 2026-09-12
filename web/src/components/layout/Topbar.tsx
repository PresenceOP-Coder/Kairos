import { Bell, Search, Menu } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="bg-background/80 backdrop-blur-md h-14 sticky top-0 z-40 border-b border-card-border flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-md text-foreground/70 hover:bg-secondary transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-foreground/50">
          <kbd className="px-2 py-0.5 bg-secondary border border-card-border rounded text-xs font-mono">⌘</kbd>
          <kbd className="px-2 py-0.5 bg-secondary border border-card-border rounded text-xs font-mono">K</kbd>
          <span>to search</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-md text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-background"></span>
        </button>
        <div className="h-6 w-px bg-card-border mx-2"></div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[1px] cursor-pointer">
          <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">OP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
