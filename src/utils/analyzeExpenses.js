import axios from "axios";
import service from "../appwrite/config.js"; // Ensure this path is correct

const ANALYSIS_API_BASE =
  process.env.REACT_APP_ANALYSIS_API_URL || "http://localhost:4000";
const ANALYSIS_API_URL = `${ANALYSIS_API_BASE}/api/analyze-expenses`;

export const analyzeExpenses = async () => {
  try {
    // Fetch expenses from Appwrite
    const response = await service.getExpenses();
    const expenses = response?.documents || [];

    if (expenses.length === 0) {
      return { error: "No expenses to analyze." };
    }

    // Convert expenses into a single text input
    const expenseText = expenses
      .map((exp) => `Spent ₹${exp.amount} on ${exp.category}. Description: ${exp.description}`)
      .join(" ");

    // Send request to backend analysis endpoint (which calls FinBERT server-side)
    const { data } = await axios.post(
      ANALYSIS_API_URL,
      { text: expenseText },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error) {
    console.error("Error analyzing expenses:", error.response?.data || error.message);
    return {
      error: `Error fetching analysis: ${
        error.response?.data?.error ||
        "Unable to reach analysis server. Start backend on port 4000."
      }`,
    };
  }
};
