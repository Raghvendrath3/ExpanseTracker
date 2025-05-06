import React from "react";
import '../Css/IncomeTab.css'

const IncomeTab = ({
  incomeSource,
  setIncomeSource,
  incomeAmount,
  setIncomeAmount,
  addIncome,
  totalAmount,
  setTotalAmount,
  setSyncStatus,
}) => {
  return (
    <div className="income-tab">
      <div className="add-income-form">
        <h2>Add Income</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Income Source"
            value={incomeSource}
            onChange={(e) => setIncomeSource(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={incomeAmount}
            onChange={(e) => setIncomeAmount(e.target.value)}
          />
          <button
            className="primary-button"
            onClick={() => addIncome(incomeSource, incomeAmount)}
          >
            Add Income
          </button>
        </div>
      </div>
      <div className="update-balance">
        <h2>Update Total Balance</h2>
        <div className="form-row">
          <input
            type="number"
            placeholder="Set total available amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
          />
          <button
            className="primary-button"
            onClick={() => {
              setSyncStatus({ success: true, message: "Balance updated" });
            }}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeTab;
