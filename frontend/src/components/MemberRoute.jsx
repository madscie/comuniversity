// components/MemberRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MemberRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  console.log('MemberRoute - isAuthenticated:', isAuthenticated);
  console.log('MemberRoute - isLoading:', isLoading);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default MemberRoute;