import axios from "axios";
import service from "../appwrite/config.js";

export const analyzeExpenses = async () => {
  try {
    const response = await service.getExpenses();
    const expenses = response?.documents || [];

    if (expenses.length === 0) {
      return { error: "No expenses to analyze." };
    }

    const expenseText = expenses
      .map(
        (exp) =>
          `Spent ₹${exp.amount} on ${exp.category}. Description: ${exp.description}`
      )
      .join(" ");

    // Proxied to the API server via package.json "proxy"
    const { data } = await axios.post(
      "/api/analyze-expenses",
      { text: expenseText },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("Error analyzing expenses:", error.response?.data || error.message);
    return {
      error: `Error fetching analysis: ${
        error.response?.data?.error ||
        "Unable to reach analysis server. Check that the API is deployed and reachable."
      }`,
    };
  }
};
