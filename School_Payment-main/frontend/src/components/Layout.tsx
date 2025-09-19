import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-lg bg-white/30 shadow-lg border-b border-white/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-extrabold text-white drop-shadow-lg tracking-wide animate-fade-in">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Edviron School Payments
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <span className="text-base text-white/80 font-medium animate-fade-in">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-200"
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
      <nav className="backdrop-blur-lg bg-white/20 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 justify-center py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold text-base shadow-md transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105"
                      : "bg-white/30 text-white/80 hover:bg-white/50 hover:text-indigo-700"
                  } animate-fade-in`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content with glassmorphism card */}
      <main className="flex-1 flex justify-center items-center py-10 px-2">
        <div className="w-full max-w-4xl bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-white/70 text-sm animate-fade-in">
        &copy; {new Date().getFullYear()} Edviron School Payment App. Crafted
        with <span className="text-pink-400">♥</span>
      </footer>
    </div>
  );
};

export default Layout;
