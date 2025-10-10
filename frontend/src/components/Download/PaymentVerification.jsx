import React, { useState } from 'react';
import { FiCreditCard, FiLock, FiUser, FiCalendar, FiDollarSign, FiGlobe, FiExternalLink } from 'react-icons/fi';

const PaymentVerification = ({ bookTitle, bookAuthor, price, format, onPaymentSuccess, onCancel, loading }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (paymentMethod === 'stripe') {
      if (!paymentDetails.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!paymentDetails.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }

      if (!paymentDetails.cvv.match(/^\d{3,4}$/)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }

      if (!paymentDetails.name.trim()) {
        newErrors.name = 'Cardholder name is required';
      }
    }

    if (!paymentDetails.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
      return;
    }

    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  const simulateStripePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: 'txn_' + Math.random().toString(36).substr(2, 9),
          message: 'Payment processed successfully via Stripe'
        });
      }, 2000);
    });
  };

  const simulatePayPalRedirect = () => {
    return new Promise((resolve) => {
      // In a real app, this would redirect to PayPal
      // For demo purposes, we'll simulate the PayPal flow
      setTimeout(() => {
        // Simulate user completing PayPal payment
        const confirmed = window.confirm(
          'In a real application, you would be redirected to PayPal to complete your payment.\n\n' +
          'For this demo, click OK to simulate a successful PayPal payment.'
        );
        
        if (confirmed) {
          resolve({
            success: true,
            transactionId: 'paypal_' + Math.random().toString(36).substr(2, 9),
            message: 'Payment completed via PayPal'
          });
        } else {
          resolve({
            success: false,
            message: 'Payment was cancelled'
          });
        }
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Simulate payment processing based on method
    let paymentResult;
    
    if (paymentMethod === 'stripe') {
      paymentResult = await simulateStripePayment();
    } else if (paymentMethod === 'paypal') {
      paymentResult = await simulatePayPalRedirect();
    }

    if (paymentResult.success) {
      const paymentData = {
        method: paymentMethod,
        details: paymentMethod === 'stripe' ? paymentDetails : {},
        amount: price,
        bookTitle,
        format,
        timestamp: new Date().toISOString(),
        transactionId: paymentResult.transactionId
      };

      onPaymentSuccess(paymentData);
    } else {
      alert(paymentResult.message || 'Payment failed. Please try again.');
    }
  };

  const renderPaymentMethodIcon = (method) => {
    switch (method) {
      case 'stripe':
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 9.5h-3v5h3c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
              <path d="M20.5 4.5h-17c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-9.5 10.5h-3v-7h3c1.7 0 3 1.3 3 3.5s-1.3 3.5-3 3.5z"/>
            </svg>
            <span>Stripe</span>
          </div>
        );
      case 'paypal':
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.5 14.5c0 .8-.7 1.5-1.5 1.5h-1v1.5h1.5c1.7 0 3-1.3 3-3v-1.5h-3v1.5z"/>
              <path d="M18.5 10.5h-3v3h1.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5.5 10c0 2.2-1.8 4-4 4h-4.5v-1.5h4.5c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5h-3v-1.5h3c2.2 0 4 1.8 4 4z"/>
            </svg>
            <span>PayPal</span>
          </div>
        );
      default:
        return <FiCreditCard className="w-5 h-5 mx-auto mb-1" />;
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'stripe':
        return (
          <>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={paymentDetails.cardNumber}
                  onChange={handleInputChange}
                />
              </div>
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="MM/YY"
                    maxLength="5"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={paymentDetails.expiryDate}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                )}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    maxLength="4"
                    className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cvv ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={paymentDetails.cvv}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={paymentDetails.name}
                  onChange={handleInputChange}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </>
        );

      case 'paypal':
        return (
          <div className="text-center py-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.5 14.5c0 .8-.7 1.5-1.5 1.5h-1v1.5h1.5c1.7 0 3-1.3 3-3v-1.5h-3v1.5z"/>
                  <path d="M18.5 10.5h-3v3h1.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5.5 10c0 2.2-1.8 4-4 4h-4.5v-1.5h4.5c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5h-3v-1.5h3c2.2 0 4 1.8 4 4z"/>
                </svg>
                <span className="text-lg font-semibold text-blue-600">PayPal</span>
              </div>
              <p className="text-gray-600 mb-4">
                You will be redirected to PayPal to complete your payment securely.
              </p>
              <div className="flex items-center justify-center text-sm text-blue-600 mb-4">
                <FiExternalLink className="mr-2" />
                <span>External redirect to PayPal</span>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  For this demo: After clicking "Pay with PayPal", you'll see a confirmation dialog simulating the PayPal payment flow.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Book:</span>
            <span className="font-medium">{bookTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Author:</span>
            <span className="font-medium">{bookAuthor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Format:</span>
            <span className="font-medium">{format}</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600 font-semibold">Total:</span>
            <span className="font-bold text-lg text-green-600">${price}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`p-4 border rounded-lg text-center transition-all ${
              paymentMethod === 'stripe'
                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={() => setPaymentMethod('stripe')}
          >
            {renderPaymentMethodIcon('stripe')}
            <div className="mt-2 text-xs text-gray-500">
              Credit/Debit Card
            </div>
          </button>
          <button
            type="button"
            className={`p-4 border rounded-lg text-center transition-all ${
              paymentMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onClick={() => setPaymentMethod('paypal')}
          >
            {renderPaymentMethodIcon('paypal')}
            <div className="mt-2 text-xs text-gray-500">
              PayPal Account
            </div>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderPaymentForm()}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            value={paymentDetails.email}
            onChange={handleInputChange}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <FiLock className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 mb-1">Secure Payment</p>
              <p className="text-xs text-green-700">
                {paymentMethod === 'stripe' 
                  ? 'Your payment is processed securely by Stripe. We never store your card details.'
                  : 'Your payment is processed securely by PayPal. We never store your financial information.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Payment Processor Info */}
        <div className="flex items-center justify-center space-x-6 py-3 border-t border-b border-gray-200">
          {paymentMethod === 'stripe' ? (
            <>
              <div className="flex items-center text-gray-500">
                <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="#6772E5">
                  <path d="M13.5 9.5h-3v5h3c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
                  <path d="M20.5 4.5h-17c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h17c1.1 0 2-.9 2-2v-11c0-1.1-.9-2-2-2zm-9.5 10.5h-3v-7h3c1.7 0 3 1.3 3 3.5s-1.3 3.5-3 3.5z"/>
                </svg>
                <span className="text-sm font-medium">Powered by Stripe</span>
              </div>
              <div className="flex items-center text-gray-400">
                <FiGlobe className="w-4 h-4 mr-1" />
                <span className="text-xs">PCI Compliant</span>
              </div>
            </>
          ) : (
            <div className="flex items-center text-gray-500">
              <svg className="w-8 h-8 mr-2 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.5 14.5c0 .8-.7 1.5-1.5 1.5h-1v1.5h1.5c1.7 0 3-1.3 3-3v-1.5h-3v1.5z"/>
                <path d="M18.5 10.5h-3v3h1.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5z"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5.5 10c0 2.2-1.8 4-4 4h-4.5v-1.5h4.5c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5h-3v-1.5h3c2.2 0 4 1.8 4 4z"/>
              </svg>
              <span className="text-sm font-medium">Secure PayPal Payment</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : paymentMethod === 'paypal' ? (
              `Pay with PayPal`
            ) : (
              `Pay $${price} with Stripe`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentVerification;