import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the home page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      {/* Hero Section with glassmorphism */}
      <main className="flex-1 flex flex-col justify-center items-center py-16 px-2">
        <div className="w-full max-w-3xl bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center animate-fade-in">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-6 drop-shadow-lg animate-fade-in">
            Edviron School Payment System
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-lg text-white/80 font-medium animate-fade-in">
            A comprehensive payment management system for schools. Create
            payments, track transactions, and manage student fees with ease.
          </p>
          <div className="mt-8 flex justify-center space-x-4 animate-fade-in">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-pink-500 to-indigo-500 shadow-lg hover:scale-105 transition-transform duration-200"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-white/40 text-lg font-semibold rounded-xl text-indigo-700 bg-white/70 shadow-lg hover:bg-white/90 hover:text-pink-500 transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Feature Grid with animated cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto animate-fade-in">
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full shadow-lg mb-4">
              <span className="text-3xl">💸</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Easy Payments</h3>
            <p className="text-white/80">
              Create and process school fee payments through multiple gateways
              including Edviron, PhonePe, and more.
            </p>
          </div>
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Transaction Tracking
            </h3>
            <p className="text-white/80">
              Monitor all transactions with real-time status updates, filtering,
              and detailed reporting.
            </p>
          </div>
          <div className="bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col items-center hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg mb-4">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Secure & Reliable
            </h3>
            <p className="text-white/80">
              Built with security in mind. All transactions are encrypted and
              processed through trusted payment gateways.
            </p>
          </div>
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

export default Home;
