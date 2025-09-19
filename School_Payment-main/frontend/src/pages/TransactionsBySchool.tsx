"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { apiService } from "../services/api"
import type { Transaction, TransactionsResponse } from "../types"

const TransactionsBySchool: React.FC = () => {
  const [selectedSchoolId, setSelectedSchoolId] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Predefined school IDs (in real app, this would come from API)
  const commonSchoolIds = ["65b0e6293e9f76a9694d84b4", "school123", "school456", "school789"]

  // Fetch transactions for selected school
  const fetchTransactionsBySchool = async () => {
    if (!selectedSchoolId.trim()) {
      setTransactions([])
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
      })
      return
    }

    try {
      setLoading(true)
      setError("")

      const response: TransactionsResponse = await apiService.getTransactionsBySchool(selectedSchoolId, {
        page,
        limit,
      })

      setTransactions(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch transactions")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  // Load transactions when school ID or page changes
  useEffect(() => {
    fetchTransactionsBySchool()
  }, [selectedSchoolId, page])

  // Reset page when school changes
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId)
    setPage(1)
  }

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case "success":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        case "failed":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
      >
        {status}
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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border">
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Transactions by School</h1>
          <p className="mt-2 text-base text-muted-foreground">
            View all transactions for a specific school by entering or selecting a school ID.
          </p>
        </div>
        <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Select School</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-muted-foreground">
                School ID
              </label>
              <div className="mt-1 flex rounded-xl shadow-sm">
                <input
                  type="text"
                  id="schoolId"
                  placeholder="Enter school ID (e.g., 65b0e6293e9f76a9694d84b4)"
                  value={selectedSchoolId}
                  onChange={(e) => handleSchoolChange(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
                />
                <button
                  onClick={fetchTransactionsBySchool}
                  className="inline-flex items-center px-6 py-3 border border-l-0 border-border rounded-r-xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors duration-200"
                >
                  🔍 Search
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Or select from common school IDs:
              </label>
              <div className="flex flex-wrap gap-2">
                {commonSchoolIds.map((schoolId) => (
                  <button
                    key={schoolId}
                    onClick={() => handleSchoolChange(schoolId)}
                    className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors duration-200 border ${
                      selectedSchoolId === schoolId
                        ? "bg-primary text-primary-foreground border-border"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
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
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-2 text-base text-muted-foreground">Loading transactions...</p>
          </div>
        )}
        {!loading && selectedSchoolId && (
          <div className="bg-card rounded-3xl shadow-2xl p-8 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-2">Transactions for School: {selectedSchoolId}</h3>
            <p className="mb-4 text-base text-muted-foreground">
              {transactions.length > 0 ? (
                <>
                  {pagination.totalCount} total transactions found
                  {pagination.totalPages > 1 && ` (Page ${pagination.currentPage} of ${pagination.totalPages})`}
                </>
              ) : (
                "No transactions found for this school"
              )}
            </p>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground text-6xl mb-4">📝</div>
                <p className="text-foreground text-lg">No transactions found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Try a different school ID or check if the school has any transactions.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl shadow-lg">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                          Collect ID
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
                          Custom Order ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                      {transactions.map((transaction) => (
                        <tr key={transaction.collect_id} className="hover:bg-muted/50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                            {transaction.collect_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{transaction.gateway}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {formatCurrency(transaction.order_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {transaction.transaction_amount ? formatCurrency(transaction.transaction_amount) : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={transaction.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                            {transaction.custom_order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            <div>
                              <div className="font-bold">{transaction.student_name}</div>
                              <div className="text-muted-foreground">{transaction.student_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {formatDate(transaction.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-base text-foreground">
                      Showing <span className="font-bold">{(pagination.currentPage - 1) * limit + 1}</span> to{" "}
                      <span className="font-bold">
                        {Math.min(pagination.currentPage * limit, pagination.totalCount)}
                      </span>{" "}
                      of <span className="font-bold">{pagination.totalCount}</span> results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="bg-card rounded-3xl shadow-2xl p-8 text-center border border-border">
            <div className="text-muted-foreground text-6xl mb-4">🏫</div>
            <h3 className="text-lg font-bold text-foreground mb-2">Select a School</h3>
            <p className="text-muted-foreground">
              Enter a school ID above or select from the common school IDs to view transactions.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsBySchool
