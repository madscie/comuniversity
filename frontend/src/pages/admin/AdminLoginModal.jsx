// src/components/AdminLoginModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { FiX, FiLock, FiMail } from "react-icons/fi";

const AdminLoginModal = ({ isOpen, onClose }) => {
  const [credentials, setCredentials] = useState({
    email: "admin@communiversity.com",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { adminLogin, devLogin } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log('🛡️ Attempting admin login...');
      
      // Use the adminLogin method from store
      const result = await adminLogin(credentials.email, credentials.password);

      if (result.success) {
        console.log('✅ Admin login successful');
        onClose();
        navigate("/admin/dashboard");
      } else {
        setError(result.error || "Invalid admin credentials");
      }
    } catch (err) {
      console.error('❌ Admin login error:', err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Development bypass for quick testing
  const handleDevLogin = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      console.log('🚀 Using development login bypass...');
      const result = await devLogin();
      
      if (result.success) {
        console.log('✅ Development login successful');
        onClose();
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error('❌ Dev login error:', err);
      setError("Development login failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Admin Email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@communiversity.com"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign in as Admin"}
          </button>

          {/* Development bypass button */}
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Signing in..." : "Development Login (Bypass)"}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="bg-gray-50 p-4 rounded-b-2xl">
          <p className="text-sm text-gray-600 text-center">
            <strong>Demo Credentials:</strong>
            <br />
            Email: admin@communiversity.com
            <br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;