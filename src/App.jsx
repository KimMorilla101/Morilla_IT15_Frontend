import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
<<<<<<< HEAD
import Programs from './pages/Programs';
import Subjects from './pages/Subjects';
=======
import Students from './pages/Students';
import Courses from './pages/Courses';
import Enrollment from './pages/Enrollment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
>>>>>>> b2e5797868fe35bc656ad79a139a2f0fbd1bb43e
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login Page */}
        <Route path="/" element={<LoginPage />} />
        
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
<<<<<<< HEAD
          <Route path="programs" element={<Programs />} />
          <Route path="subjects" element={<Subjects />} />
=======
          <Route path="students" element={<Students />} />
          <Route path="courses" element={<Courses />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
>>>>>>> b2e5797868fe35bc656ad79a139a2f0fbd1bb43e
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
