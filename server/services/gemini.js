import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateFootprintInsights = async (footprintData) => {
  try {
    const prompt = `
    You are an expert environmental sustainability assistant. Analyze the following carbon footprint data for a user:
    ${JSON.stringify(footprintData, null, 2)}
    
    Based on this data, provide 3 highly personalized, actionable recommendations to help them reduce their carbon footprint.
    Return ONLY a valid JSON array of objects, with no markdown formatting or backticks. 
    Each object must have exactly these keys:
    - id: a unique integer
    - title: short title for the recommendation
    - description: detailed but concise advice based on their specific high-emission areas
    - savings: an estimate of monthly kg CO2 savings (e.g., "120 kg CO2/mo")
    - iconName: choose one of these exact strings representing Lucide icons: "TrendingDown", "Zap", "Lightbulb", "Car", "Coffee", "Droplets", "Trash2"
    - color: a valid tailwind text color class (e.g., "text-blue-500", "text-yellow-500", "text-green-500", "text-orange-500", "text-emerald-500")
    - bg: a valid tailwind background class matching the color (e.g., "bg-blue-100 dark:bg-blue-900/30")
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text;
    
    // Clean up potential markdown formatting from the response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error('Failed to generate insights from Gemini.');
  }
};
