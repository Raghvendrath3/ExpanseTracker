import React from "react";
import '../css/TabNavigation.css';

const TabNavigation = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-navigation">
      <button
        className={
          activeTab === "expenses" ? "tab-button active" : "tab-button"
        }
        onClick={() => setActiveTab("expenses")}
      >
        Expenses
      </button>
      <button
        className={activeTab === "income" ? "tab-button active" : "tab-button"}
        onClick={() => setActiveTab("income")}
      >
        Income
      </button>
      <button
        className={
          activeTab === "quickAdd" ? "tab-button active" : "tab-button"
        }
        onClick={() => setActiveTab("quickAdd")}
      >
        Quick Add
      </button>
      <button
        className={
          activeTab === "paymentHistory" ? "tab-button active" : "tab-button"
        }
        onClick={() => setActiveTab("paymentHistory")}
      >
        Payment History
      </button>
      <button
        className={
          activeTab === "settings" ? "tab-button active" : "tab-button"
        }
        onClick={() => setActiveTab("settings")}
      >
        Settings
      </button>
    </div>
  );
};

export default TabNavigation;
