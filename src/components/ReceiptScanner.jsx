"use client";

import { useState, useEffect, useRef } from "react";
import "../Css/ReceiptScanner.css";

const ReceiptScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load API key from localStorage
    const savedApiKey = localStorage.getItem("google_cloud_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setSuccessMessage("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Check if file is an image
      if (!file.type.match("image.*")) {
        setError("Please select an image file (JPEG, PNG, etc.)");
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setError("");
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanResult(null);
      setSuccessMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const scanReceipt = async () => {
    if (!selectedFile) {
      setError("Please select a receipt image first");
      return;
    }

    if (!apiKey) {
      setError("Google Cloud API Key is required. Please add it in Settings.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Mock API call for demonstration
      // In a real application, you would call the Google Cloud Vision API here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulated response - would come from the Google Cloud Vision API
      const mockResult = {
        merchant: "Grocery Store",
        date: "2023-09-15",
        total: "$87.65",
        items: [
          { name: "Bread", price: "$3.99" },
          { name: "Milk", price: "$4.50" },
          { name: "Eggs", price: "$5.99" },
          { name: "Vegetables", price: "$12.45" },
          { name: "Chicken", price: "$15.75" },
          { name: "Cereal", price: "$4.99" },
          { name: "Orange Juice", price: "$3.99" },
        ],
        taxAmount: "$7.50",
      };

      setScanResult(mockResult);
    } catch (err) {
      console.error("Error scanning receipt:", err);
      setError("Failed to scan receipt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setScanResult(null);
    setError("");
    setSuccessMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addToExpenses = () => {
    if (!scanResult) return;

    try {
      // Get existing expenses from localStorage
      const existingExpenses = JSON.parse(
        localStorage.getItem("expenses") || "[]"
      );

      // Format the total amount (remove $ and convert to number)
      const totalAmount = Number.parseFloat(scanResult.total.replace("$", ""));

      // Create new expense entry
      const newExpense = {
        id: Date.now().toString(),
        date: scanResult.date,
        merchant: scanResult.merchant,
        category: "Groceries", // Default category
        amount: totalAmount,
        description: `Receipt scan: ${scanResult.items.length} items`,
        items: scanResult.items,
        paymentMethod: "Credit Card", // Default payment method
        taxAmount: Number.parseFloat(scanResult.taxAmount.replace("$", "")),
        receiptImage: previewUrl,
        createdAt: new Date().toISOString(),
      };

      // Add to expenses array
      existingExpenses.push(newExpense);

      // Save back to localStorage
      localStorage.setItem("expenses", JSON.stringify(existingExpenses));

      // Show success message
      setSuccessMessage("Receipt successfully added to expenses!");

      // Reset after a delay
      setTimeout(() => {
        resetScanner();
      }, 2000);
    } catch (err) {
      console.error("Error adding to expenses:", err);
      setError("Failed to add to expenses. Please try again.");
    }
  };

  return (
    <div className="receipt-scanner-container">
      <h2>Receipt Scanner</h2>

      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="file-input"
          id="receipt-file-input"
        />
        <label htmlFor="receipt-file-input" className="file-label">
          <div className="upload-icon">
            <i className="fa fa-cloud-upload"></i>
          </div>
          <p>Drag & drop a receipt image here or click to browse</p>
          <span className="browse-button">Browse Files</span>
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {previewUrl && (
        <div className="preview-container">
          <h3>Receipt Image Preview</h3>
          <div className="image-preview">
            <img src={previewUrl || "/placeholder.svg"} alt="Receipt preview" />
          </div>

          <div className="action-buttons">
            <button
              className="scan-button"
              onClick={scanReceipt}
              disabled={isLoading}
            >
              {isLoading ? "Scanning..." : "Scan Receipt"}
            </button>
            <button
              className="reset-button"
              onClick={resetScanner}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Analyzing receipt...</p>
        </div>
      )}

      {scanResult && (
        <div className="scan-results">
          <h3>Scan Results</h3>

          <div className="result-info">
            <p>
              <strong>Merchant:</strong> {scanResult.merchant}
            </p>
            <p>
              <strong>Date:</strong> {scanResult.date}
            </p>
            <p>
              <strong>Total Amount:</strong> {scanResult.total}
            </p>
            <p>
              <strong>Tax Amount:</strong> {scanResult.taxAmount}
            </p>
          </div>

          <div className="items-list">
            <h4>Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {scanResult.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button className="add-button" onClick={addToExpenses}>
              Add to Expenses
            </button>
            <button className="reset-button" onClick={resetScanner}>
              Scan Another
            </button>
          </div>
        </div>
      )}

      <div className="info-text">
        <p>
          <strong>Note:</strong> This scanner uses Google Cloud Vision API to
          extract information from your receipts. Please ensure your receipt
          image is clear and well-lit for the best results.
        </p>
        {!apiKey && (
          <p className="warning">
            <strong>Warning:</strong> Google Cloud API Key is not configured.
            Please add it in the Settings to use this feature.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReceiptScanner;
