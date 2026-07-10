import service from "../appwrite/config.js";

function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(amount) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function calculateExpenseAnalysis(expenses) {
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return { error: "No expenses to analyze." };
  }

  const total = expenses.reduce((sum, expense) => sum + toAmount(expense.amount), 0);
  const count = expenses.length;
  const average = total / count;

  const byCategory = expenses.reduce((groups, expense) => {
    const category = expense.category || "Other";
    groups[category] = (groups[category] || 0) + toAmount(expense.amount);
    return groups;
  }, {});

  const categoryBreakdown = Object.entries(byCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      share: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const topCategory = categoryBreakdown[0];
  const discretionary = ["Shopping", "Entertainment", "Other"];
  const essential = ["Food", "Transport", "Bills"];

  const discretionaryTotal = categoryBreakdown
    .filter((item) => discretionary.includes(item.category))
    .reduce((sum, item) => sum + item.amount, 0);

  const essentialTotal = categoryBreakdown
    .filter((item) => essential.includes(item.category))
    .reduce((sum, item) => sum + item.amount, 0);

  const discretionaryShare = total > 0 ? (discretionaryTotal / total) * 100 : 0;
  const essentialShare = total > 0 ? (essentialTotal / total) * 100 : 0;

  let sentiment = "neutral";
  let analysis = "";

  if (topCategory && topCategory.share >= 55) {
    sentiment = "negative";
    analysis = `${topCategory.category} makes up ${topCategory.share.toFixed(
      1
    )}% of your spending (${formatCurrency(
      topCategory.amount
    )}). Try setting a monthly cap for this category to balance your budget.`;
  } else if (discretionaryShare >= 45) {
    sentiment = "negative";
    analysis = `Discretionary spending is ${discretionaryShare.toFixed(
      1
    )}% of your total (${formatCurrency(
      discretionaryTotal
    )}). Consider reducing non-essential purchases this month.`;
  } else if (essentialShare >= 70 && average <= 1500) {
    sentiment = "positive";
    analysis =
      "Your spending focuses on essentials and your per-transaction average looks controlled. Keep tracking weekly to maintain this habit.";
  } else if (categoryBreakdown.length >= 3 && topCategory.share <= 40) {
    sentiment = "positive";
    analysis =
      "Your expenses are spread across multiple categories, which usually means a balanced spending pattern.";
  } else {
    sentiment = "neutral";
    analysis =
      "Your spending pattern looks stable. Review your top categories and set small savings targets for the next month.";
  }

  const breakdownText = categoryBreakdown
    .slice(0, 4)
    .map(
      (item) =>
        `${item.category}: ${formatCurrency(item.amount)} (${item.share.toFixed(1)}%)`
    )
    .join(" | ");

  return {
    sentiment,
    score: Number((sentiment === "positive" ? 0.78 : sentiment === "negative" ? 0.68 : 0.72).toFixed(2)),
    total,
    count,
    average,
    topCategory: topCategory?.category || "N/A",
    breakdownText,
    analysis,
    summary: `You recorded ${count} expenses totalling ${formatCurrency(
      total
    )} (avg ${formatCurrency(average)} per expense).`,
  };
}

export const analyzeExpenses = async () => {
  try {
    const response = await service.getExpenses();
    const expenses = response?.documents || [];
    return calculateExpenseAnalysis(expenses);
  } catch (error) {
    console.error("Error analyzing expenses:", error.message);
    return { error: "Unable to analyze expenses right now. Please try again." };
  }
};
