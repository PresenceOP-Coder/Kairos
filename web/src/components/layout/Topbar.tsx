import { Bell, Search, Menu } from 'lucide-react';

export function Topbar() {
  return (
    <header className="bg-background h-16 sticky top-0 z-40 border-b-2 border-foreground flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg text-foreground border-2 border-transparent hover:border-foreground/20 hover:bg-foreground/5 transition-colors">
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>
        <div className="hidden md:flex items-center gap-2 text-sm text-foreground/70 font-medium">
          <kbd className="px-2 py-1 bg-card border-2 border-foreground rounded-md text-xs font-mono font-bold text-foreground">⌘</kbd>
          <kbd className="px-2 py-1 bg-card border-2 border-foreground rounded-md text-xs font-mono font-bold text-foreground">K</kbd>
          <span>to search</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-full text-foreground border-2 border-transparent hover:border-foreground/20 hover:bg-foreground/5 transition-all duration-200 relative group">
          <Search className="w-5 h-5 stroke-[2.5]" />
        </button>
        <button className="p-2.5 rounded-full text-foreground border-2 border-transparent hover:border-foreground/20 hover:bg-foreground/5 transition-all duration-200 relative group">
          <Bell className="w-5 h-5 stroke-[2.5]" />
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-foreground rounded-full border-2 border-background"></span>
        </button>
        <div className="h-8 w-[2px] bg-foreground mx-2"></div>
        <div className="w-9 h-9 rounded-full bg-card border-2 border-foreground cursor-pointer hover:bg-foreground hover:text-background transition-colors duration-200 flex items-center justify-center">
          <span className="text-xs font-bold">OP</span>
        </div>
      </div>
    </header>
  );
}
