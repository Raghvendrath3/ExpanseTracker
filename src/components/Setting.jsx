"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Css/Setting.css";

const Setting = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    currency: "USD",
    theme: "light",
    notifications: true,
    language: "English",
    exportFormat: "CSV",
  });

  const [themeOptions] = useState(["light", "dark", "system"]);
  const [currencyOptions] = useState([
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "INR",
  ]);
  const [languageOptions] = useState([
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ]);
  const [exportFormatOptions] = useState(["CSV", "PDF", "JSON", "XLSX"]);
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ ...userProfile });
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    // Load saved API key from localStorage
    const savedApiKey = localStorage.getItem("google_cloud_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Load user profile from localStorage
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(parsedProfile);
        setEditedProfile(parsedProfile);
      } catch (e) {
        console.error("Error parsing stored profile:", e);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditedProfile({ ...userProfile });
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditedProfile({ ...userProfile });
  };

  const saveChanges = () => {
    // Save to localStorage
    localStorage.setItem("userProfile", JSON.stringify(editedProfile));
    localStorage.setItem("google_cloud_api_key", apiKey);

    // Update state
    setUserProfile(editedProfile);
    setIsEditing(false);

    // Apply theme change
    applyTheme(editedProfile.theme);

    // Show success message
    setSaveStatus("Settings saved successfully!");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  const resetSettings = () => {
    if (
      window.confirm("Are you sure you want to reset all settings to default?")
    ) {
      const defaultProfile = {
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "123-456-7890",
        currency: "USD",
        theme: "light",
        notifications: true,
        language: "English",
        exportFormat: "CSV",
      };

      localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
      localStorage.removeItem("google_cloud_api_key");

      setUserProfile(defaultProfile);
      setEditedProfile(defaultProfile);
      setApiKey("");

      // Apply default theme
      applyTheme("light");

      setSaveStatus("Settings reset to default values!");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const applyTheme = (theme) => {
    if (theme === "dark") {
      document.body.classList.add("theme-dark");
      document.body.classList.remove("theme-light");
    } else if (theme === "light") {
      document.body.classList.add("theme-light");
      document.body.classList.remove("theme-dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.body.classList.add("theme-dark");
        document.body.classList.remove("theme-light");
      } else {
        document.body.classList.add("theme-light");
        document.body.classList.remove("theme-dark");
      }
    }
  };

  const navigateToFeature = (feature) => {
    navigate(`/${feature}`);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>User Profile</h3>
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedProfile.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedProfile.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={editedProfile.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <p>
              <strong>Name:</strong> {userProfile.name}
            </p>
            <p>
              <strong>Email:</strong> {userProfile.email}
            </p>
            <p>
              <strong>Phone:</strong> {userProfile.phone}
            </p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        {isEditing ? (
          <div className="edit-form">
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={editedProfile.currency}
                onChange={handleInputChange}
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={editedProfile.language}
                onChange={handleInputChange}
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                name="theme"
                value={editedProfile.theme}
                onChange={handleInputChange}
              >
                {themeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="exportFormat">Export Format</label>
              <select
                id="exportFormat"
                name="exportFormat"
                value={editedProfile.exportFormat}
                onChange={handleInputChange}
              >
                {exportFormatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="notifications"
                  checked={editedProfile.notifications}
                  onChange={handleInputChange}
                />
                Enable Notifications
              </label>
            </div>
          </div>
        ) : (
          <div className="preferences-info">
            <p>
              <strong>Currency:</strong> {userProfile.currency}
            </p>
            <p>
              <strong>Language:</strong> {userProfile.language}
            </p>
            <p>
              <strong>Theme:</strong> {userProfile.theme}
            </p>
            <p>
              <strong>Export Format:</strong> {userProfile.exportFormat}
            </p>
            <p>
              <strong>Notifications:</strong>{" "}
              {userProfile.notifications ? "Enabled" : "Disabled"}
            </p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>API Keys</h3>
        <div className="form-group">
          <label htmlFor="googleCloudApiKey">Google Cloud API Key</label>
          <input
            type="password"
            id="googleCloudApiKey"
            value={apiKey}
            onChange={handleApiKeyChange}
            disabled={!isEditing}
          />
          {isEditing && (
            <small className="helper-text">
              This key will be used for receipt scanning and other cloud
              services.
            </small>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h3>Advanced Features</h3>
        <div className="advanced-features">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Expense Prediction</h4>
            <p>
              Analyze your spending patterns and predict future expenses using
              machine learning.
            </p>
            <button
              className="btn-feature"
              onClick={() => navigateToFeature("expense-prediction")}
            >
              Open Prediction Tool
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h4>Receipt Scanner</h4>
            <p>
              Scan receipts with your camera and automatically extract expense
              information.
            </p>
            <button
              className="btn-feature"
              onClick={() => navigateToFeature("receipt-scanner")}
            >
              Open Scanner
            </button>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏦</div>
            <h4>Bank Statement Import</h4>
            <p>
              Import transactions directly from your bank statements in various
              formats.
            </p>
            <button
              className="btn-feature"
              onClick={() => navigateToFeature("statement-import")}
            >
              Import Statements
            </button>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        {isEditing ? (
          <>
            <button className="btn-save" onClick={saveChanges}>
              Save Changes
            </button>
            <button className="btn-cancel" onClick={cancelEditing}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn-edit" onClick={startEditing}>
              Edit Settings
            </button>
            <button className="btn-reset" onClick={resetSettings}>
              Reset to Default
            </button>
          </>
        )}
      </div>

      {saveStatus && <div className="save-status success">{saveStatus}</div>}
    </div>
  );
};

export default Setting;
