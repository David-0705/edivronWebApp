import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface PaymentResult {
  collect_id?: string;
  status?: string;
  amount?: string;
  message?: string;
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get parameters from URL
    const collectId = searchParams.get("collect_id");
    const status = searchParams.get("status");
    const amount = searchParams.get("amount");

    // Set payment completion flag in localStorage for dashboard refresh
    if (status === "success" && collectId) {
      localStorage.setItem(
        "recent_payment_completion",
        JSON.stringify({
          collect_id: collectId,
          timestamp: Date.now(),
          status: status,
        })
      );
    }

    setPaymentResult({
      collect_id: collectId || "",
      status: status || "",
      amount: amount || "",
      message:
        status === "success"
          ? "Payment completed successfully!"
          : "Payment status updated",
    });

    setLoading(false);
  }, [searchParams]);

  const handleGoHome = () => {
    navigate("/make-payment");
  };

  const handleViewTransactions = () => {
    // Set a specific flag for payment completion navigation
    navigate("/dashboard?payment_completed=true&reset_filters=true");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-400 mx-auto"></div>
          <p className="mt-4 text-white/80">Loading payment result...</p>
        </div>
      </div>
    );
  }

  const isSuccess = paymentResult.status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center animate-fade-in relative overflow-hidden">
          {/* Confetti effect for success */}
          {isSuccess && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {/* Simple confetti dots */}
              {[...Array(30)].map((_, i) => (
                <span
                  key={i}
                  className={`absolute rounded-full opacity-70 animate-confetti`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${8 + Math.random() * 12}px`,
                    height: `${8 + Math.random() * 12}px`,
                    background: [
                      "#f472b6",
                      "#c4b5fd",
                      "#818cf8",
                      "#fbbf24",
                      "#34d399",
                    ][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative z-10">
            {/* Icon */}
            <div
              className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full ${
                isSuccess ? "bg-green-100" : "bg-blue-100"
              } mb-6 animate-fade-in`}
            >
              {isSuccess ? (
                <svg
                  className="h-12 w-12 text-green-600"
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
              ) : (
                <svg
                  className="h-12 w-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            {/* Title */}
            <h2
              className={`text-3xl font-extrabold ${
                isSuccess ? "text-green-900" : "text-blue-900"
              } mb-4 animate-fade-in`}
            >
              {isSuccess ? "Payment Successful!" : "Payment Status Updated"}
            </h2>
            {/* Message */}
            <p className="text-lg text-white/80 mb-6 animate-fade-in">
              {paymentResult.message}
            </p>
            {/* Payment Details */}
            {paymentResult.collect_id && (
              <div className="bg-white/40 rounded-xl p-4 mb-6 text-left animate-fade-in">
                <h3 className="text-sm font-bold text-indigo-700 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm text-indigo-900">
                  <div className="flex justify-between">
                    <span>Collection ID:</span>
                    <span className="font-mono">
                      {paymentResult.collect_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-semibold ${
                        isSuccess ? "text-green-600" : "text-blue-600"
                      }`}
                    >
                      {paymentResult.status?.toUpperCase()}
                    </span>
                  </div>
                  {paymentResult.amount && (
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold">
                        ₹{paymentResult.amount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Time:</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-100 border border-green-200 rounded-xl p-4 mb-6 animate-fade-in">
                <p className="text-sm text-green-700 font-semibold">
                  Your payment has been processed successfully. You should
                  receive a confirmation email shortly.
                </p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400"
              >
                Make Another Payment
              </button>
              <button
                onClick={handleViewTransactions}
                className="w-full flex justify-center py-3 px-4 border border-white/40 rounded-xl shadow-lg text-base font-semibold text-indigo-700 bg-white/70 hover:bg-white/90 hover:text-pink-500 transition-colors duration-200"
              >
                View All Transactions
              </button>
            </div>
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/30 animate-fade-in">
              <p className="text-xs text-white/80 text-center">
                Payment processed by EDVIRON Payment Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
