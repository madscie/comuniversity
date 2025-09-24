// src/pages/admin/AdminLoginModal.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiLock, FiMail, FiArrowRight } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import TextInput from "../../components/UI/TextInput";
import { useAuthStore } from "../../store/authStore";

const AdminLoginModal = ({ isOpen, onClose }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/admin/dashboard");
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(credentials.email, credentials.password, true); // admin login
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Login failed. Please check your credentials.");
    }

    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleDemoLogin = async () => {
    setError("");
    setIsLoading(true);
    const result = await login("admin@comversity.org", "anypassword", true);
    if (result.success) onClose();
    else setError(result.error || "Demo login failed");
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative max-w-md w-full">
        <Card className="border-0 bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>

          <div className="relative z-10 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Admin Portal
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <TextInput
                    type="email"
                    name="email"
                    placeholder="Enter your admin email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <TextInput
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full py-3 font-semibold group"
                disabled={isLoading}
              >
                {isLoading ? "Authenticating..." : "Access Dashboard"}
              </Button>
            </form>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full py-3"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Try Demo Admin Account
              </Button>
            </div>

            <div className="mt-6 text-center text-xs text-gray-400">
              Demo credentials: <strong>Email:</strong> admin@comversity.org | <strong>Password:</strong> any password
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginModal;
