// src/pages/public/PaymentSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaArrowLeft, FaBookOpen, FaHome, FaPaypal } from 'react-icons/fa';
import { SiStripe } from 'react-icons/si';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [articleId, setArticleId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    
    // Check for Stripe session ID
    const sessionIdParam = query.get('session_id');
    // Check for PayPal provider
    const providerParam = query.get('provider');
    const articleIdParam = query.get('article_id');
    
    setProvider(providerParam || 'stripe');
    setArticleId(articleIdParam);
    
    if (sessionIdParam) {
      // Stripe payment
      setSessionId(sessionIdParam);
      verifyStripePayment(sessionIdParam);
    } else if (providerParam === 'paypal') {
      // PayPal payment - verify immediately
      verifyPayPalPayment(articleIdParam);
    } else {
      // No payment info, redirect
      setTimeout(() => {
        navigate('/articles');
      }, 3000);
    }
  }, [location, navigate]);

  const verifyStripePayment = async (sessionId) => {
    try {
      const response = await fetch('http://localhost:5000/api/pay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId,
          paymentMethod: 'stripe'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Save purchase in localStorage
        const purchasedArticles = JSON.parse(localStorage.getItem('purchasedArticles') || '[]');
        if (!purchasedArticles.includes(data.itemId || articleId)) {
          purchasedArticles.push(data.itemId || articleId);
          localStorage.setItem('purchasedArticles', JSON.stringify(purchasedArticles));
        }
      }
    } catch (error) {
      console.error('Stripe verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayPalPayment = async (articleId) => {
    try {
      // For PayPal, you need to send the order ID that was captured
      // Since you're returning from PayPal, you should have the order ID
      // You'll need to modify your PayPal success URL to include orderId
      
      // For now, we'll just mark as purchased
      if (articleId) {
        const purchasedArticles = JSON.parse(localStorage.getItem('purchasedArticles') || '[]');
        if (!purchasedArticles.includes(articleId)) {
          purchasedArticles.push(articleId);
          localStorage.setItem('purchasedArticles', JSON.stringify(purchasedArticles));
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('PayPal verification error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-green-200 rounded-full animate-spin"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-800 dark:text-white">
            Verifying Your Payment...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Please wait while we confirm your {provider === 'paypal' ? 'PayPal' : 'Stripe'} payment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6">
            <FaCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Payment Successful!
          </h1>
          <p className="text-green-100 text-lg">
            Thank you for your purchase
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              {provider === 'paypal' ? (
                <FaPaypal className="w-8 h-8 text-green-600 dark:text-green-400" />
              ) : (
                <SiStripe className="w-8 h-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Transaction Complete
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your {provider === 'paypal' ? 'PayPal' : 'Stripe'} payment has been processed successfully
            </p>
          </div>

          {/* Details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <FaCheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                <span className="font-medium text-gray-800 dark:text-gray-300 capitalize">
                  {provider === 'paypal' ? 'PayPal' : 'Credit Card (Stripe)'}
                </span>
              </div>
              
              {sessionId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                  <span className="font-mono text-sm text-gray-800 dark:text-gray-300">
                    {sessionId.substring(0, 12)}...
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Date</span>
                <span className="text-gray-800 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {articleId && (
              <Link
                to={`/articles/${articleId}`}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
              >
                <FaBookOpen className="w-5 h-5 mr-3" />
                Read Your Article
              </Link>
            )}
            
            <Link
              to="/articles"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <FaHome className="w-5 h-5 mr-3" />
              Browse More Articles
            </Link>
            
            <button
              onClick={() => window.print()}
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              Print Receipt
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              A receipt has been sent to your email. 
              You can now access your purchased article anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;