import "../Css/Budget.css";

const BudgetSuggestions = ({ expenses, incomes }) => {
  // Check if expenses and incomes are defined before processing
  if (!expenses || !incomes) {
    return (
      <div className="budget-suggestions">Loading budget suggestions...</div>
    );
  }

  const generateSuggestions = () => {
    // Calculate total income and expenses
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });

    const suggestions = [];

    // Check overall spending
    if (totalExpense > totalIncome * 0.9) {
      suggestions.push(
        "Your expenses are approaching your income. Consider reducing non-essential spending."
      );
    }

    // Check if any category is taking up too much of the budget
    const categoryEntries = Object.entries(expensesByCategory || {});
    for (const [category, amount] of categoryEntries) {
      if (amount > totalIncome * 0.4) {
        suggestions.push(
          `${category} expenses are taking up more than 40% of your income. Consider ways to reduce this category.`
        );
      }
    }

    // Add general suggestions if we don't have specific ones
    if (suggestions.length === 0) {
      suggestions.push(
        "Your budget looks healthy! Consider saving more for future goals."
      );
      if (totalIncome > totalExpense * 1.5) {
        suggestions.push(
          "You have a good amount of extra income. Consider investing or saving more."
        );
      }
    }

    return suggestions;
  };

  const suggestions = generateSuggestions();

  return (
    <div className="budget-suggestions">
      <h3>Budget Suggestions</h3>
      {suggestions.length > 0 ? (
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      ) : (
        <p>No suggestions available at this time.</p>
      )}
    </div>
  );
};

export default BudgetSuggestions;
