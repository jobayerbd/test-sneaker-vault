import { GoogleGenAI } from "@google/genai";

/**
 * Generates a hype-inducing e-commerce description for a sneaker using Gemini AI.
 * Follows @google/genai guidelines: creates a new instance for each call.
 */
export const generateHypeDescription = async (sneakerName: string, colorway: string) => {
  try {
    // Guidelines: Always use new GoogleGenAI({apiKey: process.env.API_KEY})
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a premium, hype-inducing, and professional e-commerce description for a pair of sneakers called "${sneakerName}" in the "${colorway}" colorway. Focus on craftsmanship, cultural significance, and style. Keep it under 60 words.`,
    });
    
    // Guidelines: Access the extracted string directly via the .text property (not a method).
    return response.text || "Premium quality meets iconic design in this limited edition release.";
  } catch (error) {
    console.error("SneakerVault: Gemini Generation Error:", error);
    return "Premium craftsmanship meets cultural icon status in this essential sneaker.";
  }
};

export const getSmartRecommendations = async (sneakerName: string) => {
  // Simple fallback for recommendations
  return ["Nike Dunk Low", "Jordan 1 Mid", "Yeezy 350 V2"];
};