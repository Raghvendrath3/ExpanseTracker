import { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import "./Analytics.css";
import { db, auth } from "../firebaseConfig.js";
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

function Analytics() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expensesByCategory, setExpensesByCategory] = useState(null);
  const [expensesByDate, setExpensesByDate] = useState(null);
  const [incomeVsExpense, setIncomeVsExpense] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all"); // Options: all, month, week
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  
  // Currency symbol - using ₹ consistently
  const currencySymbol = "₹";

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setError("User not authenticated. Please log in to view analytics.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter data based on date range
  const filterDataByDateRange = (data, range) => {
    if (range === "all") return data;
    
    const now = new Date();
    let cutoffDate;
    
    if (range === "month") {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
    } else if (range === "week") {
      cutoffDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const userDocRef = doc(db, "users", userId);

        // Fetch payments for categorization
        const paymentsCollectionRef = collection(userDocRef, "payments");
        const paymentsSnapshot = await getDocs(paymentsCollectionRef);
        const paymentsData = [];

        paymentsSnapshot.forEach((doc) => {
          paymentsData.push(doc.data());
        });

        // Filter data based on selected date range
        const filteredData = filterDataByDateRange(paymentsData, dateRange);

        // Process expenses by category
        const expenseCategories = {};
        const expensesByDateMap = {};
        const incomeData = [];
        const expenseData = [];
        let incomeTotal = 0;
        let expenseTotal = 0;

        filteredData.forEach((payment) => {
          const date = payment.date;
          const amount = parseFloat(payment.amount);
          const category = payment.category || "Uncategorized";

          // For category chart
          if (amount < 0) {
            // It's an expense
            if (!expenseCategories[category]) {
              expenseCategories[category] = 0;
            }
            expenseCategories[category] += Math.abs(amount);
            expenseTotal += Math.abs(amount);
          } else {
            incomeTotal += amount;
          }

          // For expense by date chart
          if (!expensesByDateMap[date]) {
            expensesByDateMap[date] = {
              expenses: 0,
              income: 0,
            };
          }

          if (amount < 0) {
            expensesByDateMap[date].expenses += Math.abs(amount);
          } else {
            expensesByDateMap[date].income += amount;
          }

          // For income vs expense comparison
          if (amount < 0) {
            expenseData.push({
              date,
              amount: Math.abs(amount),
            });
          } else {
            incomeData.push({
              date,
              amount,
            });
          }
        });

        setTotalIncome(incomeTotal);
        setTotalExpense(expenseTotal);

        // Prepare expense by category chart data
        const categoryLabels = Object.keys(expenseCategories);
        const categoryValues = Object.values(expenseCategories);

        // Generate a pleasing color palette (soft pastels)
        const backgroundColors = [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(199, 199, 199, 0.7)",
          "rgba(83, 102, 255, 0.7)",
          "rgba(78, 205, 196, 0.7)",
          "rgba(255, 184, 108, 0.7)",
        ];

        // Repeat the colors if we have more categories than colors
        const categoryColors = categoryLabels.map(
          (_, i) => backgroundColors[i % backgroundColors.length]
        );

        setExpensesByCategory({
          labels: categoryLabels,
          datasets: [
            {
              label: "Expenses by Category",
              data: categoryValues,
              backgroundColor: categoryColors,
              borderColor: categoryColors.map((color) =>
                color.replace("0.7", "1")
              ),
              borderWidth: 1,
            },
          ],
        });

        // Prepare expenses by date chart data
        const sortedDates = Object.keys(expensesByDateMap).sort();
        const expensesTimeData = sortedDates.map((date) => ({
          x: date,
          y: expensesByDateMap[date].expenses,
        }));

        setExpensesByDate({
          labels: sortedDates,
          datasets: [
            {
              label: "Daily Expenses",
              data: expensesTimeData,
              fill: true,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 0.8)",
              tension: 0.3,
              pointRadius: 3,
              pointBackgroundColor: "rgba(54, 162, 235, 1)",
            },
          ],
        });

        // Prepare income vs expense chart
        // Aggregate data by month for a cleaner view
        const monthlyData = {};

        [
          ...incomeData,
          ...expenseData.map((item) => ({ ...item, isExpense: true })),
        ].forEach((item) => {
          const date = item.date;
          const month = date.substring(0, 7); // Get YYYY-MM format

          if (!monthlyData[month]) {
            monthlyData[month] = {
              income: 0,
              expenses: 0,
            };
          }

          if (item.isExpense) {
            monthlyData[month].expenses += item.amount;
          } else {
            monthlyData[month].income += item.amount;
          }
        });

        const monthLabels = Object.keys(monthlyData).sort();

        setIncomeVsExpense({
          labels: monthLabels,
          datasets: [
            {
              label: "Income",
              data: monthLabels.map((month) => monthlyData[month].income),
              backgroundColor: "rgba(75, 192, 192, 0.7)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
            {
              label: "Expenses",
              data: monthLabels.map((month) => monthlyData[month].expenses),
              backgroundColor: "rgba(255, 99, 132, 0.7)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase: ", error);
        setError("Failed to load analytics data. Please try again later.");
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, dateRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: "#333",
        bodyColor: "#666",
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 13,
          weight: "bold",
        },
        padding: 12,
        borderColor: "#e2e8f0",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
  };

  if (error) {
    return <div className="analytics-error">{error}</div>;
  }

  if (loading) {
    return (
      <div className="analytics-loading">
        Loading your financial insights...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>Financial Insights</h2>
          <p>
            Visualize your spending patterns and financial health at a glance
          </p>
        </div>

        {/* Date range selector */}
        <div className="date-range-selector">
          <label>Time Period: </label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="date-range-select"
          >
            <option value="all">All Time</option>
            <option value="month">Last Month</option>
            <option value="week">Last Week</option>
          </select>
        </div>

        {/* Summary cards */}
        <div className="summary-cards">
          <div className="summary-card income">
            <h4>Total Income</h4>
            <p>{currencySymbol}{totalIncome.toFixed(2)}</p>
          </div>
          <div className="summary-card expense">
            <h4>Total Expenses</h4>
            <p>{currencySymbol}{totalExpense.toFixed(2)}</p>
          </div>
          <div className="summary-card balance">
            <h4>Net Balance</h4>
            <p>{currencySymbol}{(totalIncome - totalExpense).toFixed(2)}</p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Spending by Category</h3>
            <div className="chart-container">
              {expensesByCategory && expensesByCategory.labels.length > 0 ? (
                <Pie
                  data={expensesByCategory}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      datalabels: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <div className="no-data">
                  No category data available yet. Add some transactions to see
                  insights.
                </div>
              )}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Daily Spending Trend</h3>
            <div className="chart-container">
              {expensesByDate && expensesByDate.labels.length > 0 ? (
                <Line
                  data={expensesByDate}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.05)",
                        },
                        ticks: {
                          callback: function (value) {
                            return currencySymbol + value;
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="no-data">
                  No timeline data available yet. Track your daily expenses to
                  see trends.
                </div>
              )}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Income vs Expenses</h3>
            <div className="chart-container">
              {incomeVsExpense && incomeVsExpense.labels.length > 0 ? (
                <Bar
                  data={incomeVsExpense}
                  options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: "rgba(0, 0, 0, 0.05)",
                        },
                        ticks: {
                          callback: function (value) {
                            return currencySymbol + value;
                          },
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              ) : (
                <div className="no-data">
                  No comparison data available yet. Record both income and
                  expenses to see balance.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;