import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/controls" replace />} />
          <Route path="/controls" element={<div>Live Chaos Controls Placeholder</div>} />
          <Route path="/metrics" element={<div>Metrics Dashboard Placeholder</div>} />
          <Route path="/scenarios" element={<div>Scenario Management Placeholder</div>} />
          <Route path="/timeline" element={<div>Scheduler / Timeline Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
