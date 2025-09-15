// src/components/ProtectedRoute.jsx
import { useAuthStore, useIsAuthenticated } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isLoading } = useAuthStore(); // fixed import
  const isAuthenticated = useIsAuthenticated();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
