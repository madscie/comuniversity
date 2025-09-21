import { useAuthStore, useIsAuthenticated } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const { user, isLoading, isAuthenticated, isAdmin } = useAuthStore();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;