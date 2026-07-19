import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Loaders';

// Usage:
// <ProtectedRoute><Dashboard /></ProtectedRoute>                         -> any logged-in user
// <ProtectedRoute roles={['ADMIN']}><FacultyList /></ProtectedRoute>     -> only ADMIN
// <ProtectedRoute roles={['ADMIN','FACULTY']}><StudentList /></ProtectedRoute>
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Logged in, but this role isn't allowed on this page
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;