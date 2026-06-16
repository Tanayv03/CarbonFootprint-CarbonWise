import express from 'express';
import { saveFootprint, getHistory } from '../controllers/footprintController.js';

const router = express.Router();

// POST /api/footprint
router.post('/', saveFootprint);

// GET /api/footprint/:userId/history
router.get('/:userId/history', getHistory);

export default router;
