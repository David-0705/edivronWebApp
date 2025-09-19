"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { label: "Dashboard", icon: "📊", path: "/dashboard" },
    { label: "All Transactions", icon: "📊", path: "/transactions" },
    { label: "By School", icon: "🏫", path: "/by-school" },
    { label: "Make Payment", icon: "💳", path: "/make-payment" },
    { label: "Status Check", icon: "🔍", path: "/status-check" },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6">
          <h1 className="text-xl font-bold text-foreground">School Payments</h1>
        </div>
        <nav className="px-4">
          {navItems.map((item, index) => {
            const isActive = index === 0 // First item active by default
            return (
              <button
                key={item.label}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors duration-200 mb-1 ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">School Payments Dashboard</h2>
              <div className="flex items-center space-x-4">
                {user && (
                  <>
                    <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default Layout
