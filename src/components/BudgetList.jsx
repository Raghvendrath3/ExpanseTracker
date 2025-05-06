"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import "../Css/Budget.css";

const BudgetList = ({ onEdit }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser) {
          setError("You must be logged in to view budgets");
          setLoading(false);
          return;
        }

        const userId = currentUser.uid;
        const budgetsRef = collection(db, "budgets");
        const budgetQuery = query(budgetsRef, where("userId", "==", userId));

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          budgetQuery,
          (snapshot) => {
            const budgetList = [];
            snapshot.forEach((doc) => {
              budgetList.push({
                id: doc.id,
                ...doc.data(),
              });
            });
            setBudgets(budgetList);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching budgets:", err);
            setError("Failed to load budgets. Please try again later.");
            setLoading(false);
          }
        );

        // Clean up listener on unmount
        return () => unsubscribe();
      } catch (err) {
        console.error("Error setting up budget listener:", err);
        setError("Failed to load budgets. Please try again later.");
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const handleDelete = async (id) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("You must be logged in to delete budgets");
        return;
      }

      const budgetRef = doc(db, "budgets", id);
      await deleteDoc(budgetRef);
      console.log("Budget deleted successfully");
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget. Please try again later.");
    }
  };

  if (loading) return <div className="loading">Loading budgets...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="budget-list">
      <h2>Your Budgets</h2>
      {budgets.length === 0 ? (
        <p>No budgets found. Create a new budget to get started.</p>
      ) : (
        <ul>
          {budgets.map((budget) => (
            <li key={budget.id} className="budget-item">
              <div className="budget-info">
                <h3>{budget.category}</h3>
                <p className="budget-amount">${budget.amount.toFixed(2)}</p>
                <p className="budget-period">{budget.period}</p>
              </div>
              <div className="budget-actions">
                <button className="edit-btn" onClick={() => onEdit(budget)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(budget.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BudgetList;
