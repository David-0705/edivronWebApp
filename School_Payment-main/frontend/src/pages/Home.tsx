"use client"

import type React from "react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the home page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center py-16 px-4">
        <div className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-10 text-center">
          <h1 className="text-5xl font-extrabold text-foreground mb-6">Edviron School Payment System</h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground font-medium">
            A comprehensive payment management system for schools. Create payments, track transactions, and manage
            student fees with ease.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-semibold rounded-xl text-primary-foreground bg-primary shadow-lg hover:bg-primary/90 transition-colors duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-border text-lg font-semibold rounded-xl text-foreground bg-secondary shadow-lg hover:bg-secondary/80 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full shadow-lg mb-4">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Easy Payments</h3>
            <p className="text-muted-foreground text-center">
              Create and process school fee payments through multiple gateways including Edviron, PhonePe, and more.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full shadow-lg mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Transaction Tracking</h3>
            <p className="text-muted-foreground text-center">
              Monitor all transactions with real-time status updates, filtering, and detailed reporting.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col items-center hover:shadow-2xl transition-shadow duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-primary rounded-full shadow-lg mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Secure & Reliable</h3>
            <p className="text-muted-foreground text-center">
              Built with security in mind. All transactions are encrypted and processed through trusted payment
              gateways.
            </p>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="text-center py-4 text-muted-foreground text-sm">
        &copy; {new Date().getFullYear()} Edviron School Payment App. Crafted with{" "}
        <span className="text-foreground">♥</span>
      </footer>
    </div>
  )
}

export default Home
