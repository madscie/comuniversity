import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiEye,
  FiClock,
  FiTag,
  FiBook,
  FiType,
  FiDollarSign,
  FiLock,
  FiShoppingCart,
} from "react-icons/fi";
import { MdPayment } from "react-icons/md";
import { SiStripe } from "react-icons/si";

import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import DocumentViewer from "../../utils/DocumentViewer";
import { articleService } from "../../services/articleService";
import { formatDate } from "../../utils/dateHelper";
import { getImageUrl, handleImageError } from "../../utils/helpers";

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-green-600 dark:border-t-green-400 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
      {message}
    </p>
  </div>
);

const SingleArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    fetchArticle();
    
    // Check if article is already purchased
    const purchasedArticles = JSON.parse(localStorage.getItem('purchasedArticles') || '[]');
    if (purchasedArticles.includes(id)) {
      setHasPurchased(true);
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getArticleById(id);

      if (response.success) {
        const articleData = {
          ...(response.data.article || response.data),
          tags: response.data.article?.tags || response.data?.tags
            ? (typeof (response.data.article?.tags || response.data?.tags) === 'string'
                ? (response.data.article?.tags || response.data?.tags).split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag !== '')
                : Array.isArray(response.data.article?.tags || response.data?.tags)
                  ? (response.data.article?.tags || response.data?.tags)
                  : [])
            : []
        };
        
        setArticle(articleData);
        console.log("Processed article data:", articleData);
      } else {
        throw new Error(response.message || "Article not found");
      }
    } catch (err) {
      console.error("Error fetching article:", err);
      setError("Failed to load article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method) => {
    if (!article || article.amount <= 0) return;

    setProcessingPayment(true);
    setPaymentMethod(method);
    
    const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email to continue with payment:');
    if (!userEmail) {
      setProcessingPayment(false);
      return;
    }
    
    localStorage.setItem('userEmail', userEmail);

    // ✅ FIXED: Different success URLs for Stripe vs PayPal
    let successUrl;
    
    if (method === 'stripe') {
      // For Stripe - use their placeholder
      successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&article_id=${article._id || id}`;
    } else if (method === 'paypal') {
      // For PayPal - use a generic success URL without placeholder
      successUrl = `${window.location.origin}/payment-success?provider=paypal&article_id=${article._id || id}`;
    }

    const cancelUrl = `${window.location.origin}/payment-cancelled`;

    try {
      console.log(`Initiating ${method} payment for:`, article.title);
      
      const paymentData = {
        amount: article.amount,
        articleId: article._id || id,
        email: userEmail,
        successUrl,
        cancelUrl,
        type: 'article'
      };
      
      console.log('Sending payment data:', paymentData);
      console.log('Success URL:', successUrl);
      console.log('Cancel URL:', cancelUrl);
      
      const res = await fetch(`http://localhost:5000/api/pay/${method}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData),
      });

      console.log('Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Payment failed response:', errorText);
        throw new Error(`Payment failed: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('Payment response data:', data);

      if (data.url) {
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment failed: ${error.message}\n\nPlease check console for details.`);
      setProcessingPayment(false);
      setPaymentMethod('');
    }
  };

  const handleTestPurchase = async () => {
    if (!article) return;

    const userEmail = localStorage.getItem('userEmail') || prompt('Please enter your email for test purchase:');
    if (!userEmail) return;

    try {
      const res = await fetch('http://localhost:5000/api/pay/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail,
          articleId: article._id || id,
          type: 'article'
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        alert('Test purchase successful! Article added to your library.');
        
        // Mark as purchased in localStorage
        const purchasedArticles = JSON.parse(localStorage.getItem('purchasedArticles') || '[]');
        if (!purchasedArticles.includes(id)) {
          purchasedArticles.push(id);
          localStorage.setItem('purchasedArticles', JSON.stringify(purchasedArticles));
        }
        
        setHasPurchased(true);
        setShowPaymentOptions(false);
        window.location.reload();
      } else {
        throw new Error(data.error || 'Test purchase failed');
      }
    } catch (error) {
      console.error('Test purchase error:', error);
      alert(`Test purchase failed: ${error.message}`);
    }
  };

  const hasTextContent =
    article?.content &&
    article.content.trim() !== "" &&
    article.content !== "optional";

  const hasFileContent = article?.file_url;

  const getTagsArray = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    }
    return [];
  };

  const renderContent = () => {
    if (article.amount === 0 || hasPurchased) {
      if (hasTextContent) {
        return (
          <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300 leading-relaxed">
            <div className="whitespace-pre-line bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              {article.content}
            </div>
          </div>
        );
      }

      if (hasFileContent) {
        return (
          <div className="space-y-6">
            <DocumentViewer
              document={article}
              loading={documentLoading}
              title={hasTextContent ? "Additional Document" : "Article Document"}
              description={
                hasTextContent
                  ? "This article also includes a downloadable document"
                  : "This article's content is available as a downloadable document"
              }
            />
          </div>
        );
      }
    }

    if (article.amount > 0 && !hasPurchased) {
      return (
        <div className="text-center py-12">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-8 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Premium Article
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Buy this premium article to access valuable insights and knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                onClick={() => setShowPaymentOptions(true)}
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <FiShoppingCart className="mr-2" />
                Buy for ${article.amount}
              </Button>
            </div>
          </div>
          
          {hasTextContent && article.content.length > 200 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preview
              </h4>
              <div className="prose prose-lg max-w-none text-gray-800 dark:text-gray-300">
                <div className="whitespace-pre-line bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 relative">
                  <div className="relative">
                    {article.content.substring(0, 400)}...
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      Buy to continue reading
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400 italic">
          No content available for this article.
        </p>
    </div>
    );
  };

  const PaymentModal = () => {
    if (!showPaymentOptions || !article) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {processingPayment ? 'Processing...' : 'Buy Article'}
            </h3>
            {!processingPayment && (
              <button 
                onClick={() => setShowPaymentOptions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-light"
                disabled={processingPayment}
              >
                ✕
              </button>
            )}
          </div>

          {processingPayment ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Redirecting to {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Secure payment processing...
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You'll be redirected to a confirmation page after payment.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    JORDAN'S GENERAL DEALERS
                  </h4>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-6">
                  <p className="text-gray-600 dark:text-gray-400 text-center text-sm mb-3">
                    Premium Article • Lifetime Access
                  </p>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                      ${article.amount}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      One-time purchase
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    Choose your payment method:
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handlePayment('stripe')}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <SiStripe className="w-6 h-6 mr-3" />
                      Stripe
                    </button>
                    
                    <button
                      onClick={() => handlePayment('paypal')}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
                    >
                      <MdPayment className="w-6 h-6 mr-3" />
                      PayPal
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start text-sm text-gray-500 dark:text-gray-400">
                  <FiLock className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Secure payment processing. Your financial information is encrypted and protected.
                  </span>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6">
                  <button
                    onClick={handleTestPurchase}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Test Purchase (Development Only)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <LoadingSpinner message="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full mb-4 w-16 h-16 mx-auto flex items-center justify-center">
            <FiBook className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">
            {error || "Article not found."}
          </p>
          <Button variant="primary" onClick={() => navigate("/articles")}>
            Back to Articles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button
          variant="outline"
          onClick={() => navigate("/articles")}
          className="mb-8 flex items-center hover:scale-105 transition-all duration-300"
        >
          <FiArrowLeft className="mr-2" /> Back to Articles
        </Button>

        <Card className="p-6 md:p-10 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl border-0">
          {article.featured && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block mb-6">
              FEATURED ARTICLE
            </div>
          )}

          <div className="flex items-center gap-2 mb-4 text-sm">
            <div className={`flex items-center px-3 py-1 rounded-full ${
              hasTextContent
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
            }`}>
              {hasTextContent ? <FiType className="mr-1" /> : <FiBook className="mr-1" />}
              {hasTextContent ? "Text Article" : "Document"}
            </div>
            
            {article.amount > 0 && (
              <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-300">
                <FiDollarSign className="mr-1" />
                Premium
              </div>
            )}
            
            {hasPurchased && article.amount > 0 && (
              <div className="flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300">
                <FiLock className="mr-1" />
                Purchased
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {article.title}
          </h1>

          <div className="flex flex-wrap gap-4 md:gap-6 text-gray-600 dark:text-gray-400 text-sm mb-6">
            <span className="flex items-center">
              <FiUser className="mr-2 text-green-500" />
              <span className="font-medium">By {article.author}</span>
            </span>
            <span className="flex items-center">
              <FiCalendar className="mr-2 text-green-500" />
              {formatDate(article.published_date)}
            </span>
            <span className="flex items-center">
              <FiClock className="mr-2 text-green-500" />
              {article.read_time} min read
            </span>
            <span className="flex items-center">
              <FiEye className="mr-2 text-green-500" />
              {article.views} views
            </span>
            <span className="flex items-center">
              <FiBook className="mr-2 text-green-500" />
              {article.category}
            </span>
          </div>

          {getTagsArray(article.tags).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {getTagsArray(article.tags).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center"
                >
                  <FiTag className="mr-1" size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {article.amount > 0 && !hasPurchased && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Premium Content
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Buy full access to this valuable resource
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${article.amount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      One-time purchase
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowPaymentOptions(true)}
                    className="px-6 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <FiShoppingCart className="mr-2" />
                    Buy Article
                  </Button>
                </div>
              </div>
            </div>
          )}

          {article.image_url && (
            <div className="mb-8">
              <img
                src={getImageUrl(article.image_url)}
                alt={article.title}
                className="w-full h-64 md:h-80 object-cover rounded-2xl shadow-md"
                onError={handleImageError}
              />
            </div>
          )}

          <div className="mt-8">{renderContent()}</div>
        </Card>

        <PaymentModal />
      </div>
    </div>
  );
};

export default SingleArticlePage;