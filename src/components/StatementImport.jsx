"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import "../Css/StatementImport.css";

const StatementImport = () => {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [transactionType, setTransactionType] = useState("expense");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Reset states when a new file is selected
    setTransactions([]);
    setError(null);
    setSuccess(null);
  };

  const parseCSV = (csvText) => {
    try {
      const lines = csvText.split("\n");
      if (lines.length <= 1) {
        throw new Error("CSV file appears to be empty or invalid");
      }

      const headers = lines[0].split(",").map((header) => header.trim());

      // Validate required headers
      const requiredHeaders = ["date", "amount", "description"];
      const missingHeaders = requiredHeaders.filter(
        (header) =>
          !headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`
        );
      }

      const parsedTransactions = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(",").map((value) => value.trim());

        // Skip if we don't have enough values
        if (values.length < headers.length) continue;

        const transaction = {};

        headers.forEach((header, index) => {
          transaction[header] = values[index];
        });

        // Try to standardize some fields
        const dateHeader = headers.find((h) =>
          h.toLowerCase().includes("date")
        );
        const amountHeader = headers.find((h) =>
          h.toLowerCase().includes("amount")
        );
        const descriptionHeader = headers.find(
          (h) =>
            h.toLowerCase().includes("description") ||
            h.toLowerCase().includes("desc")
        );

        if (dateHeader && amountHeader && descriptionHeader) {
          transaction.standardDate = transaction[dateHeader];
          transaction.standardAmount = Number.parseFloat(
            transaction[amountHeader].replace(/[^0-9.-]+/g, "")
          );
          transaction.standardDescription = transaction[descriptionHeader];
        }

        parsedTransactions.push(transaction);
      }

      return parsedTransactions;
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw error;
    }
  };

  const handleParseFile = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsedTransactions = parseCSV(content);
        setTransactions(parsedTransactions);
        setLoading(false);
      } catch (err) {
        console.error("Error parsing file:", err);
        setError(`Failed to parse file: ${err.message}`);
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file");
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (transactions.length === 0) {
      setError("No transactions to import");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setError("You must be logged in to import transactions");
        setLoading(false);
        return;
      }

      // Determine the correct collection name based on transaction type
      const collectionName =
        transactionType === "income" ? "income" : "expenses";
      const collectionRef = collection(db, collectionName);

      let successCount = 0;
      let errorCount = 0;

      for (const transaction of transactions) {
        try {
          // Prepare transaction data
          const transactionData = {
            userId: currentUser.uid,
            type: transactionType,
            description:
              transaction.standardDescription || "Imported transaction",
            amount: transaction.standardAmount || 0,
            date: transaction.standardDate
              ? new Date(transaction.standardDate)
              : new Date(),
            category: "Imported",
            createdAt: serverTimestamp(),
            rawData: transaction, // Store the original data for reference
          };

          // Add to Firestore
          await addDoc(collectionRef, transactionData);
          successCount++;
        } catch (err) {
          console.error("Error importing transaction:", err, transaction);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        setSuccess(
          `Imported ${successCount} transactions. ${errorCount} failed.`
        );
      } else {
        setSuccess(
          `Successfully imported ${successCount} ${transactionType} transactions`
        );
      }

      // Reset state
      setTransactions([]);
      setFile(null);
      document.getElementById("csv-file").value = "";
      setLoading(false);
    } catch (err) {
      console.error("Error importing transactions:", err);
      setError("Failed to import transactions. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="statement-import">
      <h2>Import Transactions</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="import-controls">
        <div className="transaction-type-selector">
          <label>Transaction Type:</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="expense"
                checked={transactionType === "expense"}
                onChange={() => setTransactionType("expense")}
              />
              Expense
            </label>
            <label>
              <input
                type="radio"
                value="income"
                checked={transactionType === "income"}
                onChange={() => setTransactionType("income")}
              />
              Income
            </label>
          </div>
        </div>

        <div className="file-input">
          <label htmlFor="csv-file">Select CSV File:</label>
          <input
            type="file"
            id="csv-file"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>

        <button
          onClick={handleParseFile}
          disabled={!file || loading}
          className="parse-btn"
        >
          {loading ? "Parsing..." : "Parse File"}
        </button>
      </div>

      {transactions.length > 0 && (
        <div className="transaction-preview">
          <h3>Preview ({transactions.length} transactions)</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(transactions[0]).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((transaction, index) => (
                  <tr key={index}>
                    {Object.values(transaction).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
                {transactions.length > 5 && (
                  <tr>
                    <td
                      colSpan={Object.keys(transactions[0]).length}
                      className="more-rows"
                    >
                      ... and {transactions.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            className="import-btn"
          >
            {loading ? "Importing..." : `Import as ${transactionType}`}
          </button>
        </div>
      )}

      <div className="import-instructions">
        <h3>Instructions</h3>
        <ol>
          <li>
            Select whether you're importing income or expense transactions
          </li>
          <li>Choose a CSV file from your bank or financial institution</li>
          <li>Click "Parse File" to preview the data</li>
          <li>Review the transactions and click "Import" to save them</li>
        </ol>
        <p>
          <strong>Note:</strong> Your CSV file should include columns for date,
          description, and amount at minimum.
        </p>
      </div>
    </div>
  );
};

export default StatementImport;
