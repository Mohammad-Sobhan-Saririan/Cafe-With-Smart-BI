import express from 'express';
import { protect, barista } from '../middleware/authMiddleware.js';
import { getDashboardOrders, getPastOrders } from '../controllers/baristaController.js';

const router = express.Router();

// This route is protected by both 'protect' and 'barista' middleware
// It ensures only logged-in baristas or admins can access it.
router.get('/orders', protect, barista, getDashboardOrders);

router.get('/history', protect, barista, getPastOrders);

export default router;