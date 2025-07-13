import express from 'express';
import { runReportQuery } from '../controllers/reportingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is protected for admins only
router.post('/run', runReportQuery);

export default router;