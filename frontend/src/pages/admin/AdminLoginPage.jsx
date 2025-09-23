// src/pages/admin/AdminLoginPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useIsAuthenticated, useAuthLoading, useAuthError } from "../../store/authStore";
import TextInput from "../../components/UI/TextInput";
import Button from "../../components/UI/Button";
import Card from "../../components/UI/Card";
import { FiMail, FiLock, FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const { login, clearError } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/admin/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => clearError(), [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const result = await login(email, password, true); // admin login
    if (result.success) navigate("/admin/dashboard");
  };

  const handleDemoLogin = async () => {
    const result = await login("admin@comversity.org", "anypassword", true);
    if (result.success) navigate("/admin/dashboard");
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="p-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Home
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Access the Comversity administration panel</p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              icon={<FiMail className="h-4 w-4" />}
            />

            <div className="relative">
              <TextInput
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                icon={<FiLock className="h-4 w-4" />}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                "Login as Admin"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button type="button" variant="outline" className="w-full py-3" onClick={handleDemoLogin} disabled={isLoading}>
              Try Demo Admin Account
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Demo Admin Credentials:</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <p><strong>Email:</strong> admin@comversity.org</p>
              <p><strong>Password:</strong> any password will work</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Need admin access? Contact system administrator.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
