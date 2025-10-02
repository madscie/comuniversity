// src/pages/public/SingleArticlePage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUser, FiCalendar } from "react-icons/fi";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";

const SingleArticlePage = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("Article ID from URL:", id);


  // ✅ Mock articles (replace with API later)
  const mockArticles = [
    {
      _id: "1",
      title: "The Future of Digital Libraries",
      author: "Eunice L.",
      createdAt: "2025-09-01T12:00:00Z",
      image:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800",
      content: `
        Digital libraries are transforming how we access knowledge. 
        With open educational resources, AI-driven discovery tools, 
        and interactive features, communities now have greater access 
        to information than ever before. This shift is redefining 
        education and research worldwide.
      `,
    },
    {
      _id: "2",
      title: "Mastering the Dewey Decimal System",
      author: "James M.",
      createdAt: "2025-08-15T10:30:00Z",
      image:
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800",
      content: `
        The Dewey Decimal System is a cornerstone of library organization. 
        This article introduces its structure, categories, and practical 
        applications for modern library management. Learn how to 
        navigate it effectively.
      `,
    },
    {
      _id: "3",
      title: "The Rise of E-Books in Education",
      author: "Linda K.",
      createdAt: "2025-07-20T08:15:00Z",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
      content: `
        E-books are rapidly becoming the preferred format in education. 
        Their portability, affordability, and accessibility are driving 
        this transition. Educators and students alike are adapting to 
        a new digital-first learning environment.
      `,
    },
  ];

  useEffect(() => {
    const foundArticle = mockArticles.find((a) => a._id === id);
    setArticle(foundArticle || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600 text-lg">Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-red-500 text-lg">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-5xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center hover:scale-105 transition-transform duration-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Articles
        </Button>

        {/* Article Card */}
        <Card className="p-10 shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl">
          {/* Title with gradient accent */}
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {article.title}
            </span>
          </h1>

          {/* Author + Date */}
          <div className="flex justify-center text-gray-600 text-sm space-x-6 mb-10">
            <span className="flex items-center">
              <FiUser className="mr-1 text-blue-500" /> {article.author}
            </span>
            <span className="flex items-center">
              <FiCalendar className="mr-1 text-purple-500" />{" "}
              {new Date(article.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Image */}
          {article.image && (
            <div className="mb-10">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-96 object-cover rounded-2xl shadow-md"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg text-gray-800 leading-relaxed whitespace-pre-line max-w-none">
            {article.content}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SingleArticlePage;
