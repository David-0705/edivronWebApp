import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api";
import type { Transaction, TransactionsResponse } from "../types";

const TransactionsOverview: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFiltersClearedNotification, setShowFiltersClearedNotification] =
    useState(false);

  // Simple flag to track if we should auto-reset
  const [needsAutoReset, setNeedsAutoReset] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Default clean filters
  const defaultFilters = {
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
    status: "",
    school_id: "",
    gateway: "",
  };

  // Filter states - ALWAYS start with clean defaults
  const [filters, setFilters] = useState(() => {
    console.log("TransactionsOverview: Initializing filters");
    console.log(
      "URL Search Params:",
      Object.fromEntries(searchParams.entries())
    );

    // Check if we have payment completion params - if so, ignore all filters
    const hasPaymentParams =
      searchParams.get("payment_completed") === "true" ||
      searchParams.get("reset_filters") === "true" ||
      searchParams.get("refresh") === "true";

    if (hasPaymentParams) {
      console.log("Payment completion detected - using clean default filters");
      return defaultFilters;
    }

    // Only use URL params if they are explicitly set and meaningful
    const statusParam = searchParams.get("status");
    const schoolParam = searchParams.get("school_id");
    const gatewayParam = searchParams.get("gateway");

    const hasExplicitFilters =
      (statusParam && statusParam !== "" && statusParam !== "undefined") ||
      (schoolParam && schoolParam !== "" && schoolParam !== "undefined") ||
      (gatewayParam && gatewayParam !== "" && gatewayParam !== "undefined");

    console.log("Explicit filters check:", {
      status: statusParam,
      school_id: schoolParam,
      gateway: gatewayParam,
      hasExplicitFilters,
    });

    if (hasExplicitFilters) {
      const urlFilters = {
        page: Number(searchParams.get("page")) || 1,
        limit: Number(searchParams.get("limit")) || 10,
        sort: searchParams.get("sort") || "createdAt",
        order: searchParams.get("order") || "desc",
        status: statusParam || "",
        school_id: schoolParam || "",
        gateway: gatewayParam || "",
      };
      console.log("Using explicit URL filters:", urlFilters);
      return urlFilters;
    }

    console.log("No explicit filters - using clean defaults:", defaultFilters);
    return defaultFilters;
  });

  // Track if this is the initial load
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // Ref for the reset button to trigger it programmatically
  const resetButtonRef = useRef<HTMLButtonElement>(null);

  // Function to reset filters (same logic as reset button)
  const resetFiltersAndFetch = async () => {
    console.log("resetFiltersAndFetch: Resetting filters and fetching data");
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());

    // Wait a moment for state to update, then fetch
    setTimeout(async () => {
      await fetchTransactions(true);
    }, 100);
  };

  // Available filter options
  const statusOptions = ["", "PENDING", "SUCCESS", "FAILED", "CANCELLED"];
  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "payment_time", label: "Payment Time" },
    { value: "order_amount", label: "Order Amount" },
    { value: "transaction_amount", label: "Transaction Amount" },
    { value: "status", label: "Status" },
  ];

  // Fetch transactions
  const fetchTransactions = async (forceFresh = false) => {
    try {
      setLoading(true);
      setError("");

      const params: any = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, value]) => value !== "" && value !== 0
        )
      );

      // Add cache busting if forcing fresh data
      if (forceFresh) {
        params._cacheBust = true;
      }

      console.log("fetchTransactions called with:");
      console.log("- forceFresh:", forceFresh);
      console.log("- current filters:", filters);
      console.log("- API params:", params);

      const response: TransactionsResponse = await apiService.getTransactions(
        params
      );

      console.log("API response:", {
        dataCount: response.data?.length || 0,
        totalCount: response.pagination?.totalCount || 0,
      });

      setTransactions(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Update URL params when filters change
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== "" && value !== 0) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  // Check for payment completion indicators and recent transactions
  useEffect(() => {
    console.log("🔍 Dashboard mounted - checking for payment completion");

    // Check URL parameters
    const urlHasPaymentParams =
      searchParams.get("payment_completed") === "true" ||
      searchParams.get("reset_filters") === "true" ||
      searchParams.get("refresh") === "true";

    // Check localStorage
    const hasRecentPayment = localStorage.getItem("recent_payment_completion");

    console.log("URL params found:", urlHasPaymentParams);
    console.log("Recent payment found:", !!hasRecentPayment);

    if (urlHasPaymentParams || hasRecentPayment) {
      console.log("💥 PAYMENT COMPLETION DETECTED - WILL AUTO-RESET");
      setNeedsAutoReset(true);

      // Clean up
      if (hasRecentPayment) {
        localStorage.removeItem("recent_payment_completion");
      }
      if (urlHasPaymentParams) {
        const params = new URLSearchParams();
        setSearchParams(params);
      }
    } else {
      // NEW: Check for recent transactions to detect payment completion
      console.log(
        "🚀 No explicit payment flags - will check for recent transactions after data loads"
      );

      // Set a flag to check for recent transactions after initial data load
      setTimeout(() => {
        checkForRecentPayments();
      }, 2000);
    }
  }, []); // Run once on mount

  // Function to detect recent payments from transaction data
  const checkForRecentPayments = async () => {
    try {
      console.log("🔍 Checking for recent payments in transaction data...");

      // Get last check time from localStorage (default to 5 minutes ago)
      const lastCheckTime = localStorage.getItem("dashboard_last_check");
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const checkSince = lastCheckTime
        ? parseInt(lastCheckTime)
        : fiveMinutesAgo;

      console.log("Checking for transactions since:", new Date(checkSince));

      // Force a fresh API call to get latest data
      const params: any = {
        page: 1,
        limit: 20, // Get more recent transactions
        sort: "createdAt",
        order: "desc",
        _cacheBust: true,
      };

      const response: TransactionsResponse = await apiService.getTransactions(
        params
      );

      if (response.data && response.data.length > 0) {
        // Check if any transactions were created recently
        const recentTransactions = response.data.filter((transaction) => {
          const transactionTime = new Date(transaction.createdAt).getTime();
          return transactionTime > checkSince;
        });

        console.log(`Found ${recentTransactions.length} recent transactions`);

        if (recentTransactions.length > 0) {
          console.log(
            "🎉 RECENT PAYMENT DETECTED FROM TRANSACTION DATA - TRIGGERING AUTO-RESET"
          );
          setNeedsAutoReset(true);
        }
      }

      // Update last check time
      localStorage.setItem("dashboard_last_check", Date.now().toString());
    } catch (error) {
      console.error("Error checking for recent payments:", error);
    }
  };

  // Simple auto-reset: Click the reset button after a short delay
  useEffect(() => {
    if (needsAutoReset) {
      console.log(
        "🚀 AUTO-RESET TRIGGERED - Will click reset button in 1 second"
      );

      const timer = setTimeout(() => {
        console.log("💆 Attempting to click reset button...");

        if (resetButtonRef.current) {
          console.log("✨ SUCCESS: Clicking reset button programmatically!");
          resetButtonRef.current.click();
        } else {
          console.log(
            "🔧 FALLBACK: Button ref not found, calling function directly"
          );
          resetFiltersAndFetch();
        }

        setNeedsAutoReset(false);
        console.log("🏁 Auto-reset completed");
      }, 1000); // Wait 1 second for component to fully render

      return () => clearTimeout(timer);
    }
  }, [needsAutoReset]);

  // Initial load effect - FORCE clean start
  useEffect(() => {
    if (!hasInitiallyLoaded) {
      console.log("🏁 TransactionsOverview: Initial load starting");
      setHasInitiallyLoaded(true);

      // Check current filter state
      console.log("📊 Current filters at initial load:", filters);

      // If any filters are problematic, force a clean reset
      const hasProblematicFilters =
        filters.status !== "" ||
        filters.school_id !== "" ||
        filters.gateway !== "";

      console.log("🔍 Has problematic filters:", hasProblematicFilters);

      if (hasProblematicFilters || !needsAutoReset) {
        console.log("🧹 Forcing clean start with default filters");
        setTimeout(() => {
          setFilters(defaultFilters);
          setSearchParams(new URLSearchParams());
          setTimeout(() => {
            fetchTransactions(true);
          }, 100);
        }, 100);
      }
    }
  }, []); // Run only once on mount

  // Load transactions when filters change (but not on initial load)
  useEffect(() => {
    if (hasInitiallyLoaded) {
      fetchTransactions();
    }
  }, [filters, hasInitiallyLoaded]);

  // AUTO-RESET WHEN SHOWING 0 TRANSACTIONS
  useEffect(() => {
    // Only trigger if we have loaded data and got 0 transactions
    if (
      !loading &&
      hasInitiallyLoaded &&
      transactions.length === 0 &&
      pagination.totalCount === 0
    ) {
      // Check if we have any active filters that might be causing the issue
      const hasActiveFilters =
        filters.status !== "" ||
        filters.school_id !== "" ||
        filters.gateway !== "";

      console.log("🔴 ZERO TRANSACTIONS DETECTED!");
      console.log("Has active filters:", hasActiveFilters);
      console.log("Current filters:", filters);

      if (hasActiveFilters && !needsAutoReset) {
        console.log(
          "🚨 ZERO TRANSACTIONS WITH ACTIVE FILTERS - AUTO-RESETTING!"
        );
        setNeedsAutoReset(true);
      }
    }
  }, [
    loading,
    hasInitiallyLoaded,
    transactions.length,
    pagination.totalCount,
    filters,
    needsAutoReset,
  ]);

  // Status badge component with proper 4-category classification
  const StatusBadge: React.FC<{ transaction: Transaction }> = ({
    transaction,
  }) => {
    // Use status_category from backend if available, otherwise classify the raw status
    const getDisplayStatus = (): string => {
      if (transaction.status_category) {
        console.log(
          "🎯 Using backend status_category:",
          transaction.status_category,
          "for transaction:",
          transaction.collect_id
        );
        return transaction.status_category;
      }

      console.log(
        "⚙️ Fallback: Classifying raw status on frontend:",
        transaction.status
      );
      return normalizeStatus(transaction.status);
    };

    // Function to normalize and classify status values (fallback for older data)
    const normalizeStatus = (rawStatus: string): string => {
      if (!rawStatus) return "CANCELLED";

      const status = rawStatus.toLowerCase().trim();

      console.log("🏷️  Raw status:", rawStatus, "→ Normalized:", status);

      // SUCCESS - Completed payments
      if (
        ["success", "successful", "completed", "paid", "confirm"].includes(
          status
        )
      ) {
        return "SUCCESS";
      }

      // PENDING - Payments in progress
      if (
        [
          "pending",
          "processing",
          "initiated",
          "in_progress",
          "inprogress",
        ].includes(status)
      ) {
        return "PENDING";
      }

      // FAILED - Failed payments
      if (
        ["failed", "failure", "error", "declined", "rejected"].includes(status)
      ) {
        return "FAILED";
      }

      // CANCELLED - User dropped/cancelled payments
      // NOTE: EDVIRON uses 'USER_DROPPED' for cancelled payments
      if (
        [
          "cancelled",
          "canceled",
          "dropped",
          "abandoned",
          "timeout",
          "user_dropped",
        ].includes(status)
      ) {
        return "CANCELLED";
      }

      // Default case - log unknown status for debugging
      console.warn(
        "⚠️  Unknown payment status:",
        rawStatus,
        "- will analyze and categorize"
      );
      console.log("📊  Status analysis for:", rawStatus);

      // Try to match common patterns if exact match didn't work
      if (
        status.includes("success") ||
        status.includes("paid") ||
        status.includes("complete")
      ) {
        console.log("✅ Pattern match: SUCCESS");
        return "SUCCESS";
      }
      if (
        status.includes("pending") ||
        status.includes("process") ||
        status.includes("progress")
      ) {
        console.log("🔄 Pattern match: PENDING");
        return "PENDING";
      }
      if (
        status.includes("fail") ||
        status.includes("error") ||
        status.includes("decline")
      ) {
        console.log("❌ Pattern match: FAILED");
        return "FAILED";
      }
      if (
        status.includes("cancel") ||
        status.includes("drop") ||
        status.includes("abandon") ||
        status.includes("timeout")
      ) {
        console.log("🚫 Pattern match: CANCELLED");
        return "CANCELLED";
      }

      // If no pattern matches, default to CANCELLED and log for investigation
      console.warn(
        "⚠️  No pattern match found for:",
        rawStatus,
        "- defaulting to CANCELLED"
      );
      return "CANCELLED";
    };

    const getStatusColor = (normalizedStatus: string) => {
      switch (normalizedStatus) {
        case "SUCCESS":
          return "bg-green-100 text-green-800";
        case "PENDING":
          return "bg-yellow-100 text-yellow-800";
        case "FAILED":
          return "bg-red-100 text-red-800";
        case "CANCELLED":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-purple-100 text-purple-800"; // Fallback for debugging
      }
    };

    const displayStatus = getDisplayStatus();
    const statusColor = getStatusColor(displayStatus);

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
        title={`Raw: ${transaction.status} | Category: ${displayStatus}`}
      >
        {displayStatus}
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
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-lg">
              All Transactions
            </h1>
            <p className="mt-2 text-base text-gray-700 font-medium">
              A comprehensive list of all payment transactions with advanced
              filtering and sorting.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchTransactions(true)}
              className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-6 py-2 text-base font-semibold text-white shadow-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span className="animate-pulse mr-2">🔄</span> Refresh
            </button>
            <button
              ref={resetButtonRef}
              onClick={resetFiltersAndFetch}
              className="relative inline-flex items-center justify-center rounded-xl bg-white/70 px-6 py-2 text-base font-semibold text-purple-700 shadow-lg hover:bg-white/90 hover:scale-105 transition-transform duration-200 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <span className="mr-2">🧹</span> Reset Filters
            </button>
          </div>
        </div>

        {/* Auto-reset indicator */}
        {needsAutoReset && (
          <div className="bg-blue-100/60 border border-blue-300 rounded-xl p-4 mb-4 flex items-center shadow animate-fade-in">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-4"></div>
            <div>
              <p className="text-base font-semibold text-blue-800">
                🔄 Auto-resetting filters after payment completion...
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Automatically triggering filter reset to show all transactions.
              </p>
            </div>
          </div>
        )}

        {/* Filters cleared notification */}
        {showFiltersClearedNotification && (
          <div className="bg-yellow-100/60 border border-yellow-300 rounded-xl p-4 mb-4 flex items-center shadow animate-fade-in">
            <svg
              className="h-6 w-6 text-yellow-400 mr-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="text-base font-semibold text-yellow-800">
                Filters cleared to show your new transaction
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                All filters have been reset to display all transactions,
                including your recent payment.
              </p>
            </div>
            <button
              onClick={() => setShowFiltersClearedNotification(false)}
              className="ml-4 text-yellow-400 hover:text-yellow-600 focus:outline-none focus:text-yellow-600"
            >
              <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 mb-8 border border-purple-100 animate-fade-in">
          <h3 className="text-2xl font-bold text-purple-700 mb-6">
            Filters & Sorting
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-purple-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) =>
                  updateFilters({ status: e.target.value, page: 1 })
                }
                className="mt-1 block w-full rounded-xl border-purple-200 py-2 pl-3 pr-10 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow"
              >
                <option value="">All Statuses</option>
                {statusOptions.slice(1).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* School ID Filter */}
            <div>
              <label
                htmlFor="school_id"
                className="block text-sm font-semibold text-purple-700 mb-1"
              >
                School ID
              </label>
              <input
                type="text"
                id="school_id"
                placeholder="Filter by School ID"
                value={filters.school_id}
                onChange={(e) =>
                  updateFilters({ school_id: e.target.value, page: 1 })
                }
                className="mt-1 block w-full rounded-xl border-purple-200 py-2 pl-3 pr-10 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow"
              />
            </div>

            {/* Gateway Filter */}
            <div>
              <label
                htmlFor="gateway"
                className="block text-sm font-semibold text-purple-700 mb-1"
              >
                Gateway
              </label>
              <input
                type="text"
                id="gateway"
                placeholder="Filter by Gateway"
                value={filters.gateway}
                onChange={(e) =>
                  updateFilters({ gateway: e.target.value, page: 1 })
                }
                className="mt-1 block w-full rounded-xl border-purple-200 py-2 pl-3 pr-10 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow"
              />
            </div>

            {/* Sort By */}
            <div>
              <label
                htmlFor="sort"
                className="block text-sm font-semibold text-purple-700 mb-1"
              >
                Sort By
              </label>
              <div className="mt-1 flex space-x-2">
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="block w-full rounded-xl border-purple-200 py-2 pl-3 pr-10 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.order}
                  onChange={(e) => updateFilters({ order: e.target.value })}
                  className="block rounded-xl border-purple-200 py-2 pl-3 pr-10 text-base focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100/80 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow mb-6 animate-fade-in">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-base text-purple-600 font-semibold">
              Loading transactions...
            </p>
          </div>
        )}

        {/* Transactions Table */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden border border-purple-100 animate-fade-in">
            <div className="px-6 py-6">
              <h3 className="text-2xl font-bold text-purple-700 mb-2">
                Transactions{" "}
                <span className="text-base font-normal text-gray-500">
                  ({pagination.totalCount} total)
                </span>
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-purple-400 text-lg font-semibold">
                  No transactions found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-purple-200">
                  <thead className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Collect ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        School ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Order Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Transaction Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Custom Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-purple-700 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/80 divide-y divide-purple-100">
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.collect_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-pink-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-900">
                          {transaction.collect_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                          {transaction.school_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                          {transaction.gateway}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                          {formatCurrency(transaction.order_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                          {transaction.transaction_amount
                            ? formatCurrency(transaction.transaction_amount)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge transaction={transaction} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-900">
                          {transaction.custom_order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-900">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="bg-white/80 px-6 py-4 flex items-center justify-between border-t border-purple-100 sm:px-8">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => updateFilters({ page: filters.page - 1 })}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-purple-200 text-base font-semibold rounded-xl text-purple-700 bg-white/70 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-purple-200 text-base font-semibold rounded-xl text-purple-700 bg-white/70 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base text-purple-700 font-semibold">
                      Showing{" "}
                      <span className="font-bold">
                        {(pagination.currentPage - 1) * filters.limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold">
                        {Math.min(
                          pagination.currentPage * filters.limit,
                          pagination.totalCount
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold">{pagination.totalCount}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          updateFilters({ page: filters.page - 1 })
                        }
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-purple-200 bg-white/70 text-base font-semibold text-purple-500 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          updateFilters({ page: filters.page + 1 })
                        }
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-purple-200 bg-white/70 text-base font-semibold text-purple-500 hover:bg-purple-50 hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsOverview;
