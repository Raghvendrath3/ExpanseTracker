"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import "../Css/Budget.css";

const BudgetForm = ({ editBudget, onSave }) => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editBudget) {
      setCategory(editBudget.category || "");
      setAmount(editBudget.amount ? editBudget.amount.toString() : "");
      setPeriod(editBudget.period || "monthly");
    }
  }, [editBudget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!category.trim()) {
      setError("Category is required");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("You must be logged in to save budgets");
        setLoading(false);
        return;
      }

      const budgetData = {
        category,
        amount: Number(amount),
        period,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editBudget) {
        // Update existing budget
        const budgetRef = doc(db, "budgets", editBudget.id);
        await updateDoc(budgetRef, {
          ...budgetData,
          updatedAt: serverTimestamp(),
        });
        console.log("Budget updated successfully");
      } else {
        // Add new budget
        const budgetsRef = collection(db, "budgets");
        await addDoc(budgetsRef, budgetData);
        console.log("Budget added successfully");
      }

      // Reset form
      setCategory("");
      setAmount("");
      setPeriod("monthly");
      setLoading(false);

      if (onSave) onSave();
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="budget-form">
      <h2>{editBudget ? "Edit Budget" : "Create New Budget"}</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Groceries, Rent, Entertainment"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="period">Budget Period</label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading
            ? "Saving..."
            : editBudget
            ? "Update Budget"
            : "Create Budget"}
        </button>
      </form>
    </div>
  );
};

export default BudgetForm;
