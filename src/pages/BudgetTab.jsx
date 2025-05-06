"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig.js";
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import BudgetForm from "../components/BudgetForm";
import BudgetList from "../components/BudgetList";
import BudgetAlerts from "../components/BudgetAlerts";
import BudgetSuggestions from "../components/BudgetSuggestions";

const BudgetTab = () => {
  const [budgets, setBudgets] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [userId] = useState("defaultUser"); // Replace with actual user ID logic
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Firestore references
  const budgetsRef = doc(db, "users", userId, "data", "budgets");
  const expensesRef = doc(db, "users", userId, "data", "expenses");
  const incomesRef = doc(db, "users", userId, "data", "incomes");

  // Real-time listener for Firestore data
  useEffect(() => {
    const unsubscribeBudgets = onSnapshot(budgetsRef, (snapshot) => {
      setBudgets(snapshot.exists() ? snapshot.data() : {});
    });

    const unsubscribeExpenses = onSnapshot(expensesRef, (snapshot) => {
      setExpenses(snapshot.exists() ? snapshot.data().list || [] : []);
    });

    const unsubscribeIncomes = onSnapshot(incomesRef, (snapshot) => {
      setIncomes(snapshot.exists() ? snapshot.data().list || [] : []);
    });

    setLoading(false);

    return () => {
      unsubscribeBudgets();
      unsubscribeExpenses();
      unsubscribeIncomes();
    };
  }, [userId, budgetsRef, expensesRef, incomesRef]);

  // Sync budgets to Firestore whenever they change
  useEffect(() => {
    const syncBudgets = async () => {
      try {
        await setDoc(budgetsRef, budgets);
      } catch (error) {
        console.error("Error syncing budgets to Firestore:", error);
      }
    };

    if (!loading) {
      syncBudgets();
    }
  }, [budgets, budgetsRef, loading]);

  const handleAddBudget = async (category, amount) => {
    const newBudgets = {
      ...budgets,
      [category]: amount,
    };
    setBudgets(newBudgets);
  };

  const handleDeleteBudget = async (category) => {
    const newBudgets = { ...budgets };
    delete newBudgets[category];
    setBudgets(newBudgets);

    try {
      await updateDoc(budgetsRef, {
        [category]: deleteField(),
      });
    } catch (error) {
      console.error("Error deleting budget from Firestore:", error);
    }
  };

  return (
    <div className="budget-tab">
      <button onClick={() => navigate(-1)} className="back-button">
        Go Back
      </button>
      <div className="budget-container">
        <div className="budget-column">
          <BudgetForm onAddBudget={handleAddBudget} />
          <BudgetList budgets={budgets} onDeleteBudget={handleDeleteBudget} />
        </div>
        <div className="budget-column">
          <BudgetAlerts expenses={expenses} budgets={budgets} />
          <BudgetSuggestions expenses={expenses} incomes={incomes} />
        </div>
      </div>
    </div>
  );
};

export default BudgetTab;
