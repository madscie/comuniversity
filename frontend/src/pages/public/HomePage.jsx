import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBookOpen,
  FiArrowRight,
  FiBarChart2,
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore"; // ADD THIS IMPORT
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import AdminLoginModal from "../../pages/admin/AdminLoginModal";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // CORRECTLY ACCESS isAuthenticated from the auth store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Check if user is already authenticated on component mount
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <section className="text-center mb-16 mt-8">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-2xl opacity-30"></div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 relative">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Communiversity
            </span>
          </h1>
        </div>

        <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto mt-6 leading-relaxed">
          Explore our digital collection of{" "}
          <span className="font-semibold text-blue-600">2,500+ books</span>,
          meticulously organized with the Dewey Decimal System for seamless
          discovery and learning.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative">
              <TextInput
                type="text"
                placeholder="🔍 Search titles, authors, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                className="w-full pl-6 pr-14 py-4 text-lg border-0 shadow-2xl backdrop-blur-sm bg-white/95"
              />
              <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-600" />
            </div>
          </div>

          <Button
            type="submit"
            variant="gradient"
            className="mt-6 w-full py-4 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform duration-300"
          >
            <FiSearch className="mr-3 h-6 w-6" />
            Explore Our Collection
          </Button>
        </form>

        <div className="flex flex-wrap justify-center gap-6">
          <Button
            variant="primary"
            onClick={() => navigate("/browse")}
            className="px-8 py-4 text-lg font-semibold group"
          >
            <FiBookOpen className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            Browse Full Catalog
            <FiArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mb-20">
        <Card className="text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <FiBookOpen className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Smart Organization
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Books systematically categorized using the proven Dewey Decimal
            classification system.
          </p>
        </Card>

        <Card className="text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <FiSearch className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Advanced Search
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Intelligent search across titles, authors, and subjects with instant
            results.
          </p>
        </Card>

        <Card className="text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <FiArrowRight className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Instant Access
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Begin your knowledge journey with seamless, intuitive navigation and
            discovery.
          </p>
        </Card>

        {/* Admin Access Card - Added as fourth card */}
        <Card className="text-center group hover:scale-105 transition-transform duration-300">
          <div className="mx-auto bg-gradient-to-br from-gray-100 to-gray-200 p-4 rounded-2xl mb-6 w-20 h-20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <FiBarChart2 className="h-10 w-10 text-gray-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Access
          </h3>
          <p className="text-gray-600 leading-relaxed">
            Librarian tools for managing the digital collection and user
            accounts.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setIsAdminModalOpen(true)}
          >
            Admin Login
          </Button>
        </Card>
      </section>

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
