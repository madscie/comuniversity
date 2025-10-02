import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiBook, FiUser, FiCalendar } from "react-icons/fi";
import TextInput from "../../components/UI/TextInput";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const ArticlesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const navigate =  useNavigate()

  // ✅ Mock data (replace with backend later)
  const mockArticles = [
    {
      _id: "1",
      title: "The Future of Digital Libraries",
      description:
        "Explore how digital libraries are transforming knowledge access worldwide through open resources and AI-driven discovery.",
      author: "Eunice L.",
      createdAt: "2025-09-01T12:00:00Z",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800",
    },
    {
      _id: "2",
      title: "Mastering the Dewey Decimal System",
      description:
        "A beginner-friendly guide to understanding and applying the Dewey Decimal System for organizing books.",
      author: "James M.",
      createdAt: "2025-08-15T10:30:00Z",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
    },
    {
      _id: "3",
      title: "The Rise of E-Books in Education",
      description:
        "Why e-books are becoming the primary tool for modern education and how institutions are adapting to this shift.",
      author: "Linda K.",
      createdAt: "2025-07-20T08:15:00Z",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    },
  ];

  // ✅ Filter articles locally
  const filteredArticles = mockArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation function
  const handleReadMore = (articleId) => {
    console.log("ID",articleId);
    
    navigate(`/articles/${articleId}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span className="inline-flex items-center">
            <FiBook className="mr-3 text-blue-600" />
            Articles
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Dive into curated articles from our digital library community.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto mb-10">
        <form onSubmit={(e) => e.preventDefault()} className="relative group">
          <TextInput
            type="text"
            placeholder="🔍 Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-14 py-4 text-base border shadow-sm bg-white rounded-xl"
          />
          <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-600" />
        </form>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <p className="text-center text-gray-500">No articles found.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Card
              key={article._id}
              className="group hover:scale-105 transition-transform duration-300"
            >
              {/* Article Image */}
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {/* Article Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                {article.title}
              </h3>

              {/* Article Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                <span className="flex items-center">
                  <FiUser className="mr-1" /> {article.author}
                </span>
                <span className="flex items-center">
                  <FiCalendar className="mr-1" />{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Read More Button */}
                <Button
                onClick={()=>handleReadMore(article._id)}
                variant="outline" className="w-full">
                  Read More
                </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
