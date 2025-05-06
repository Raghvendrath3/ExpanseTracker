import "../Css/Budget.css";

const BudgetAlerts = ({ expenses, budgets }) => {
  // Check if expenses and budgets are defined before processing
  if (!expenses || !budgets) {
    return <div className="budget-alerts">Loading budget alerts...</div>;
  }

  // Group expenses by category
  const expensesByCategory = {};
  expenses.forEach((expense) => {
    const category = expense.category || "Uncategorized";
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = 0;
    }
    expensesByCategory[category] += expense.amount;
  });

  // Find categories that are over budget
  const overBudgetCategories = Object.keys(expensesByCategory).filter(
    (category) => {
      const budget = budgets[category];
      return budget && expensesByCategory[category] > budget;
    }
  );

  if (overBudgetCategories.length === 0) {
    return (
      <div className="budget-alerts">
        <h3>Budget Alerts</h3>
        <p className="no-alerts">No budget alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="budget-alerts">
      <h3>Budget Alerts</h3>
      {overBudgetCategories.map((category) => (
        <div key={category} className="alert">
          <p>
            <strong>{category}:</strong> You've spent $
            {expensesByCategory[category].toFixed(2)}, which is over your budget
            of ${budgets[category].toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BudgetAlerts;
