import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        
        <div className="flex flex-1 overflow-hidden relative z-0">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <Outlet />
            </div>
          </main>
          
          {/* Vertical Secure Briefing Text */}
          <div className="hidden lg:flex w-16 border-l-2 border-foreground flex-col items-center justify-center bg-card">
            <div 
              className="text-foreground/40 font-mono font-bold tracking-[0.3em] text-xs whitespace-nowrap"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              FIELD BRIEFING • SECURE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
