import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";

const MemberRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, hasCheckedAuth } = useAuthStore();
  const location = useLocation();

  // Wait for auth check to complete
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is admin AND trying to access non-admin routes, redirect to admin dashboard
  // But only if they're not already on an admin route
  if (user?.role === "admin" && !location.pathname.startsWith("/admin")) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Regular user - allow access
  return children;
};

export default MemberRoute;
