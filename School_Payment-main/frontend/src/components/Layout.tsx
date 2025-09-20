import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Sun, Moon } from "lucide-react"; // for dark mode toggle icons

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Dark mode state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/dashboard", label: "All Transactions", icon: "📊" },
    { path: "/by-school", label: "By School", icon: "🏫" },
    { path: "/make-payment", label: "Make Payment", icon: "💳" },
    { path: "/status-check", label: "Status Check", icon: "🔍" },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 dark:text-white flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-card dark:bg-gray-800 shadow-lg border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <h1 className="text-3xl font-extrabold tracking-wide">Edviron</h1>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {user && (
                <>
                  <span className="text-base font-medium">Welcome, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-card dark:bg-gray-800 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 justify-center py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-base shadow-md transition-all duration-300
                    ${isActive
                      ? "bg-black text-white"
                      : "bg-white/30 text-black hover:bg-black hover:text-white dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-black dark:hover:text-white"
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-10 px-2">{children}</main>

      {/* Footer */}
      <footer className="text-center py-4 text-muted-foreground text-sm dark:text-gray-400">
        &copy; {new Date().getFullYear()} School Payment App. Crafted with <span className="text-foreground">♥</span>
      </footer>
    </div>
  );
};

export default Layout;
