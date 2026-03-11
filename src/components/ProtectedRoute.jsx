import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const token = localStorage.getItem('token');

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
