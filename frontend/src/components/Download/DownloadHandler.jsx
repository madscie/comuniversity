// components/Download/DownloadHandler.jsx
import React, { useState } from "react";
import PaymentVerification from "./PaymentVerification";
import FileDownload from "./FileDownload";

const DownloadHandler = ({
  bookId,
  bookTitle,
  bookAuthor,
  price,
  format,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState("payment"); // payment → downloading → complete
  const [downloadData, setDownloadData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock function to simulate payment verification
  const verifyPayment = async (paymentDetails) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: "txn_" + Math.random().toString(36).substr(2, 9),
          message: "Payment processed successfully",
        });
      }, 2000);
    });
  };

  // Mock function to get download token
  const getDownloadToken = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          downloadUrl: `/api/books/${bookId}/download`,
          token: "secure-token-" + Date.now(),
          filename: `${bookTitle.replace(/\s+/g, "_")}.${format.toLowerCase()}`,
          expiresIn: "24 hours",
        });
      }, 1000);
    });
  };

  // In DownloadHandler.jsx, update the handlePaymentSuccess function:
  const handlePaymentSuccess = async (paymentDetails) => {
    setLoading(true);
    try {
      const paymentResult = await verifyPayment(paymentDetails);
      if (paymentResult.success) {
        const tokenData = await getDownloadToken();
        setDownloadData({
          ...tokenData,
          bookId: bookId, // Make sure bookId is passed
          bookAuthor: bookAuthor, // Pass author info
          transactionId: paymentResult.transactionId,
        });
        setStep("downloading");
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      alert("Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadComplete = () => {
    setStep("complete");
    // Notify parent after a delay
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);
  };

  const handleBackToPayment = () => {
    setStep("payment");
  };

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "payment"
                ? "bg-blue-600 text-white"
                : step === "downloading" || step === "complete"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            1
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              step === "payment"
                ? "text-blue-600"
                : step === "downloading" || step === "complete"
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            Payment
          </span>
        </div>
        <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "downloading"
                ? "bg-blue-600 text-white"
                : step === "complete"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            2
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              step === "downloading"
                ? "text-blue-600"
                : step === "complete"
                ? "text-green-600"
                : "text-gray-500"
            }`}
          >
            Download
          </span>
        </div>
        <div className="flex-1 h-1 bg-gray-300 mx-4"></div>
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "complete"
                ? "bg-green-600 text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            3
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              step === "complete" ? "text-green-600" : "text-gray-500"
            }`}
          >
            Complete
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-64">
        {step === "payment" && (
          <PaymentVerification
            bookTitle={bookTitle}
            bookAuthor={bookAuthor}
            price={price}
            format={format}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={onCancel}
            loading={loading}
          />
        )}

        {step === "downloading" && (
          <FileDownload
            downloadData={downloadData}
            bookTitle={bookTitle}
            format={format}
            onDownloadComplete={handleDownloadComplete}
            onBack={handleBackToPayment}
          />
        )}

        {step === "complete" && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Download Complete!
            </h3>
            <p className="text-gray-600 mb-6">
              Your book "{bookTitle}" has been downloaded successfully in{" "}
              {format} format.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-green-800 mb-2">
                What's Next?
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Check your downloads folder for the file</li>
                <li>• You can download again within 24 hours</li>
                <li>• Access your download history in your account</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadHandler;
