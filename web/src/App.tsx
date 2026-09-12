import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Chaos } from './pages/Chaos';
import { Metrics } from './pages/Metrics';
import { Scenarios } from './pages/Scenarios';
import { Experiments } from './pages/Experiments';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chaos" element={<Chaos />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/metrics" element={<Metrics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
