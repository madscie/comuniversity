// src/pages/HomePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBookOpen,
  FiArrowRight,
  FiBook,
  FiUsers,
  FiAward,
  FiClock,
  FiStar,
} from "react-icons/fi";
import {
  componentClasses,
  gradients,
  colorMap,
} from "../../components/UI/TailwindColors";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    { number: "2.5K", label: "Books", suffix: "+" },
    { number: "150", label: "Categories", suffix: "+" },
    { number: "24/7", label: "Access", suffix: "" },
    { number: "99.9", label: "Uptime", suffix: "%" },
  ];

  const features = [
    {
      icon: FiBook,
      title: "Smart Organization",
      description:
        "Advanced Dewey Decimal System with intelligent tagging for effortless discovery.",
    },
    {
      icon: FiSearch,
      title: "AI-Powered Search",
      description:
        "Intelligent search across titles, authors, and subjects with semantic understanding.",
    },
    {
      icon: FiAward,
      title: "Premium Access",
      description:
        "Unlimited access to academic resources and exclusive digital content.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-32 sm:-right-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-green-100 dark:bg-green-900/20 rounded-full blur-2xl sm:blur-3xl opacity-30" />
          <div className="absolute -bottom-20 -left-20 sm:-bottom-32 sm:-left-32 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-gray-100 dark:bg-gray-800/30 rounded-full blur-2xl sm:blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* Main Heading with perfect responsive text sizing */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400 block sm:inline">
                Communiversity
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl sm:max-w-4xl mx-auto leading-relaxed px-2">
              Explore our curated collection of{" "}
              <span className="font-semibold text-green-600 dark:text-green-400">
                2,500+ books
              </span>
              , meticulously organized with the Dewey Decimal System for
              seamless discovery and learning.
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl sm:max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 sm:-inset-1 bg-gradient-to-r from-gray-700 to-green-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search titles, authors, subjects, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                  className="w-full pl-4 sm:pl-6 pr-12 sm:pr-16 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-xl sm:rounded-2xl focus:border-green-400 transition-all duration-300 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30 outline-none text-gray-900 dark:text-white"
                />
                <FiSearch className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400 transition-transform group-hover:scale-110 duration-300" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                type="submit"
                className={`flex-1 py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-semibold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${componentClasses.btn.primary}`}
              >
                <FiSearch className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                Explore Our Collection
              </button>
              <button
                type="button"
                onClick={() => navigate("/browse")}
                className={`py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 text-sm sm:text-base lg:text-lg font-semibold rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${componentClasses.btn.secondary}`}
              >
                <FiBookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                Browse Full Catalog
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-default">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-2 sm:mb-4 group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-white mb-1">
                    {stat.number}
                    <span className="text-green-400">{stat.suffix}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-300 font-semibold">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-green-600 dark:from-gray-300 dark:to-green-400">
                Our Library
              </span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl sm:max-w-3xl mx-auto px-2">
              Experience the future of academic research with our intelligent
              library system
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${componentClasses.card.elevated} text-center p-6 sm:p-8 group hover:border-green-200 dark:hover:border-green-800 transition-all duration-300`}
              >
                <div className="mx-auto bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex items-center justify-center group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                  {feature.description}
                </p>
                <button
                  className={`text-xs sm:text-sm font-semibold ${componentClasses.btn.ghost} text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 flex items-center justify-center`}
                >
                  Learn more
                  <FiArrowRight className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-3xl sm:max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Join thousands of learners who have transformed their knowledge with
            our comprehensive digital library.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/browse")}
              className={`px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold rounded-lg sm:rounded-xl flex items-center justify-center gap-2 sm:gap-3 ${componentClasses.btn.success}`}
            >
              <FiBookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold rounded-lg sm:rounded-xl ${componentClasses.btn.outline} border-white text-white hover:bg-white hover:text-gray-900`}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
