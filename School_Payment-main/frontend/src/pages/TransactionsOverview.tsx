"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import type { Transaction, TransactionsResponse } from "../types"

const TransactionsOverview: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  // Default clean filters
  const defaultFilters = {
    page: 1,
    limit: 10,
    sort: "createdAt",
    order: "desc",
    status: "",
    school_id: "",
    gateway: "",
  }

  const [filters, setFilters] = useState(defaultFilters)

  // Available filter options
  const statusOptions = ["", "PENDING", "SUCCESS", "FAILED", "CANCELLED"]
  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "payment_time", label: "Payment Time" },
    { value: "order_amount", label: "Order Amount" },
    { value: "transaction_amount", label: "Transaction Amount" },
    { value: "status", label: "Status" },
  ]

  // Fetch transactions
  const fetchTransactions = async (forceFresh = false) => {
    try {
      setLoading(true)
      setError("")

      const params: any = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "" && value !== 0),
      )

      const response: TransactionsResponse = await apiService.getTransactions(params)

      setTransactions(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || "Failed to fetch transactions")
    } finally {
      setLoading(false)
    }
  }

  // Update filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
  }

  // Initial load
  useEffect(() => {
    fetchTransactions()
  }, [filters])

  // Status badge component
  const StatusBadge: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const getStatusColor = (status: string) => {
      switch (status.toUpperCase()) {
        case "SUCCESS":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        case "PENDING":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        case "FAILED":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        case "CANCELLED":
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        default:
          return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      }
    }

    const displayStatus = transaction.status_category || transaction.status.toUpperCase()
    const statusColor = getStatusColor(displayStatus)

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
        {displayStatus}
      </span>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN")
  }

  return (
    <div className="min-h-screen py-10 px-2 sm:px-8 flex flex-col items-center justify-start bg-background">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-4xl font-extrabold text-foreground">All Transactions</h1>
            <p className="mt-2 text-base text-muted-foreground font-medium">
              A comprehensive list of all payment transactions with advanced filtering and sorting.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => fetchTransactions(true)}
              className="relative inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className="mr-2">🔄</span> Refresh
            </button>
            <button
              onClick={() => {
                setFilters(defaultFilters)
                fetchTransactions(true)
              }}
              className="relative inline-flex items-center justify-center rounded-xl bg-secondary px-6 py-2 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/80 transition-colors duration-200 border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <span className="mr-2">🧹</span> Reset Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card shadow-xl rounded-2xl p-8 mb-8 border border-border">
          <h3 className="text-2xl font-bold text-foreground mb-6">Filters & Sorting</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-foreground mb-1">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2 px-3 text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
              <label htmlFor="school_id" className="block text-sm font-semibold text-foreground mb-1">
                School ID
              </label>
              <input
                type="text"
                id="school_id"
                placeholder="Filter by School ID"
                value={filters.school_id}
                onChange={(e) => updateFilters({ school_id: e.target.value, page: 1 })}
                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2 px-3 text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
            </div>

            {/* Gateway Filter */}
            <div>
              <label htmlFor="gateway" className="block text-sm font-semibold text-foreground mb-1">
                Gateway
              </label>
              <input
                type="text"
                id="gateway"
                placeholder="Filter by Gateway"
                value={filters.gateway}
                onChange={(e) => updateFilters({ gateway: e.target.value, page: 1 })}
                className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2 px-3 text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
              />
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort" className="block text-sm font-semibold text-foreground mb-1">
                Sort By
              </label>
              <div className="mt-1 flex space-x-2">
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="block w-full rounded-xl border border-gray-300 dark:border-gray-600 py-2 px-3 text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
                  className="block w-28 rounded-xl border border-gray-300 dark:border-gray-600 py-2 px-3 text-base bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200"
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
          <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-xl shadow mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-base text-muted-foreground font-semibold">Loading transactions...</p>
          </div>
        )}

        {/* Transactions Table */}
        {!loading && (
          <div className="bg-card shadow-2xl rounded-2xl overflow-hidden border border-border">
            <div className="px-6 py-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Transactions{" "}
                <span className="text-base font-normal text-muted-foreground">({pagination.totalCount} total)</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg font-semibold">No transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        School ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Order Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Transaction Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                        Payment Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {transactions.map((transaction) => (
                      <tr key={transaction.collect_id} className="hover:bg-muted/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                          {transaction.collect_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{transaction.school_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{transaction.gateway}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {formatCurrency(transaction.order_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {transaction.transaction_amount ? formatCurrency(transaction.transaction_amount) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge transaction={transaction} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {transaction.payment_time
                            ? formatDate(transaction.payment_time)
                            : formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="bg-card px-6 py-4 flex items-center justify-between border-t border-border sm:px-8">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => updateFilters({ page: filters.page - 1 })}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-4 py-2 border border-border text-base font-semibold rounded-xl text-foreground bg-background hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                    disabled={!pagination.hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-border text-base font-semibold rounded-xl text-foreground bg-background hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base text-foreground font-semibold">
                      Showing <span className="font-bold">{(pagination.currentPage - 1) * filters.limit + 1}</span> to{" "}
                      <span className="font-bold">
                        {Math.min(pagination.currentPage * filters.limit, pagination.totalCount)}
                      </span>{" "}
                      of <span className="font-bold">{pagination.totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => updateFilters({ page: filters.page - 1 })}
                        disabled={!pagination.hasPrevPage}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-border bg-background text-base font-semibold text-foreground hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => updateFilters({ page: filters.page + 1 })}
                        disabled={!pagination.hasNextPage}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-border bg-background text-base font-semibold text-foreground hover:bg-muted transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}

export default TransactionsOverview
