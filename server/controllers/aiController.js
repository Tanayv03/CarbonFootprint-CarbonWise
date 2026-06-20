import { generateFootprintInsights } from '../services/gemini.js';

/**
 * Controller to analyze historical carbon footprint data and generate actionable recommendations using Gemini AI.
 * 
 * @async
 * @function analyzeFootprint
 * @param {import('express').Request} req - Express request object containing `footprintData` array in the body.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} JSON response with a `recommendations` array or an `error` message.
 */
export const analyzeFootprint = async (req, res) => {
  try {
    const { footprintData } = req.body;
    
    if (!footprintData || !Array.isArray(footprintData)) {
      return res.status(400).json({ error: 'Footprint data must be an array.' });
    }

    if (footprintData.length > 20) {
       return res.status(400).json({ error: 'Footprint data history is too large.' });
    }

    const insights = await generateFootprintInsights(footprintData);
    
    res.json({ recommendations: insights });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
};
