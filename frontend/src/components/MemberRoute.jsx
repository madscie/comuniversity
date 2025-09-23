// src/components/MemberRoute.jsx
import { useAuthStore } from "../store/authStore";
import { Navigate, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <FiLoader className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const MemberRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  // If the user is NOT authenticated, redirect them to the MAIN LOGIN page
//   if (!isAuthenticated) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

  // If they are authenticated, let them see the page (regardless of being admin or not)
  return children;
};

export default MemberRoute;
