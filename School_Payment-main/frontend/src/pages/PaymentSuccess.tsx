"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

interface PaymentResult {
  collect_id?: string
  status?: string
  amount?: string
  message?: string
}

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get parameters from URL
    const collectId = searchParams.get("collect_id")
    const status = searchParams.get("status")
    const amount = searchParams.get("amount")

    // Set payment completion flag in localStorage for dashboard refresh
    if (status === "success" && collectId) {
      localStorage.setItem(
        "recent_payment_completion",
        JSON.stringify({
          collect_id: collectId,
          timestamp: Date.now(),
          status: status,
        }),
      )
    }

    setPaymentResult({
      collect_id: collectId || "",
      status: status || "",
      amount: amount || "",
      message: status === "success" ? "Payment completed successfully!" : "Payment status updated",
    })

    setLoading(false)
  }, [searchParams])

  const handleGoHome = () => {
    navigate("/make-payment")
  }

  const handleViewTransactions = () => {
    // Set a specific flag for payment completion navigation
    navigate("/dashboard?payment_completed=true&reset_filters=true")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading payment result...</p>
        </div>
      </div>
    )
  }

  const isSuccess = paymentResult.status === "success"

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full">
        <div className="bg-card border border-border rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
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
                    background: ["#f472b6", "#c4b5fd", "#818cf8", "#fbbf24", "#34d399"][Math.floor(Math.random() * 5)],
                  }}
                />
              ))}
            </div>
          )}
          <div className="relative z-10">
            {/* Icon */}
            <div
              className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full ${
                isSuccess ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
              } mb-6`}
            >
              {isSuccess ? (
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <h2 className={`text-3xl font-extrabold ${isSuccess ? "text-green-500" : "text-blue-500"} mb-4`}>
              {isSuccess ? "Payment Successful!" : "Payment Status Updated"}
            </h2>
            {/* Message */}
            <p className="text-lg text-muted-foreground mb-6">{paymentResult.message}</p>
            {/* Payment Details */}
            {paymentResult.collect_id && (
              <div className="bg-secondary border border-border rounded-xl p-4 mb-6 text-left">
                <h3 className="text-sm font-bold text-foreground mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Collection ID:</span>
                    <span className="font-mono text-foreground">{paymentResult.collect_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${isSuccess ? "text-green-500" : "text-blue-500"}`}>
                      {paymentResult.status?.toUpperCase()}
                    </span>
                  </div>
                  {paymentResult.amount && (
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-semibold text-foreground">₹{paymentResult.amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Time:</span>
                    <span className="text-foreground">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Success Message */}
            {isSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-500 font-semibold">
                  Your payment has been processed successfully. You should receive a confirmation email shortly.
                </p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Make Another Payment
              </button>
              <button
                onClick={handleViewTransactions}
                className="w-full flex justify-center py-3 px-4 border border-border rounded-xl shadow-lg text-base font-semibold text-foreground bg-secondary hover:bg-secondary/80 transition-colors duration-200"
              >
                View All Transactions
              </button>
            </div>
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">Payment processed by EDVIRON Payment Gateway</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
