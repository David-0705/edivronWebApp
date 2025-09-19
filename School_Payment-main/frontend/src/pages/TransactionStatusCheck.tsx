import React, { useState } from "react";
import { apiService } from "../services/api";
import type { TransactionStatus } from "../types";

const TransactionStatusCheck: React.FC = () => {
  const [customOrderId, setCustomOrderId] = useState("");
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check transaction status
  const checkTransactionStatus = async () => {
    if (!customOrderId.trim()) {
      setError("Please enter a custom order ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiService.getTransactionStatus(customOrderId);
      setTransactionStatus(response);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch transaction status"
      );
      setTransactionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkTransactionStatus();
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusConfig = (status: string) => {
      switch (status.toLowerCase()) {
        case "success":
          return {
            color: "bg-green-100 text-green-800 border-green-200",
            icon: "✅",
            label: "Success",
          };
        case "pending":
          return {
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
            icon: "⏳",
            label: "Pending",
          };
        case "failed":
          return {
            color: "bg-red-100 text-red-800 border-red-200",
            icon: "❌",
            label: "Failed",
          };
        default:
          return {
            color: "bg-gray-100 text-gray-800 border-gray-200",
            icon: "📄",
            label: status,
          };
      }
    };

    const config = getStatusConfig(status);

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN");
  };

  // --- Redesigned UI ---
  return (
    <div className="min-h-screen py-10 px-2 sm:px-8 flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
            Transaction Status Check
          </h1>
          <p className="mt-2 text-base text-gray-700 font-medium">
            Enter a custom order ID to check the current status of a specific
            transaction.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 mb-8 border border-purple-100 animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="customOrderId"
                className="block text-lg font-bold text-purple-700 mb-2"
              >
                Custom Order ID
              </label>
              <div className="flex rounded-xl shadow overflow-hidden">
                <input
                  type="text"
                  id="customOrderId"
                  placeholder="Enter custom order ID (e.g., ORD_1234567890_abc123)"
                  value={customOrderId}
                  onChange={(e) => setCustomOrderId(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-300 bg-white/70 text-lg font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 rounded-r-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-lg font-semibold text-white shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <span className="animate-pulse mr-2">🔍</span> Check
                      Status
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Examples */}
            <div className="text-sm text-purple-500">
              <p>Examples of custom order IDs:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  <code className="bg-purple-100 px-2 py-1 rounded font-mono">
                    ORD_1234567890_abc123
                  </code>
                </li>
                <li>
                  <code className="bg-purple-100 px-2 py-1 rounded font-mono">
                    ORD_9876543210_xyz789
                  </code>
                </li>
              </ul>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100/80 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow mb-6 animate-fade-in flex items-center">
            <span className="mr-2 text-xl">⚠️</span>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-base text-purple-600 font-semibold">
              Checking transaction status...
            </p>
          </div>
        )}

        {/* Transaction Status Results */}
        {transactionStatus && !loading && (
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden border border-purple-100 animate-fade-in">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
              <h3 className="text-2xl font-bold text-purple-700 flex items-center mb-2">
                <span className="mr-2">📊</span> Transaction Details
              </h3>
              <p className="text-sm text-gray-500">
                Complete information for order:{" "}
                <span className="font-mono text-purple-700">
                  {transactionStatus.custom_order_id}
                </span>
              </p>
            </div>

            <div className="border-t border-purple-100">
              <dl>
                {/* Status */}
                <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">Status</dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    <StatusBadge status={transactionStatus.status} />
                  </dd>
                </div>

                {/* Order Information */}
                <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Custom Order ID
                  </dt>
                  <dd className="mt-1 text-lg font-mono text-purple-900 sm:col-span-2">
                    {transactionStatus.custom_order_id}
                  </dd>
                </div>

                <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Collect ID
                  </dt>
                  <dd className="mt-1 text-lg font-mono text-purple-900 sm:col-span-2">
                    {transactionStatus.collect_id}
                  </dd>
                </div>

                <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    School ID
                  </dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    {transactionStatus.school_id}
                  </dd>
                </div>

                <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">Gateway</dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    {transactionStatus.gateway}
                  </dd>
                </div>

                {/* Student Information */}
                <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Student Information
                  </dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    <div className="space-y-1">
                      <div>
                        <strong>Name:</strong>{" "}
                        {transactionStatus.student_info.name}
                      </div>
                      <div>
                        <strong>ID:</strong> {transactionStatus.student_info.id}
                      </div>
                      <div>
                        <strong>Email:</strong>{" "}
                        {transactionStatus.student_info.email}
                      </div>
                    </div>
                  </dd>
                </div>

                {/* Payment Information */}
                <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Order Amount
                  </dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    <span className="text-xl font-bold">
                      {formatCurrency(transactionStatus.order_amount)}
                    </span>
                  </dd>
                </div>

                {transactionStatus.transaction_amount && (
                  <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Transaction Amount
                    </dt>
                    <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                      <span className="text-xl font-bold">
                        {formatCurrency(transactionStatus.transaction_amount)}
                      </span>
                    </dd>
                  </div>
                )}

                {transactionStatus.payment_mode && (
                  <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Payment Mode
                    </dt>
                    <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                      {transactionStatus.payment_mode}
                    </dd>
                  </div>
                )}

                {transactionStatus.bank_reference && (
                  <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Bank Reference
                    </dt>
                    <dd className="mt-1 text-lg font-mono text-purple-900 sm:col-span-2">
                      {transactionStatus.bank_reference}
                    </dd>
                  </div>
                )}

                {/* Messages */}
                {transactionStatus.payment_message && (
                  <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Payment Message
                    </dt>
                    <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-base font-semibold">
                        {transactionStatus.payment_message}
                      </span>
                    </dd>
                  </div>
                )}

                {transactionStatus.error_message && (
                  <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Error Message
                    </dt>
                    <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-base font-semibold">
                        {transactionStatus.error_message}
                      </span>
                    </dd>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Created At
                  </dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    {formatDate(transactionStatus.createdAt)}
                  </dd>
                </div>

                <div className="bg-white/80 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-lg font-bold text-purple-700">
                    Last Updated
                  </dt>
                  <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                    {formatDate(transactionStatus.updatedAt)}
                  </dd>
                </div>

                {transactionStatus.payment_time && (
                  <div className="bg-purple-50/60 px-8 py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-lg font-bold text-purple-700">
                      Payment Time
                    </dt>
                    <dd className="mt-1 text-lg text-purple-900 sm:col-span-2">
                      {formatDate(transactionStatus.payment_time)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-8 py-4 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setTransactionStatus(null);
                  setCustomOrderId("");
                }}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-white/70 text-purple-700 font-semibold shadow hover:bg-white/90 hover:scale-105 transition-transform duration-200 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                Clear
              </button>
              <button
                onClick={checkTransactionStatus}
                className="inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!transactionStatus && !loading && !error && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-purple-300 text-7xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-purple-700 mb-2">
              Check Transaction Status
            </h3>
            <p className="text-purple-500 max-w-md mx-auto text-lg">
              Enter a custom order ID in the search box above to view detailed
              information about a specific transaction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionStatusCheck;
