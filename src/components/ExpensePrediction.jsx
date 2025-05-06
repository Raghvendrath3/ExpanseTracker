"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, AlertTriangle, DollarSign, Calendar } from "lucide-react";
import "../Css/ExpensePrediction.css";

const ExpensePrediction = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState({
    nextMonth: null,
    byCategory: [],
    trend: [],
  });
  const [historicalData, setHistoricalData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchExpenseData();
  }, []);

  const fetchExpenseData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the last 6 months of expense data
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const expensesRef = collection(db, "expenses");
      const q = query(
        expensesRef,
        where("date", ">=", sixMonthsAgo),
        orderBy("date", "asc")
      );

      const querySnapshot = await getDocs(q);

      // Process the data
      const expenses = [];
      const categoryMap = new Map();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        expenses.push({
          id: doc.id,
          ...data,
          date: data.date.toDate(),
          amount: Number.parseFloat(data.amount) || 0,
        });

        // Track categories
        if (data.category) {
          if (!categoryMap.has(data.category)) {
            categoryMap.set(data.category, 0);
          }
          categoryMap.set(
            data.category,
            categoryMap.get(data.category) +
              (Number.parseFloat(data.amount) || 0)
          );
        }
      });

      // Sort categories by total amount
      const sortedCategories = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([category]) => category);

      setCategories(sortedCategories);

      // Group expenses by month
      const monthlyData = groupByMonth(expenses);
      setHistoricalData(monthlyData);

      // Generate predictions
      generatePredictions(monthlyData, expenses, sortedCategories);
    } catch (err) {
      console.error("Error fetching expense data:", err);
      setError("Failed to load expense data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const groupByMonth = (expenses) => {
    const monthlyMap = new Map();

    expenses.forEach((expense) => {
      const date = expense.date;
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString("default", { month: "short" });

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          year: date.getFullYear(),
          total: 0,
          count: 0,
          categories: new Map(),
        });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.total += expense.amount;
      monthData.count += 1;

      // Track by category
      if (expense.category) {
        if (!monthData.categories.has(expense.category)) {
          monthData.categories.set(expense.category, 0);
        }
        monthData.categories.set(
          expense.category,
          monthData.categories.get(expense.category) + expense.amount
        );
      }
    });

    // Convert to array and sort by date
    return Array.from(monthlyMap.entries())
      .map(([key, data]) => ({
        key,
        month: data.month,
        year: data.year,
        total: data.total,
        count: data.count,
        categories: Object.fromEntries(data.categories),
      }))
      .sort((a, b) => {
        const [aYear, aMonth] = a.key.split("-").map(Number);
        const [bYear, bMonth] = b.key.split("-").map(Number);
        return aYear !== bYear ? aYear - bYear : aMonth - bMonth;
      });
  };

  const generatePredictions = (monthlyData, expenses, categories) => {
    if (monthlyData.length < 2) {
      setPredictions({
        nextMonth: null,
        byCategory: [],
        trend: [],
      });
      return;
    }

    // Simple linear regression for next month prediction
    const nextMonthPrediction = predictNextMonth(monthlyData);

    // Predict expenses by category
    const categoryPredictions = predictByCategory(monthlyData, categories);

    // Generate trend data for the next 3 months
    const trendPredictions = predictTrend(monthlyData);

    setPredictions({
      nextMonth: nextMonthPrediction,
      byCategory: categoryPredictions,
      trend: trendPredictions,
    });
  };

  const predictNextMonth = (monthlyData) => {
    // Use simple moving average of the last 3 months
    const lastMonths = monthlyData.slice(-3);

    if (lastMonths.length === 0) return null;

    const sum = lastMonths.reduce((acc, month) => acc + month.total, 0);
    const average = sum / lastMonths.length;

    // Calculate month-over-month growth rate
    let growthRate = 0;
    if (lastMonths.length >= 2) {
      const lastMonth = lastMonths[lastMonths.length - 1].total;
      const previousMonth = lastMonths[lastMonths.length - 2].total;
      if (previousMonth > 0) {
        growthRate = (lastMonth - previousMonth) / previousMonth;
      }
    }

    // Apply growth rate to the average
    const prediction = average * (1 + growthRate);

    // Get next month name
    const lastDate = new Date();
    lastDate.setMonth(lastDate.getMonth() + 1);
    const nextMonthName = lastDate.toLocaleString("default", { month: "long" });

    return {
      month: nextMonthName,
      amount: prediction,
      growthRate,
    };
  };

  const predictByCategory = (monthlyData, categories) => {
    // Only use top 5 categories
    const topCategories = categories.slice(0, 5);

    return topCategories.map((category) => {
      // Get the last 3 months of data for this category
      const categoryData = monthlyData.slice(-3).map((month) => {
        return {
          month: month.month,
          amount: month.categories[category] || 0,
        };
      });

      // Calculate average
      const sum = categoryData.reduce((acc, data) => acc + data.amount, 0);
      const average = sum / categoryData.length || 0;

      // Calculate growth rate if possible
      let growthRate = 0;
      if (categoryData.length >= 2) {
        const last = categoryData[categoryData.length - 1].amount;
        const previous = categoryData[categoryData.length - 2].amount;
        if (previous > 0) {
          growthRate = (last - previous) / previous;
        }
      }

      // Predict next month
      const prediction = average * (1 + growthRate);

      return {
        category,
        prediction,
        growthRate,
        historical: categoryData,
      };
    });
  };

  const predictTrend = (monthlyData) => {
    if (monthlyData.length < 3) return [];

    // Get the last 6 months or all available data
    const recentMonths = monthlyData.slice(-6);

    // Calculate average month-over-month change
    let totalGrowthRate = 0;
    let count = 0;

    for (let i = 1; i < recentMonths.length; i++) {
      const current = recentMonths[i].total;
      const previous = recentMonths[i - 1].total;

      if (previous > 0) {
        totalGrowthRate += (current - previous) / previous;
        count++;
      }
    }

    const avgGrowthRate = count > 0 ? totalGrowthRate / count : 0;

    // Generate predictions for the next 3 months
    const lastMonth = recentMonths[recentMonths.length - 1];
    const lastDate = new Date(
      lastMonth.year,
      lastMonth.month === "Dec" ? 0 : new Date().getMonth() + 1,
      1
    );

    const trend = [...recentMonths];

    let previousAmount = lastMonth.total;

    for (let i = 1; i <= 3; i++) {
      const predictionDate = new Date(lastDate);
      predictionDate.setMonth(lastDate.getMonth() + i);

      const predictedAmount = previousAmount * (1 + avgGrowthRate);

      trend.push({
        key: `prediction-${i}`,
        month: predictionDate.toLocaleString("default", { month: "short" }),
        year: predictionDate.getFullYear(),
        total: predictedAmount,
        isPrediction: true,
      });

      previousAmount = predictedAmount;
    }

    return trend;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getGrowthIndicator = (growthRate) => {
    if (growthRate > 0.05) return "increasing";
    if (growthRate < -0.05) return "decreasing";
    return "stable";
  };

  if (loading) {
    return (
      <div className="expense-prediction loading">
        <div className="loading-spinner"></div>
        <p>Analyzing your expense patterns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="expense-prediction error">
        <AlertTriangle size={24} />
        <h3>Unable to generate predictions</h3>
        <p>{error}</p>
        <button onClick={fetchExpenseData}>Try Again</button>
      </div>
    );
  }

  if (historicalData.length < 2) {
    return (
      <div className="expense-prediction insufficient-data">
        <AlertTriangle size={24} />
        <h3>Not enough data for predictions</h3>
        <p>
          Add more expenses over time to see predictions. We need at least 2
          months of data.
        </p>
      </div>
    );
  }

  return (
    <div className="expense-prediction">
      <h2>Expense Predictions</h2>

      {predictions.nextMonth && (
        <div className="prediction-card next-month">
          <div className="card-header">
            <h3>Next Month Prediction</h3>
            <Calendar size={20} />
          </div>
          <div className="prediction-amount">
            <DollarSign size={24} />
            <span>{formatCurrency(predictions.nextMonth.amount)}</span>
          </div>
          <div
            className={`growth-indicator ${getGrowthIndicator(
              predictions.nextMonth.growthRate
            )}`}
          >
            <TrendingUp size={16} />
            <span>
              {predictions.nextMonth.growthRate > 0
                ? `+${(predictions.nextMonth.growthRate * 100).toFixed(1)}%`
                : `${(predictions.nextMonth.growthRate * 100).toFixed(1)}%`}
            </span>
            <span className="month-name">in {predictions.nextMonth.month}</span>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>Expense Trend</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={predictions.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(value, index) => {
                  const item = predictions.trend[index];
                  return item ? `${item.month} ${item.year}` : value;
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    const item = payload[0].payload;
                    return `${item.month} ${item.year}${
                      item.isPrediction ? " (Predicted)" : ""
                    }`;
                  }
                  return value;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="total"
                name="Total Expenses"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {predictions.byCategory.length > 0 && (
        <div className="chart-container">
          <h3>Predicted Expenses by Category</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={predictions.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar
                  dataKey="prediction"
                  name="Predicted Amount"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="prediction-disclaimer">
        <p>
          <strong>Note:</strong> Predictions are based on your historical
          spending patterns. Actual expenses may vary based on your financial
          behavior and unexpected costs.
        </p>
      </div>
    </div>
  );
};

export default ExpensePrediction;
