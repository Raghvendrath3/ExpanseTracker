"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "./Home.css";
import "./Navbar.css";
import Navbar from "./Navbar.jsx";
import {
  FaChartLine,
  FaSignOutAlt,
  FaPlus,
  FaCoffee,
  FaShoppingBag,
  FaUtensils,
  FaCar,
  FaSpinner,
  FaCog,
} from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Handle authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUserName(user.displayName || user.email.split("@")[0] || "there");
        setUser(user);
        setLoading(false);
      } else {
        // User is not signed in, but we'll only redirect after showing loading briefly
        setAuthChecked(true);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Handle redirection after auth check if needed
  useEffect(() => {
    if (authChecked && !user) {
      // Show preloader for at least 1 second before redirecting
      const redirectTimer = setTimeout(() => {
        navigate("/auth");
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [authChecked, user, navigate]);

  const handleLogout = () => {
    setLoading(true); // Show loader during logout too
    signOut(auth)
      .then(() => {
        navigate("/auth");
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
        setLoading(false);
      });
  };

  const goToExpenseTracker = () => {
    navigate("/ExpTrack");
  };

  const goToSettings = () => {
    navigate("/settings");
  };

  const addNewExpense = () => {
    navigate("/ExpTrack", { state: { openAddExpense: true } });
  };

  // Render preloader if loading or during redirect
  if (loading || (authChecked && !user)) {
    return (
      <div className="preloader">
        <div className="spinner">
          <FaSpinner className="spinning-icon" />
        </div>
        <p>Authenticating...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="home-page">
        <header className="home-header">
          <h1 id="welcome-line">Welcome to Your Financial Dashboard</h1>
          <p>
            Hello, <span id="User-name">{userName}</span> ! Track, manage, and
            visualize your expenses with our powerful tools. Take control of
            your spending habits and reach your financial goals faster.
          </p>
        </header>

        <section className="home-content">
          <div className="overview-card">
            <h2>Your Financial Hub</h2>
            <p>
              SpendWise helps you monitor your expenses, set budgets, and
              visualize your spending patterns. Our intuitive interface makes
              financial management simple and effective.
            </p>

            <div className="app-stats">
              <div className="stat">
                <span className="stat-icon">📊</span>
                <span className="stat-text">Visualize Trends</span>
              </div>
              <div className="stat">
                <span className="stat-icon">🎯</span>
                <span className="stat-text">Set Goals</span>
              </div>
              <div className="stat">
                <span className="stat-icon">💰</span>
                <span className="stat-text">Save Money</span>
              </div>
            </div>

            <h3 style={{ marginTop: "2rem", marginBottom: "0.5rem" }}>
              Quick Add Expense
            </h3>
            <div className="quick-expense">
              <div className="expense-pill">
                <FaCoffee
                  className="expense-icon"
                  style={{ color: "#795548" }}
                />{" "}
                Coffee
              </div>
              <div className="expense-pill">
                <FaShoppingBag
                  className="expense-icon"
                  style={{ color: "#9c27b0" }}
                />{" "}
                Shopping
              </div>
              <div className="expense-pill">
                <FaUtensils
                  className="expense-icon"
                  style={{ color: "#ff9800" }}
                />{" "}
                Dining
              </div>
              <div className="expense-pill">
                <FaCar className="expense-icon" style={{ color: "#2196f3" }} />{" "}
                Transport
              </div>
            </div>
          </div>

          <div className="features-card">
            <h2>Powerful Features</h2>
            <ul>
              <li>Smart expense categorization with AI suggestions</li>
              <li>Customizable budgets with reminder alerts</li>
              <li>Interactive data visualization with trend analysis</li>
              <li>Receipt scanning and automatic data extraction</li>
              <li>Recurring expense tracking and forecasting</li>
              <li>Goal setting with progress tracking</li>
              <li>Multi-currency support for international expenses</li>
              <li>Secure cloud backup and synchronization</li>
            </ul>
          </div>
        </section>

        <footer className="home-footer">
          <button className="btn primary-btn" onClick={goToExpenseTracker}>
            <FaChartLine /> Go to Expense Tracker
          </button>
          <button className="btn secondary-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </footer>
      </div>

      <div className="floating-add-btn" onClick={addNewExpense}>
        <FaPlus />
      </div>

      <div
        className="floating-settings-btn"
        onClick={goToSettings}
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a2a6c, #b21f1f)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          zIndex: "999",
        }}
      >
        <FaCog />
      </div>
    </>
  );
};

export default Home;
