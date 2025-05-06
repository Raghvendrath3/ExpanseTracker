import React from "react";
import '../Css/BalanceHeader.css';

const BalanceHeader = ({
  totalAmount,
  calculateTotalSpent,
  calculateRemaining,
}) => {
  return (
    <header className="tracker-header">
      <div className="balance-summary">
        <div className="balance-card">
          <span className="balance-label">Available</span>
          <span className="balance-amount">
            ₹{parseFloat(totalAmount || 0).toFixed(2)}
          </span>
        </div>
        <div className="balance-card">
          <span className="balance-label">Spent</span>
          <span className="balance-amount">
            ₹{calculateTotalSpent().toFixed(2)}
          </span>
        </div>
        <div className="balance-card">
          <span className="balance-label">Remaining</span>
          <span className="balance-amount">
            ₹{calculateRemaining().toFixed(2)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default BalanceHeader;
