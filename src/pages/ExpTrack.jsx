import React, {useCallback, useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import Navigation from "../components/Navigation";
import BalanceHeader from "../components/BalanceHeader";
import TabNavigation from "../components/TabNavigation";
import ExpenseTab from "../components/ExpenseTab.jsx";
import IncomeTab from "../components/IncomeTab";
import QuickAddTab from "../components/QuickAddTab";
import PaymentHistoryTab from "../components/PaymentHistoryTab";
import SettingsTab from "../components/SettingTab.jsx";
import SyncFooter from "../components/SyncFooter";

const ExpTrack = () => {
  // State variables
  const [userId, setUserId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [customButtons, setCustomButtons] = useState([]);
  const [buttonName, setButtonName] = useState("");
  const [buttonAmount, setButtonAmount] = useState("");
  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [incomeSource, setIncomeSource] = useState("");
  const [incomeAmount, setIncomeAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState("expenses");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentCategory, setPaymentCategory] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  // Authentication and initial data loading
  const handleAuthentication = async () => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          signInAnonymously(auth).catch((error) => {
            console.error("Error signing in anonymously:", error);
          });
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  useEffect(() => {
    handleAuthentication();
  }, []);


  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  useEffect(() => {
    window.onbeforeunload = () =>
      "Are you sure you want to leave? Your data will be saved.";
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => {
      window.onbeforeunload = null;
      clearTimeout(timer);
    };
  }, []);

  // Wrap saveDataToFirestore in useCallback
  const saveDataToFirestore = useCallback(async () => {
    if (!userId) return;
    try {
      setIsSyncing(true);
      const userDocRef = doc(db, "users", userId);

      // Clear existing expenses
      const expensesCollectionRef = collection(userDocRef, "expenses");
      const expensesSnapshot = await getDocs(expensesCollectionRef);
      const deletePromises = [];
      expensesSnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(expensesCollectionRef, document.id)));
      });
      await Promise.all(deletePromises);

      // Add all current expenses
      const addPromises = expenses.map((expense) =>
        addDoc(expensesCollectionRef, {
          name: expense.name,
          amount: expense.amount,
          date: expense.date,
          timestamp: new Date(),
        })
      );
      await Promise.all(addPromises);

      // Save total amount
      const totalAmountDocRef = doc(
        collection(userDocRef, "userData"),
        "totalAmount"
      );
      await setDoc(totalAmountDocRef, { amount: totalAmount });

      // Save custom buttons
      const customButtonsDocRef = doc(
        collection(userDocRef, "userData"),
        "customButtons"
      );
      await setDoc(customButtonsDocRef, { buttons: customButtons });

      // Save payments
      const paymentsCollectionRef = collection(userDocRef, "payments");
      const paymentsSnapshot = await getDocs(paymentsCollectionRef);
      const deletePaymentPromises = [];
      paymentsSnapshot.forEach((document) => {
        deletePaymentPromises.push(
          deleteDoc(doc(paymentsCollectionRef, document.id))
        );
      });
      await Promise.all(deletePaymentPromises);
      const addPaymentPromises = payments.map((payment) =>
        addDoc(paymentsCollectionRef, {
          name: payment.name,
          amount: payment.amount,
          date: payment.date,
          category: payment.category,
          note: payment.note,
          timestamp: new Date(),
        })
      );
      await Promise.all(addPaymentPromises);

      setSyncStatus({ success: true, message: "Data saved to cloud" });
      setIsSyncing(false);
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setSyncStatus({ success: false, message: "Failed to save to cloud" });
      setIsSyncing(false);
    }
  }, [expenses, totalAmount, customButtons, payments, userId]);

  // Then update your effect to include saveDataToFirestore:
  useEffect(() => {
    if (userId) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
      localStorage.setItem("totalAmount", totalAmount);
      localStorage.setItem("customButtons", JSON.stringify(customButtons));
      localStorage.setItem("payments", JSON.stringify(payments));
      saveDataToFirestore();
    }
  }, [
    expenses,
    totalAmount,
    customButtons,
    payments,
    userId,
    saveDataToFirestore,
  ]);

  const loadData = async () => {
    try {
      setIsSyncing(true);
      // Load from localStorage
      const storedExpenses = localStorage.getItem("expenses");
      const storedTotalAmount = localStorage.getItem("totalAmount");
      const storedButtons = localStorage.getItem("customButtons");
      const storedPayments = localStorage.getItem("payments");

      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      if (storedTotalAmount) setTotalAmount(storedTotalAmount);
      if (storedButtons) setCustomButtons(JSON.parse(storedButtons));
      if (storedPayments) setPayments(JSON.parse(storedPayments));

      // Load from Firestore
      try {
        const userDocRef = doc(db, "users", userId);
        const expensesCollectionRef = collection(userDocRef, "expenses");
        const expensesSnapshot = await getDocs(expensesCollectionRef);
        const firestoreExpenses = [];
        expensesSnapshot.forEach((doc) => {
          firestoreExpenses.push({ id: doc.id, ...doc.data() });
        });

        const userDataCollectionRef = collection(userDocRef, "userData");
        const userDataSnapshot = await getDocs(userDataCollectionRef);
        let firestoreTotalAmount = "";
        let firestoreCustomButtons = [];
        userDataSnapshot.forEach((doc) => {
          if (doc.id === "totalAmount") {
            firestoreTotalAmount = doc.data().amount;
          } else if (doc.id === "customButtons") {
            firestoreCustomButtons = doc.data().buttons;
          }
        });

        const paymentsCollectionRef = collection(userDocRef, "payments");
        const paymentsSnapshot = await getDocs(paymentsCollectionRef);
        const firestorePayments = [];
        paymentsSnapshot.forEach((doc) => {
          firestorePayments.push({ id: doc.id, ...doc.data() });
        });

        if (firestoreExpenses.length > 0) {
          setExpenses(firestoreExpenses);
          localStorage.setItem("expenses", JSON.stringify(firestoreExpenses));
        }
        if (firestoreTotalAmount) {
          setTotalAmount(firestoreTotalAmount);
          localStorage.setItem("totalAmount", firestoreTotalAmount);
        }
        if (firestoreCustomButtons && firestoreCustomButtons.length > 0) {
          setCustomButtons(firestoreCustomButtons);
          localStorage.setItem(
            "customButtons",
            JSON.stringify(firestoreCustomButtons)
          );
        }
        if (firestorePayments.length > 0) {
          setPayments(firestorePayments);
          localStorage.setItem("payments", JSON.stringify(firestorePayments));
        }
        setSyncStatus({ success: true, message: "Data synced from cloud" });
      } catch (error) {
        console.error("Error loading from Firestore:", error);
        setSyncStatus({ success: false, message: "Failed to sync from cloud" });
      }
      setIsSyncing(false);
    } catch (e) {
      console.error("Failed to load data", e);
      setIsSyncing(false);
      setSyncStatus({ success: false, message: "Error syncing data" });
    }
  };

  const navigateHome = () => {
    if (
      window.confirm("Navigate to home page? Any unsaved changes may be lost.")
    ) {
      window.location.href = "/";
    }
  };

  const addIncome = (source, amount) => {
    if (source && amount) {
      setTotalAmount(
        (prevTotal) => parseFloat(prevTotal || 0) + parseFloat(amount)
      );
      const date = new Date().toISOString().split("T")[0];
      const newPayment = {
        name: source,
        amount: parseFloat(amount),
        date,
        category: "Income",
        note: "Income added",
        timestamp: new Date(),
      };
      setPayments([...payments, newPayment]);
      setIncomeSource("");
      setIncomeAmount("");
    }
  };

  const addExpense = (name, amount) => {
    if (name && amount) {
      const date = expenseDate || new Date().toISOString().split("T")[0];
      setExpenses([...expenses, { name, amount: parseFloat(amount), date }]);
      const newPayment = {
        name,
        amount: -parseFloat(amount),
        date,
        category: paymentCategory || "General",
        note: paymentNote || "",
        timestamp: new Date(),
      };
      setPayments([...payments, newPayment]);
      setExpenseName("");
      setExpenseAmount("");
      setPaymentCategory("");
      setPaymentNote("");
    }
  };

  const deleteExpense = (expenseToDelete) => {
    const actualIndex = expenses.findIndex(
      (e) =>
        e.name === expenseToDelete.name &&
        e.amount === expenseToDelete.amount &&
        e.date === expenseToDelete.date
    );
    if (actualIndex !== -1) {
      setExpenses(expenses.filter((_, i) => i !== actualIndex));
    }
  };

  const editExpense = (expenseToEdit) => {
    const actualIndex = expenses.findIndex(
      (e) =>
        e.name === expenseToEdit.name &&
        e.amount === expenseToEdit.amount &&
        e.date === expenseToEdit.date
    );
    if (actualIndex === -1) return;
    const newName = prompt("Enter new name:", expenseToEdit.name);
    const newAmount = prompt("Enter new amount:", expenseToEdit.amount);
    const newDate = prompt("Enter new date (YYYY-MM-DD):", expenseToEdit.date);
    if (newName !== null && newAmount !== null) {
      const updatedExpenses = expenses.map((expense, i) =>
        i === actualIndex
          ? {
              ...expense,
              name: newName,
              amount: parseFloat(newAmount),
              date:
                newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)
                  ? newDate
                  : expense.date,
            }
          : expense
      );
      setExpenses(updatedExpenses);
      const paymentIndex = payments.findIndex(
        (p) =>
          p.name === expenseToEdit.name &&
          Math.abs(p.amount) === expenseToEdit.amount &&
          p.date === expenseToEdit.date
      );
      if (paymentIndex !== -1) {
        const updatedPayments = [...payments];
        updatedPayments[paymentIndex] = {
          ...updatedPayments[paymentIndex],
          name: newName,
          amount: -parseFloat(newAmount),
          date:
            newDate && newDate.match(/^\d{4}-\d{2}-\d{2}$/)
              ? newDate
              : updatedPayments[paymentIndex].date,
        };
        setPayments(updatedPayments);
      }
    }
  };

  const addCustomButton = () => {
    if (buttonName && buttonAmount) {
      setCustomButtons([
        ...customButtons,
        { name: buttonName, amount: parseFloat(buttonAmount) },
      ]);
      setButtonName("");
      setButtonAmount("");
    }
  };

  const deleteCustomButton = (index) => {
    setCustomButtons(customButtons.filter((_, i) => i !== index));
  };

  const calculateTotalSpent = () =>
    expenses.reduce((total, expense) => total + expense.amount, 0);
  const calculateRemaining = () =>
    (parseFloat(totalAmount) || 0) - calculateTotalSpent();

  const resetData = () => {
    if (window.confirm("Are you sure you want to reset all data?")) {
      setExpenses([]);
      setTotalAmount("");
      setCustomButtons([]);
      setPayments([]);
      localStorage.clear();
      if (userId) {
        clearFirestoreData();
      }
    }
  };

  const clearFirestoreData = async () => {
    if (!userId) return;
    try {
      setIsSyncing(true);
      const userDocRef = doc(db, "users", userId);
      const expensesCollectionRef = collection(userDocRef, "expenses");
      const expensesSnapshot = await getDocs(expensesCollectionRef);
      const deletePromises = [];
      expensesSnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(expensesCollectionRef, document.id)));
      });
      const userDataCollectionRef = collection(userDocRef, "userData");
      const userDataSnapshot = await getDocs(userDataCollectionRef);
      userDataSnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(userDataCollectionRef, document.id)));
      });
      const paymentsCollectionRef = collection(userDocRef, "payments");
      const paymentsSnapshot = await getDocs(paymentsCollectionRef);
      paymentsSnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(paymentsCollectionRef, document.id)));
      });
      await Promise.all(deletePromises);
      setSyncStatus({ success: true, message: "All data cleared" });
      setIsSyncing(false);
    } catch (error) {
      console.error("Error clearing Firestore data:", error);
      setSyncStatus({ success: false, message: "Failed to clear cloud data" });
      setIsSyncing(false);
    }
  };

  // Prepare grouped data for display
  const filteredExpenses =
    filterDate === "all"
      ? expenses
      : expenses.filter((expense) => expense.date === filterDate);
  const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {});
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const groupedPayments = payments.reduce((acc, payment) => {
    const date = payment.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(payment);
    return acc;
  }, {});
  const sortedPaymentDates = Object.keys(groupedPayments).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const forceSync = () => {
    loadData();
    saveDataToFirestore();
  };

  if (loading) {
    return (
      <div className="preloader">
        <div className="spinner"></div>
        <p>Loading Expense Tracker...</p>
      </div>
    );
  }

  return (
    <div className="expense-tracker">
      <Navigation
        navigateHome={navigateHome}
        syncStatus={syncStatus}
        isSyncing={isSyncing}
      />
      <BalanceHeader
        totalAmount={totalAmount}
        calculateTotalSpent={calculateTotalSpent}
        calculateRemaining={calculateRemaining}
      />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="tab-content">
        {activeTab === "expenses" && (
          <ExpenseTab
            expenseName={expenseName}
            setExpenseName={setExpenseName}
            expenseAmount={expenseAmount}
            setExpenseAmount={setExpenseAmount}
            expenseDate={expenseDate}
            setExpenseDate={setExpenseDate}
            paymentCategory={paymentCategory}
            setPaymentCategory={setPaymentCategory}
            paymentNote={paymentNote}
            setPaymentNote={setPaymentNote}
            addExpense={addExpense}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            customButtons={customButtons}
            groupedExpenses={groupedExpenses}
            formatDate={formatDate}
            editExpense={editExpense}
            deleteExpense={deleteExpense}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "income" && (
          <IncomeTab
            incomeSource={incomeSource}
            setIncomeSource={setIncomeSource}
            incomeAmount={incomeAmount}
            setIncomeAmount={setIncomeAmount}
            addIncome={addIncome}
            totalAmount={totalAmount}
            setTotalAmount={setTotalAmount}
            setSyncStatus={setSyncStatus}
          />
        )}
        {activeTab === "quickAdd" && (
          <QuickAddTab
            buttonName={buttonName}
            setButtonName={setButtonName}
            buttonAmount={buttonAmount}
            setButtonAmount={setButtonAmount}
            addCustomButton={addCustomButton}
            customButtons={customButtons}
            deleteCustomButton={deleteCustomButton}
            addExpense={addExpense}
          />
        )}
        {activeTab === "paymentHistory" && (
          <PaymentHistoryTab
            groupedPayments={groupedPayments}
            sortedPaymentDates={sortedPaymentDates}
            formatDate={formatDate}
            payments={payments}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab
            resetData={resetData}
            forceSync={forceSync}
            userId={userId}
            totalAmount={totalAmount}
            customButtons={customButtons}
            payments={payments}
            expenses={expenses}
            setSyncStatus={setSyncStatus}
          />
        )}
      </div>
      <SyncFooter forceSync={forceSync} isSyncing={isSyncing} />
    </div>
  );
};

export default ExpTrack;