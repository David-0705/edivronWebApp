import React, { useState, useEffect } from "react";
import { apiService } from "../services/api";
import type { Transaction, TransactionsResponse } from "../types";

const TransactionsBySchool: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Predefined school IDs (in real app, this would come from API)
  const commonSchoolIds = [
    "65b0e6293e9f76a9694d84b4",
    "school123",
    "school456",
    "school789",
  ];

  // Fetch transactions for selected school
  const fetchTransactionsBySchool = async () => {
    if (!selectedSchoolId.trim()) {
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response: TransactionsResponse =
        await apiService.getTransactionsBySchool(selectedSchoolId, {
          page,
          limit,
        });

      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions when school ID or page changes
  useEffect(() => {
    fetchTransactionsBySchool();
  }, [selectedSchoolId, page]);

  // Reset page when school changes
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setPage(1);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "success":
          return "bg-green-100 text-green-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "failed":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          status
        )}`}
      >
        {status}
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2 drop-shadow-lg">
            Transactions by School
          </h1>
          <p className="mt-2 text-base text-white/80">
            View all transactions for a specific school by entering or selecting
            a school ID.
          </p>
        </div>
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <h3 className="text-lg font-bold text-white mb-4">Select School</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="schoolId"
                className="block text-sm font-medium text-white/80"
              >
                School ID
              </label>
              <div className="mt-1 flex rounded-xl shadow-sm">
                <input
                  type="text"
                  id="schoolId"
                  placeholder="Enter school ID (e.g., 65b0e6293e9f76a9694d84b4)"
                  value={selectedSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-xl border-white/40 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                />
                <button
                  onClick={fetchTransactionsBySchool}
                  className="inline-flex items-center px-6 py-3 border border-l-0 border-white/40 rounded-r-xl bg-white/70 text-indigo-700 text-base font-semibold hover:bg-white/90 hover:text-pink-500 transition-colors duration-200"
                >
                  🔍 Search
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Or select from common school IDs:
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSchoolIds.map((schoolId) => (
                  <button
                    key={schoolId}
                    onClick={() => handleSchoolChange(schoolId)}
                    className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors duration-200 border ${
                      selectedSchoolId === schoolId
                        ? "bg-gradient-to-r from-pink-500 to-indigo-500 text-white border-white/40"
                        : "bg-white/20 text-white/80 hover:bg-white/40 border-white/40"
                    }`}
                  >
                    {schoolId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl animate-fade-in">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400"></div>
            <p className="mt-2 text-base text-white/80">
              Loading transactions...
            </p>
          </div>
        )}
        {!loading && selectedSchoolId && (
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-fade-in">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">
              Transactions for School: {selectedSchoolId}
            </h3>
            <p className="mb-4 text-base text-indigo-900">
              {transactions.length > 0 ? (
                <>
                  {pagination.totalCount} total transactions found
                  {pagination.totalPages > 1 &&
                    ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                </>
              ) : (
                "No transactions found for this school"
              )}
            </p>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-indigo-300 text-6xl mb-4">📝</div>
                <p className="text-indigo-700 text-lg">No transactions found</p>
                <p className="text-indigo-400 text-sm mt-2">
                  Try a different school ID or check if the school has any
                  transactions.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl shadow-lg">
                  <table className="min-w-full divide-y divide-white/40">
                    <thead className="bg-white/40">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Collect ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Gateway
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Order Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Transaction Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Custom Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/20 divide-y divide-white/40">
                      {transactions.map((transaction) => (
                        <tr
                          key={transaction.collect_id}
                          className="hover:bg-white/40 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-900">
                            {transaction.collect_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                            {transaction.gateway}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                            {formatCurrency(transaction.order_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                            {transaction.transaction_amount
                              ? formatCurrency(transaction.transaction_amount)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={transaction.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-900">
                            {transaction.custom_order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                            <div>
                              <div className="font-bold">
                                {transaction.student_name}
                              </div>
                              <div className="text-indigo-500">
                                {transaction.student_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900">
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-base text-indigo-900">
                      Showing{" "}
                      <span className="font-bold">
                        {(pagination.currentPage - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold">
                        {Math.min(
                          pagination.currentPage * limit,
                          pagination.totalCount
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold">{pagination.totalCount}</span>{" "}
                      results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 rounded-xl bg-white/70 text-indigo-700 font-semibold shadow-lg hover:bg-white/90 hover:text-pink-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 rounded-xl bg-white/70 text-indigo-700 font-semibold shadow-lg hover:bg-white/90 hover:text-pink-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        {!selectedSchoolId && !loading && (
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center animate-fade-in">
            <div className="text-indigo-300 text-6xl mb-4">🏫</div>
            <h3 className="text-lg font-bold text-white mb-2">
              Select a School
            </h3>
            <p className="text-white/80">
              Enter a school ID above or select from the common school IDs to
              view transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsBySchool;
