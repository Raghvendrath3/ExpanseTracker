import React, { useState } from "react";
import "../Css/ExpenseTab.css";

const ExpenseTab = ({
  expenseName,
  setExpenseName,
  expenseAmount,
  setExpenseAmount,
  expenseDate,
  setExpenseDate,
  paymentCategory,
  setPaymentCategory,
  paymentNote,
  setPaymentNote,
  addExpense,
  filterDate,
  setFilterDate,
  customButtons,
  groupedExpenses,
  formatDate,
  editExpense,
  deleteExpense,
  setActiveTab,
}) => {
  const [customCategory, setCustomCategory] = useState("");
  const categories = ["Regular", "Food", "Shopping", "Groceries"];

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === "Other") {
      setPaymentCategory(customCategory);
    } else {
      setPaymentCategory(value);
      setCustomCategory("");
    }
  };

  return (
    <div className="expenses-tab">
      <div className="add-expense-form">
        <h2>Add New Expense</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Expense Name"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
          />
          <input
            type="date"
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
        </div>
        <div className="form-row">
          <select value={paymentCategory} onChange={handleCategoryChange}>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Note (optional)"
            value={paymentNote}
            onChange={(e) => setPaymentNote(e.target.value)}
          />
          <button
            className="primary-button"
            onClick={() => {
              if (expenseName && expenseAmount) {
                addExpense(expenseName, expenseAmount);
              } else {
                alert("Please fill in all required fields.");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>
      <div className="quick-actions">
        <div className="date-filter">
          <h3>Filter by Date</h3>
          <div className="filter-controls">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button
              className="secondary-button"
              onClick={() => setFilterDate("all")}
            >
              View All
            </button>
          </div>
        </div>
        <div className="quick-buttons">
          <h3>Quick Add</h3>
          <div className="quick-button-grid">
            {customButtons.slice(0, 4).map((button, index) => (
              <button
                key={index}
                className="quick-button"
                onClick={() => addExpense(button.name, button.amount)}
              >
                {button.name} - ₹{button.amount}
              </button>
            ))}
            {customButtons.length > 4 && (
              <button
                className="quick-button more-button"
                onClick={() => setActiveTab("quickAdd")}
              >
                More...
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="expenses-list">
        <h2>Your Expenses</h2>
        {Object.keys(groupedExpenses).length === 0 ? (
          <div className="empty-state">
            <p>No expenses found for the selected date</p>
          </div>
        ) : (
          Object.keys(groupedExpenses).map((date) => (
            <div key={date} className="expense-group">
              <div className="expense-date">{formatDate(date)}</div>
              <div className="expense-items">
                {groupedExpenses[date].map((expense, idx) => (
                  <div
                    className="expense-item"
                    key={`${expense.name}-${expense.date}-${idx}`}
                  >
                    <div className="expense-details">
                      <span className="expense-name">{expense.name}</span>
                      <span className="expense-amount">
                        ₹{expense.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="expense-actions">
                      <button
                        className="icon-button edit"
                        onClick={() => editExpense(expense)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-button delete"
                        onClick={() => deleteExpense(expense)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTab;
