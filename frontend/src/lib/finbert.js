const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

export const analyzeFinancialSentiment = async (text) => {
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/ProsusAI/finbert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const data = await response.json();
    return data[0]?.label || "Neutral";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "Error";
  }
};
