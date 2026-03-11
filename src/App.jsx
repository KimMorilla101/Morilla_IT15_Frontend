import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Layout from './components/Layout';
import Dashboard from './components/dashboard/Dashboard';
import ErrorBoundary from './components/common/ErrorBoundary';
import Students from './pages/Students';
import Enrollment from './pages/Enrollment';
import AcademicCalendar from './pages/AcademicCalendar';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Programs from './pages/Programs';
import Subjects from './pages/Subjects';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Route - Login Page */}
          <Route path="/" element={<Login />} />

          {/* Protected Routes - Dashboard and Pages */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="academic-calendar" element={<AcademicCalendar />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="programs" element={<Programs />} />
            <Route path="subjects" element={<Subjects />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
