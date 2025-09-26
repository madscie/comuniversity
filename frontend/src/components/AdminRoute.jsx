import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, hasCheckedAuth, isLoading } = useAuthStore();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Use useEffect to handle redirects in a single pass
  useEffect(() => {
    if (hasCheckedAuth && !isLoading) {
      setShouldRedirect(true);
    }
  }, [hasCheckedAuth, isLoading]);

  // Show loading while checking auth
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Checking admin permissions...</div>
      </div>
    );
  }

  // Only perform redirects after the component has mounted and auth is checked
  if (shouldRedirect) {
    if (!isAuthenticated) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    if (user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AdminRoute;