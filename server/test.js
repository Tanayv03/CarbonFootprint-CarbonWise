import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Generate a JSON array with one object {"id": 1, "title": "test"}. Return ONLY the JSON, no markdown.'
}).then(response => {
  console.log('RAW response.text:', response.text);
  console.log('Type of response.text:', typeof response.text);
}).catch(console.error);
