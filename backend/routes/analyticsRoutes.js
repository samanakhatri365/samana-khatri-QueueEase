import express from 'express';
const router = express.Router();
import { getDailyStats, getDateRangeStats } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

// Get daily stats (today)
router.get('/daily', protect, getDailyStats);

// Get stats for a date range
router.get('/range', protect, getDateRangeStats);

export default router;
