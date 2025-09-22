import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AdminLoginModal from "./AdminLoginModal";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleClose = () => navigate("/");

  if (isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <AdminLoginModal isOpen={true} onClose={handleClose} />
    </div>
  );
};

export default AdminLoginPage;
