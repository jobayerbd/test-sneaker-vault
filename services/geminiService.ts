import { GoogleGenAI } from "@google/genai";

// Initialize AI lazily or safely to prevent top-level crashes
let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (aiInstance) return aiInstance;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("SneakerVault: API_KEY is missing. AI features will use fallback descriptions.");
    return null;
  }
  
  try {
    aiInstance = new GoogleGenAI({ apiKey });
    return aiInstance;
  } catch (err) {
    console.error("SneakerVault: Failed to initialize Gemini AI", err);
    return null;
  }
};

export const generateHypeDescription = async (sneakerName: string, colorway: string) => {
  const ai = getAi();
  if (!ai) return "Premium quality meets iconic design in this limited edition release.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a premium, hype-inducing, and professional e-commerce description for a pair of sneakers called "${sneakerName}" in the "${colorway}" colorway. Focus on craftsmanship, cultural significance, and style. Keep it under 60 words.`,
    });
    return response.text || "A masterpiece of footwear engineering and street-ready style.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Premium craftsmanship meets cultural icon status in this essential sneaker.";
  }
};

export const getSmartRecommendations = async (sneakerName: string) => {
  // Simple fallback for recommendations
  return ["Nike Dunk Low", "Jordan 1 Mid", "Yeezy 350 V2"];
};