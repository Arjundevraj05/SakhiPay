const ANALYSIS_API_BASE =
  process.env.REACT_APP_ANALYSIS_API_URL || "http://localhost:4000";
const ANALYSIS_API_URL = `${ANALYSIS_API_BASE}/api/analyze-expenses`;

export const analyzeFinancialSentiment = async (text) => {
  try {
    const response = await fetch(ANALYSIS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || "Failed to analyze financial sentiment.");
    }

    const data = await response.json();
    return data?.sentiment || "neutral";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "Error";
  }
};
