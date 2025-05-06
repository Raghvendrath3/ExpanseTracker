"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/SettingTab.css";

const SettingsTab = ({
  resetData,
  forceSync,
  userId,
  totalAmount,
  customButtons,
  payments,
  expenses,
  setSyncStatus,
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("general");

  const navigateToFeature = (feature) => {
    navigate(`/${feature}`);
  };

  return (
    <div className="settings-tab">
      <h2>Settings</h2>

      <div className="settings-navigation">
        <button
          className={activeSection === "general" ? "active" : ""}
          onClick={() => setActiveSection("general")}
        >
          General
        </button>
        <button
          className={activeSection === "advanced" ? "active" : ""}
          onClick={() => setActiveSection("advanced")}
        >
          Advanced Features
        </button>
        <button
          className={activeSection === "data" ? "active" : ""}
          onClick={() => setActiveSection("data")}
        >
          Data Management
        </button>
      </div>

      {activeSection === "general" && (
        <>
          <div className="settings-section">
            <h3>User Information</h3>
            <div className="user-info">
              <p>
                <strong>User ID:</strong>{" "}
                {userId ? userId.substring(0, 8) + "..." : "Not signed in"}
              </p>
              <p>
                <strong>Storage:</strong> Using Firebase Cloud Storage
              </p>
            </div>
          </div>

          <div className="settings-section">
            <h3>About</h3>
            <div className="about-info">
              <p>Expense Tracker v1.2.0</p>
              <p>Built with React and Firebase</p>
              <p>© 2025 YourAppName</p>
            </div>
          </div>
        </>
      )}

      {activeSection === "advanced" && (
        <div className="settings-section">
          <h3>Advanced Features</h3>
          <div className="advanced-features">
            <div className="feature-card">
              <h4>Expense Prediction</h4>
              <p>Analyze your spending patterns and predict future expenses.</p>
              <button
                className="feature-button"
                onClick={() => navigateToFeature("expense-prediction")}
              >
                Open Prediction Tool
              </button>
            </div>

            <div className="feature-card">
              <h4>Receipt Scanner</h4>
              <p>
                Scan receipts and automatically extract expense information.
              </p>
              <button
                className="feature-button"
                onClick={() => navigateToFeature("receipt-scanner")}
              >
                Open Scanner
              </button>
            </div>

            <div className="feature-card">
              <h4>Bank Statement Import</h4>
              <p>Import transactions directly from your bank statements.</p>
              <button
                className="feature-button"
                onClick={() => navigateToFeature("statement-import")}
              >
                Import Statements
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === "data" && (
        <>
          <div className="settings-section">
            <h3>Data Management</h3>
            <div className="settings-actions">
              <button className="danger-button" onClick={resetData}>
                Reset All Data
              </button>
              <button className="primary-button" onClick={forceSync}>
                Force Sync with Cloud
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Data Export</h3>
            <div className="settings-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  const exportData = {
                    expenses,
                    totalAmount,
                    customButtons,
                    payments,
                    exportDate: new Date().toISOString(),
                  };
                  const dataStr = JSON.stringify(exportData, null, 2);
                  const dataUri =
                    "data:application/json;charset=utf-8," +
                    encodeURIComponent(dataStr);
                  const exportFileDefaultName = "expense_tracker_data.json";
                  const linkElement = document.createElement("a");
                  linkElement.setAttribute("href", dataUri);
                  linkElement.setAttribute("download", exportFileDefaultName);
                  linkElement.click();
                  setSyncStatus({
                    success: true,
                    message: "Data exported successfully",
                  });
                }}
              >
                Export Data (JSON)
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  let csvContent = "data:text/csv;charset=utf-8,";
                  csvContent += "Name,Amount,Date,Category,Note\n";
                  payments.forEach((payment) => {
                    const row = [
                      `"${payment.name}"`,
                      payment.amount,
                      payment.date,
                      `"${payment.category || "General"}"`,
                      `"${payment.note || ""}"`,
                    ].join(",");
                    csvContent += row + "\n";
                  });
                  const encodedUri = encodeURI(csvContent);
                  const link = document.createElement("a");
                  link.setAttribute("href", encodedUri);
                  link.setAttribute("download", "expense_tracker_payments.csv");
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  setSyncStatus({
                    success: true,
                    message: "CSV exported successfully",
                  });
                }}
              >
                Export Payments (CSV)
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SettingsTab;
