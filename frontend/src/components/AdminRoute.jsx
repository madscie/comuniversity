// src/components/AdminRoute.jsx
import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
