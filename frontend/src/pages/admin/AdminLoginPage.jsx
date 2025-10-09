import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AdminLoginModal from "./AdminLoginModal";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [apiResponse, setApiResponse] = useState({ message: "", isSuccess: false, show: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiResponse({ ...apiResponse, show: false });

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setApiResponse({ message: "Login successful! Redirecting...", isSuccess: true, show: true });
        setFormData({ email: "", password: "" });

        // Redirect based on role
        setTimeout(() => {
          if (result.user.role === "ADMIN") {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1000);
      } else {
        setApiResponse({ message: result.error || "Login failed", isSuccess: false, show: true });
      }
    } catch (error) {
      setApiResponse({ message: "Unexpected error. Please try again.", isSuccess: false, show: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigate("/"); // redirect to home if modal closed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <AdminLoginModal
        isOpen={!isAuthenticated}
        onClose={handleClose}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiResponse={apiResponse}
      />
    </div>
  );
};

export default AdminLoginPage;
