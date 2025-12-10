import React from 'react';
import { Link } from 'react-router-dom';
import { FaTimesCircle, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6">
            <FaTimesCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Payment Cancelled
          </h1>
          <p className="text-orange-100 text-lg">
            No charges were made to your account
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your payment was interrupted or cancelled. 
              You can try again or return to browsing articles.
            </p>
          </div>

          {/* Reasons Card */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-3">
              Why payments get cancelled:
            </h3>
            <ul className="space-y-2 text-orange-700 dark:text-orange-400 text-sm">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3"></span>
                You clicked "Cancel" in the payment window
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3"></span>
                Payment session timed out
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-1.5 mr-3"></span>
                Network connectivity issues
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg"
            >
              <FaArrowLeft className="w-5 h-5 mr-3" />
              Try Payment Again
            </button>
            
            <Link
              to="/articles"
              className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-semibold transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center"
            >
              <FaShoppingCart className="w-5 h-5 mr-3" />
              Browse Articles
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Need help? Contact our support team at support@jordansdealers.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;