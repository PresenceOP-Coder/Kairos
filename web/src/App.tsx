import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Controls } from './pages/Controls';
import { Metrics } from './pages/Metrics';
import { Scenarios } from './pages/Scenarios';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/controls" replace />} />
          <Route path="/controls" element={<Controls />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/timeline" element={<div>Scheduler / Timeline Placeholder</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
