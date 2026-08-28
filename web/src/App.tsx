import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Controls } from './pages/Controls';
import { Metrics } from './pages/Metrics';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/controls" replace />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/scenarios" element={<div>Scenario Management Placeholder</div>} />
          <Route path="/timeline" element={<div>Scheduler / Timeline Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
