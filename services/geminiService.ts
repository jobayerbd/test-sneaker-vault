
import { GoogleGenAI } from "@google/genai";

// Cache to store generated descriptions to save API quota
const descriptionCache = new Map<string, string>();

/**
 * Generates a hype-inducing e-commerce description for a sneaker using Gemini AI.
 * Implements caching and quota-efficient model selection.
 */
export const generateHypeDescription = async (sneakerName: string, colorway: string) => {
  const cacheKey = `${sneakerName}:${colorway}`.toLowerCase();
  
  // Return cached version if available to save quota
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!;
  }

  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Premium quality meets iconic design in this limited edition release.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Using gemini-flash-lite-latest for high-efficiency/low-quota overhead tasks
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Write a premium, hype-inducing, and professional e-commerce description for a pair of sneakers called "${sneakerName}" in the "${colorway}" colorway. Focus on craftsmanship and style. Keep it under 50 words.`,
    });
    
    const generatedText = response.text || "Premium quality meets iconic design in this limited edition release.";
    
    // Store in cache
    descriptionCache.set(cacheKey, generatedText);
    
    return generatedText;
  } catch (error: any) {
    // Check specifically for quota errors (429)
    if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) {
      console.warn("SneakerVault: Gemini quota exceeded. Using local fallback protocol.");
    } else {
      console.error("SneakerVault: Gemini Generation Error:", error);
    }
    
    return "Premium craftsmanship meets cultural icon status in this essential sneaker.";
  }
};

export const getSmartRecommendations = async (sneakerName: string) => {
  // Simple fallback for recommendations
  return ["Nike Dunk Low", "Jordan 1 Mid", "Yeezy 350 V2"];
};
