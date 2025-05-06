"use client";

// App.jsx
import { useEffect, useState } from "react";
import "./Css/GlobalStyle.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
import ExpTrack from "./pages/ExpTrack";
import BudgetTab from "./pages/BudgetTab";
import Profile from "./components/Profile";
import Setting from "./components/Setting";
import ExpensePrediction from "./components/ExpensePrediction";
import ReceiptScanner from "./components/ReceiptScanner";
import StatementImport from "./components/StatementImport";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const App = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/home"
          element={user ? <Home /> : <Navigate to="/auth" />}
        />
        <Route path="/ExpTrack" element={<ExpTrack />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/BudgetTab" element={<BudgetTab />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Setting />} />
        <Route path="/expense-prediction" element={<ExpensePrediction />} />
        <Route path="/receipt-scanner" element={<ReceiptScanner />} />
        <Route path="/statement-import" element={<StatementImport />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
};

export default App;
