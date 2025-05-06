import React, { useState, useMemo } from "react";
import "../Css/PaymentHistoryTab.css";

const PaymentHistoryTab = ({ payments, formatDate }) => {
  // Local state for filtering
  const [dateFilter, setDateFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Filter the payments based on the current filter values
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesDate = dateFilter ? payment.date === dateFilter : true;
      const matchesCategory = categoryFilter
        ? payment.category === categoryFilter
        : true;
      return matchesDate && matchesCategory;
    });
  }, [payments, dateFilter, categoryFilter]);

  // Group the filtered payments by date
  const groupedFilteredPayments = useMemo(() => {
    return filteredPayments.reduce((acc, payment) => {
      if (!acc[payment.date]) acc[payment.date] = [];
      acc[payment.date].push(payment);
      return acc;
    }, {});
  }, [filteredPayments]);

  // Sort the dates in reverse chronological order
  const sortedPaymentDates = useMemo(() => {
    return Object.keys(groupedFilteredPayments).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [groupedFilteredPayments]);

  return (
    <div className="payment-history-tab">
      <h2>Payment History</h2>
      <div className="payment-filter">
        <div className="form-row">
          <input
            type="date"
            className="date-filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select
            className="category-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Income">Income</option>
            <option value="General">General</option>
          </select>
          <button className="secondary-button">Filter</button>
        </div>
      </div>
      <div className="payment-list">
        {sortedPaymentDates.length === 0 ? (
          <div className="empty-state">
            <p>No payment history available</p>
          </div>
        ) : (
          sortedPaymentDates.map((date) => (
            <div key={date} className="payment-group">
              <div className="payment-date">{formatDate(date)}</div>
              <div className="payment-items">
                {groupedFilteredPayments[date].map((payment, index) => (
                  <div
                    className={`payment-item ${
                      payment.amount > 0 ? "income" : "expense"
                    }`}
                    key={index}
                  >
                    <div className="payment-details">
                      <div className="payment-details">
                        <span className="payment-name">{payment.name}</span>
                        <span className="payment-category">
                          {payment.category || "General"}
                        </span>
                        <span
                          className={`payment-amount ${
                            payment.amount > 0
                              ? "income-amount"
                              : "expense-amount"
                          }`}
                        >
                          {payment.amount > 0 ? "+ " : "- "}₹
                          {Math.abs(payment.amount).toFixed(2)}
                        </span>
                      </div>
                      {payment.note && (
                        <div className="payment-note">
                          <span>{payment.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="payment-summary">
        <div className="summary-card">
          <span className="summary-label">Total Income</span>
          <span className="summary-amount income-amount">
            + ₹
            {filteredPayments
              .reduce(
                (sum, payment) =>
                  sum + (payment.amount > 0 ? payment.amount : 0),
                0
              )
              .toFixed(2)}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Expenses</span>
          <span className="summary-amount expense-amount">
            - ₹
            {Math.abs(
              filteredPayments.reduce(
                (sum, payment) =>
                  sum + (payment.amount < 0 ? payment.amount : 0),
                0
              )
            ).toFixed(2)}
          </span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Net Balance</span>
          <span className="summary-amount">
            ₹
            {filteredPayments
              .reduce((sum, payment) => sum + payment.amount, 0)
              .toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryTab;
