import { useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const AuthRedirect = () => {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check user role from Clerk metadata
      const userRole = user.publicMetadata?.role;
      
      console.log('User role:', userRole); // Debug log
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/'); // Regular user home page
      }
    }
  }, [user, isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default AuthRedirect;