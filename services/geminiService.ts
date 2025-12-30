
import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly as required by the coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateHypeDescription = async (sneakerName: string, colorway: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a premium, hype-inducing, and professional e-commerce description for a pair of sneakers called "${sneakerName}" in the "${colorway}" colorway. Focus on craftsmanship, cultural significance, and style. Keep it under 60 words.`,
    });
    return response.text || "A masterpiece of footwear engineering and street-ready style.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Premium quality meets iconic design in this limited edition release.";
  }
};

export const getSmartRecommendations = async (sneakerName: string) => {
  // Mock logic or AI logic to suggest similar items
  // In a real app, we'd feed the full catalog to Gemini
  return ["Nike Dunk Low", "Jordan 1 Mid", "Yeezy 350 V2"];
};
