import React, { useState, useEffect } from "react";
import { FiLogIn, FiShield, FiUser, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState({
    message: "",
    isSuccess: false,
    show: false,
  });
  
  // Smart detection state
  const [detectedUserType, setDetectedUserType] = useState(null); // 'user', 'admin', or null

  // Smart detection based on email input
  useEffect(() => {
    if (formData.email) {
      const email = formData.email.toLowerCase();
      
      // Detection logic - you can customize these rules
      if (email.includes('admin') || 
          email.includes('administrator') || 
          email.endsWith('@communiversity.org') ||
          email.includes('@admin.')) {
        setDetectedUserType('admin');
      } else {
        setDetectedUserType('user');
      }
    } else {
      setDetectedUserType(null);
    }
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setApiResponse({ ...apiResponse, show: false });

    try {
      // Use smart detection to determine if this is an admin login
      const isAdminLogin = detectedUserType === 'admin';
      
      // Pass the detected login type to your auth store
      const result = await login(formData.email, formData.password, isAdminLogin);

      if (result.success) {
        setApiResponse({
          message: `${isAdminLogin ? "Admin" : "User"} login successful! Redirecting...`,
          isSuccess: true,
          show: true,
        });

        setFormData({ email: "", password: "" });

        // Redirect based on detected user type
        setTimeout(() => {
          if (isAdminLogin) {
            navigate("/admin/dashboard", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        }, 1500);

      } else {
        setApiResponse({
          message: result.error || "Login failed. Please check your credentials.",
          isSuccess: false,
          show: true,
        });
      }
    } catch (error) {
      setApiResponse({
        message: "An unexpected error occurred. Please try again.",
        isSuccess: false,
        show: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic styling based on detected user type
  const getHeaderColor = () => {
    return detectedUserType === 'admin' ? "bg-purple-800" : "bg-blue-800";
  };

  const getButtonColor = () => {
    return detectedUserType === 'admin' ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700";
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return detectedUserType === 'admin' ? "Admin Access..." : "Logging in...";
    }
    return detectedUserType === 'admin' ? "Access Admin Dashboard" : "Log In";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 py-8 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Dynamic Header */}
        <div className={`text-white py-8 px-6 text-center transition-colors duration-300 ${getHeaderColor()}`}>
          <div className="flex items-center justify-center mb-2">
            {detectedUserType === 'admin' ? (
              <FiShield className="text-2xl mr-2" />
            ) : (
              <FiLogIn className="text-2xl mr-2" />
            )}
            <h1 className="text-2xl font-semibold">
              {detectedUserType === 'admin' ? "Admin Access" : "Welcome Back"}
            </h1>
          </div>
          <p className="opacity-90">
            {detectedUserType === 'admin' 
              ? "Access administrative features" 
              : "Log in to access your account"
            }
          </p>
        </div>

        {/* User Type Indicator */}
        {detectedUserType && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-center text-sm font-medium ${
            detectedUserType === 'admin' 
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            <div className="flex items-center justify-center">
              {detectedUserType === 'admin' ? (
                <>
                  <FiShield className="h-4 w-4 mr-2" />
                  Admin account detected - You'll be redirected to admin dashboard
                </>
              ) : (
                <>
                  <FiUser className="h-4 w-4 mr-2" />
                  User account detected - You'll be redirected to user dashboard
                </>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address *
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-red-600 text-sm mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`w-full text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${getButtonColor()}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {getButtonText()}
              </>
            ) : (
              getButtonText()
            )}
          </button>

          {apiResponse.show && (
            <div
              className={`mt-5 p-3 rounded-lg text-center text-sm ${
                apiResponse.isSuccess
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {apiResponse.message}
            </div>
          )}
        </form>

        <div className="text-center py-5 border-t border-gray-200 text-gray-700">
          <p>
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign up here
            </a>
          </p>
          {/* Optional: Manual admin access link */}
          <p className="text-sm mt-2">
            Need admin access? The system automatically detects admin accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;