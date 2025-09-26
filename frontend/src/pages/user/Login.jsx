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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 to-purple-400 py-8 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-800 text-white py-8 px-6 text-center">
          <h1 className="text-2xl font-semibold flex items-center justify-center mb-2">
            <FiLogIn className="mr-2" /> Welcome Back
          </h1>
          <p className="opacity-90">Log in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
            />
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
            className="w-full bg-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </>
            ) : (
              "Log In"
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

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Demo:</strong> Use any email and password (except admin
              credentials)
            </p>
            <p className="text-xs mt-1">
              Admin?{" "}
              <a href="/admin/login" className="text-blue-600 underline">
                Go to admin login
              </a>
            </p>
          </div>
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
        </div>
      </div>
    </div>
  );
};

export default Login;
