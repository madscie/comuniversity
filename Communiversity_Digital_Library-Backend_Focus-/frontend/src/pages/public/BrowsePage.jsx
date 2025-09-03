// src/pages/public/BrowsePage.jsx
import { useState } from "react";
import { FiSearch, FiBook, FiChevronRight } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const BrowsePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const deweyCategories = [
    {
      number: "000-099",
      name: "General Works",
      description: "Computer science, information, general reference works",
      color: "from-blue-500 to-blue-600",
      icon: "📚",
      books: 250,
    },
    {
      number: "100-199",
      name: "Philosophy & Psychology",
      description: "Ethics, logic, metaphysics, psychology",
      color: "from-purple-500 to-purple-600",
      icon: "🧠",
      books: 180,
    },
    {
      number: "200-299",
      name: "Religion",
      description: "Christianity, other religions, mythology",
      color: "from-red-500 to-red-600",
      icon: "⛪",
      books: 220,
    },
    {
      number: "300-399",
      name: "Social Sciences",
      description: "Sociology, economics, law, politics, education",
      color: "from-green-500 to-green-600",
      icon: "🌍",
      books: 350,
    },
    {
      number: "400-499",
      name: "Language",
      description: "Grammar, linguistics, dictionaries, specific languages",
      color: "from-yellow-500 to-yellow-600",
      icon: "🗣️",
      books: 190,
    },
    {
      number: "500-599",
      name: "Natural Sciences & Math",
      description: "Biology, physics, chemistry, astronomy, mathematics",
      color: "from-indigo-500 to-indigo-600",
      icon: "🔬",
      books: 420,
    },
    {
      number: "600-699",
      name: "Technology & Applied Sciences",
      description: "Medicine, engineering, agriculture, home economics",
      color: "from-pink-500 to-pink-600",
      icon: "⚙️",
      books: 380,
    },
    {
      number: "700-799",
      name: "Arts & Recreation",
      description: "Music, fine arts, photography, sports",
      color: "from-teal-500 to-teal-600",
      icon: "🎨",
      books: 310,
    },
    {
      number: "800-899",
      name: "Literature",
      description: "Poetry, plays, novels, essays from around the world",
      color: "from-orange-500 to-orange-600",
      icon: "📖",
      books: 480,
    },
    {
      number: "900-999",
      name: "History & Geography",
      description: "World history, geography, travel, biography",
      color: "from-gray-500 to-gray-600",
      icon: "🏛️",
      books: 270,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Our Collection
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Explore{" "}
            <span className="font-semibold text-blue-600">2,500+ books</span>{" "}
            organized by the Dewey Decimal Classification System
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="🔍 Quick search within categories..."
                className="w-full pl-6 pr-12 py-4 text-lg border-0 rounded-2xl shadow-lg backdrop-blur-sm bg-white/95"
              />
              <FiSearch className="absolute right-4 h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Dewey Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {deweyCategories.map((category) => (
            <Card
              key={category.number}
              className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0"
              onClick={() => setSelectedCategory(category)}
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}
              >
                {category.icon}
              </div>

              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {category.number}
              </h3>

              <h4 className="text-lg font-semibold text-gray-800 text-center mb-3">
                {category.name}
              </h4>

              <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                {category.description}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {category.books} books
                </span>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="text-sm font-medium">Explore</span>
                  <FiChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <Card className="mb-12 border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <div
                className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${selectedCategory.color} flex items-center justify-center text-white text-3xl mb-6 mx-auto`}
              >
                {selectedCategory.icon}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory.number} - {selectedCategory.name}
              </h2>
              <p className="text-gray-700 text-lg mb-6 max-w-2xl mx-auto">
                {selectedCategory.description}
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary" className="px-6 py-3">
                  <FiBook className="mr-2 h-5 w-5" />
                  View All Books
                </Button>
                <Button variant="secondary" className="px-6 py-3">
                  <FiSearch className="mr-2 h-5 w-5" />
                  Advanced Search
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics */}
        <Card className="text-center border-0 bg-white/80 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Collection Overview
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                2,500+
              </div>
              <div className="text-gray-600">Total Books</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">10</div>
              <div className="text-gray-600">Main Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                100+
              </div>
              <div className="text-gray-600">Subcategories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                24/7
              </div>
              <div className="text-gray-600">Digital Access</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BrowsePage;
