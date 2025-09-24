// export default AdminLoginPage;

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AdminLoginModal from "./AdminLoginModal";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
      
    }
  }, [isAuthenticated, navigate]);

  const handleClose = () => {
    navigate("/"); // Redirect to homepage if modal closed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      {/* Always render modal; it controls visibility */}
      <AdminLoginModal isOpen={!isAuthenticated} onClose={handleClose} />
    </div>
  );
};

export default AdminLoginPage;
