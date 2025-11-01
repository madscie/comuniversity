// src/pages/user/Login.jsx
import React, { useState } from "react";
import { FiLogIn } from "react-icons/fi";
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
      // IMPORTANT: Check if user is trying to login as admin
      if (
        formData.email === "admin@communiversity.com" &&
        formData.password === "admin123"
      ) {
        setApiResponse({
          message:
            "Admin credentials detected. Please use the admin login page.",
          isSuccess: false,
          show: true,
        });
        setIsSubmitting(false);
        return;
      }

      // Use the login function from the store for regular users
      const result = await login(formData.email, formData.password);

      setApiResponse({
        message: result.success
          ? "Login successful! Redirecting..."
          : result.error || "Login failed",
        isSuccess: result.success,
        show: true,
      });

      if (result.success) {
        setFormData({ email: "", password: "" });
        setTimeout(() => {
          navigate("/"); // redirect to homepage
        }, 1500);
      }
    } catch (error) {
      setApiResponse({
        message: "An error occurred. Please try again later.",
        isSuccess: false,
        show: true,
      });
    } finally {
      setIsSubmitting(false);
    }

    // Check what's actually in storage
    console.log("User:", localStorage.getItem("user"));
    console.log("Admin:", localStorage.getItem("adminUser"));

    // Check the current auth state
    console.log("Auth State:", useAuthStore.getState());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 py-6 sm:py-8 px-3 sm:px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-gray-800 to-green-600 text-white py-6 sm:py-8 px-4 sm:px-6 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold flex items-center justify-center mb-1 sm:mb-2">
            <FiLogIn className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Welcome Back
          </h1>
          <p className="opacity-90 text-sm sm:text-base">Log in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">
                {errors.email}
              </span>
            )}
          </div>

          <div className="mb-4 sm:mb-5">
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent focus:outline-none transition text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-red-600 dark:text-red-400 text-xs sm:text-sm mt-1 block">
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-gray-800 to-green-600 text-white py-3 sm:py-4 px-4 rounded-lg font-semibold hover:from-gray-900 hover:to-green-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed text-sm sm:text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              "Log In"
            )}
          </button>

          {apiResponse.show && (
            <div
              className={`mt-4 sm:mt-5 p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm ${
                apiResponse.isSuccess
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
              }`}
            >
              {apiResponse.message}
            </div>
          )}

          {/* Demo credentials hint */}
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-300 text-center">
              <strong>Demo:</strong> Use any email and password (except admin
              credentials)
            </p>
            <p className="text-xs mt-1 text-center">
              Admin?{" "}
              <a href="/admin/login" className="text-green-600 dark:text-green-400 underline">
                Go to admin login
              </a>
            </p>
          </div>
        </form>

        <div className="text-center py-4 sm:py-5 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs sm:text-sm">
          <p>
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-green-600 dark:text-green-400 font-medium hover:underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;