import express from 'express';
import { analyzeFootprint } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/analyze
router.post('/analyze', analyzeFootprint);

export default router;
