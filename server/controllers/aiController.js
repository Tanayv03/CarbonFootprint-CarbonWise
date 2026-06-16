import { generateFootprintInsights } from '../services/gemini.js';

export const analyzeFootprint = async (req, res) => {
  try {
    const { footprintData } = req.body;
    
    if (!footprintData) {
      return res.status(400).json({ error: 'Footprint data is required.' });
    }

    const insights = await generateFootprintInsights(footprintData);
    
    res.json({ recommendations: insights });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
};
