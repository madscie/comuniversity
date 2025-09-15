// src/components/Modals/AdminRegisterModal.jsx
import { useState } from "react";
import { FiX, FiLock, FiMail, FiArrowRight, FiUser, FiLogIn } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import TextInput from "../../components/UI/TextInput";

const AdminRegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [adminData, setAdminData] = useState({
    username: "",
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (adminData.password !== adminData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (adminData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3002/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData)
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert("Admin account created successfully! You can now login.");
        onClose();
        onSwitchToLogin();
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setAdminData({
      ...adminData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="relative max-w-md w-full">
        <Card className="border-0 bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Create Admin Account
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <TextInput
                      type="text"
                      name="fname"
                      placeholder="First Name"
                      value={adminData.fname}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <TextInput
                      type="text"
                      name="lname"
                      placeholder="Last Name"
                      value={adminData.lname}
                      onChange={handleInputChange}
                      required
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <TextInput
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={adminData.username}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <TextInput
                    type="email"
                    name="email"
                    placeholder="admin@yourdomain.com"
                    value={adminData.email}
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
                    placeholder="Password"
                    value={adminData.password}
                    onChange={handleInputChange}
                    required
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <TextInput
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={adminData.confirmPassword}
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
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Admin Account
                    <FiArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center"
                onClick={onSwitchToLogin}
              >
                <FiLogIn className="mr-2 h-4 w-4" />
                Already have an account? Login here
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminRegisterModal;