import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Placeholder for Navbar/Sidebar */}
        <header className="glass-panel p-4 sticky top-0 z-50 flex items-center justify-between border-b border-card-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold">K</div>
            <h1 className="text-xl font-semibold tracking-tight">Kairos</h1>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col max-w-7xl mx-auto w-full gap-6">
          <Routes>
            <Route path="/" element={<Navigate to="/controls" replace />} />
            <Route path="/controls" element={<div>Live Chaos Controls</div>} />
            <Route path="/metrics" element={<div>Metrics Dashboard</div>} />
            <Route path="/scenarios" element={<div>Scenario Management</div>} />
            <Route path="/timeline" element={<div>Scheduler / Timeline</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
