import axios from "axios";
import service from "../appwrite/config.js"; // Ensure this path is correct

const API_URL = "https://api-inference.huggingface.co/models/ProsusAI/finbert";
const API_KEY = "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"; // Use environment variable

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

    // Send request to Hugging Face API
    const { data } = await axios.post(
      API_URL,
      { inputs: expenseText },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 🔥 Debug: Log Full API Response
    console.log("API Response:", JSON.stringify(data, null, 2));

    // ✅ Correctly Extract Sentiment Data
    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) {
      return { error: "Invalid API response format." };
    }

    const sentimentArray = data[0]; // Extract the inner array

    if (sentimentArray.length === 0) {
      return { error: "No sentiment data received." };
    }

    // ✅ Find the sentiment with the highest confidence score
    const highestConfidenceSentiment = sentimentArray.reduce((prev, curr) =>
      prev.score > curr.score ? prev : curr
    );

    if (!highestConfidenceSentiment || !highestConfidenceSentiment.label) {
      return { error: "Unable to determine sentiment." };
    }

    // ✅ Generate a meaningful analysis description
    let sentimentDescription = "";

    switch (highestConfidenceSentiment.label) {
      case "positive":
        sentimentDescription =
          "Your spending behavior looks positive! It indicates a well-balanced financial approach.";
        break;
      case "neutral":
        sentimentDescription =
          "Your spending pattern is stable. Consider reviewing it periodically for financial health.";
        break;
      case "negative":
        sentimentDescription =
          "Your expenses might indicate financial stress. Try tracking and optimizing your spending.";
        break;
      default:
        sentimentDescription = "Analysis inconclusive. Try adding more expenses for better insights.";
    }

    return {
      sentiment: highestConfidenceSentiment.label,
      score: highestConfidenceSentiment.score,
      analysis: sentimentDescription,
    };
  } catch (error) {
    console.error("Error analyzing expenses:", error.response?.data || error.message);
    return { error: `Error fetching analysis: ${error.response?.data?.error || error.message}` };
  }
};
